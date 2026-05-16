import express from "express";
import dotenv from "dotenv";
import { createServer } from "http"; // 1. Import HTTP createServer
import { Server } from "socket.io"; // 2. Import Socket.io
import helmet from "helmet";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import cors from "cors";
import csurf from "csurf";
import uploadRoutes from "./routes/uploadRoutes.js";
import uploadProfileRoutes from "./routes/uploadProfileRoutes.js";
import User from "./models/userModel.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { startSubscriptionExpirationCron } from "./jobs/subscriptionExpirationJob.js";

dotenv.config();

// ---- Validate required environment variables at startup ----
const REQUIRED_ENV = [
  "MONGO_URI",
  "JWT_SECRET",
  "REFRESH_JWT_SECRET",
  "GMAIL_USER",
  "GMAIL_PASS",
];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

connectDB();
startSubscriptionExpirationCron();

const app = express();
const port = 9090;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

// ---- Allowed origins whitelist ----
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
};

// 3. Wrap Express app with HTTP Server
const httpServer = createServer(app);

// 4. Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
const csrfProtection = csurf({
  cookie: {
    key: "csrfSecret",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
});
app.use(csrfProtection);
app.use((req, res, next) => {
  const sanitizeRequestObject = (target) => {
    if (!target || typeof target !== "object") return;

    Object.keys(target).forEach((key) => {
      if (key.startsWith("$") || key.includes(".")) {
        delete target[key];
        return;
      }
      sanitizeRequestObject(target[key]);
    });
  };

  sanitizeRequestObject(req.body);
  sanitizeRequestObject(req.params);
  sanitizeRequestObject(req.query);
  next();
});

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes); // added
app.use("/api/subcategories", subcategoryRoutes); // added
app.use("/api/upload", uploadRoutes);
app.use("/api/uploadprofile", uploadProfileRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chats", chatRoutes);

// --- 5. SOCKET.IO REAL-TIME LOGIC ---
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Mark user as Online
  socket.on("userOnline", async (userId) => {
    try {
      socket.userId = userId; 
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("userStatusChanged", { userId, isOnline: true });
    } catch (error) {
      console.error("Socket userOnline error:", error);
    }
  });
     
  // Join a private chat room
  socket.on("joinRoom", (chatId) => {
    socket.join(chatId); 
   // console.log(`User joined chat: ${chatId}`);
  });
  // Handle Typing Indicator
  socket.on("typing", (data) => {
    // Broadcast to the other user in the room
    socket.to(data.chatId).emit("displayTyping", data);
  });
  // Handle Real-time Deletion
  socket.on("deleteMessage", ({ chatId, messageId }) => {
    // Broadcast to everyone else in the room  messageDeleted
    socket.to(chatId).emit("deleteMessage", messageId);
  }); 
  // Handle Real-time Edit
  socket.on("editMessage", (data) => {
    // data: { chatId, messageId, newText }
    socket.to(data.chatId).emit("messageEdited", data);
  });
  // Handle Message Sent (Immediate UI update for receiver)
  socket.on("newMessage", (message) => {
    // message should contain chatId
    socket.to(message.chatId).emit("messageReceived", message);
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      try {
        const now = new Date();
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: now });
        io.emit("userStatusChanged", { userId: socket.userId, isOnline: false, lastSeen: now });
      } catch (error) {
        console.error("Socket disconnect error:", error);
      }
    }
    console.log("User Disconnected"); 
  }); 
});

// Auto-clean expired OTP every 10 mins
const otpCleanupInterval = setInterval(async () => {
  try {
    await User.updateMany(
      { otpExpires: { $lt: Date.now() } },
      { otp: null, otpExpires: null }
    );
    // console.log("Expired OTPs cleaned");
  } catch (err) {
    //console.error("OTP cleanup error:", err);
  }
}, 10 * 60 * 1000); 
otpCleanupInterval.unref?.();

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

// app.listen(port,()=>{ 
//     console.log(`server running on port ${port}`)
// })
// 6. Change app.listen to httpServer.listen
httpServer.listen(port, () => {
  console.log(`http Server running on port ${port}`);
});
