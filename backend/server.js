import express from "express";
import dotenv from "dotenv";
import { createServer } from "http"; // 1. Import HTTP createServer
import { Server } from "socket.io"; // 2. Import Socket.io
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import uploadProfileRoutes from "./routes/uploadProfileRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import registerSocketHandlers from "./src/socket/registerSocketHandlers.js";

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

const app = express();
const port = Number(process.env.PORT || 9090);

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
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX || 200),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);


app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes); // added
app.use("/api/subcategories", subcategoryRoutes); // added
app.use("/api/upload", uploadRoutes);
app.use("/api/uploadprofile", uploadProfileRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chats", chatRoutes);

// --- 5. SOCKET.IO REAL-TIME LOGIC ---
registerSocketHandlers(io);

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

// app.listen(port,()=>{ 
//     console.log(`server running on port ${port}`)
// })
// 6. Change app.listen to httpServer.listen
httpServer.listen(port, () => {
  console.log(`http Server running on port ${port}`);
});
