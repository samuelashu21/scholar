import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import { getRedisClient } from "./config/redis.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import uploadProfileRoutes from "./routes/uploadProfileRoutes.js";
import User from "./models/userModel.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

// ─── Environment Validation ─────────────────────────────────────────────────
const REQUIRED_ENV = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "GMAIL_USER",
  "GMAIL_PASS",
  "ADMIN_EMAIL",
  "AUTH_EMAIL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

connectDB();

// Start Redis (non-blocking — app runs fine without it)
getRedisClient();

const app = express();
const port = process.env.PORT || 9090;

const httpServer = createServer(app);

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:8081", "http://localhost:19006"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize()); // NoSQL injection protection

// ─── Rate Limiting for Auth Routes ───────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/users/auth", authLimiter);
app.use("/api/users/", authLimiter); // covers /register
app.use("/api/users/verify-otp", authLimiter);
app.use("/api/users/request-reset-password", authLimiter);
app.use("/api/users/reset-password", authLimiter);

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/uploadprofile", uploadProfileRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin/analytics", analyticsRoutes);

// ─── Socket.io Real-Time Logic ───────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Mark user as Online
  socket.on("userOnline", async (userId) => {
    socket.userId = userId; 
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("userStatusChanged", { userId, isOnline: true });
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
      const now = new Date();
      await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: now });
      io.emit("userStatusChanged", { userId: socket.userId, isOnline: false, lastSeen: now });
    }
    console.log("User Disconnected"); 
  }); 
});

// Auto-clean expired OTP every 10 mins
setInterval(async () => {
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

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

httpServer.listen(port, () => {
  console.log(`http Server running on port ${port}`);
});