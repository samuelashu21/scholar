import express from "express";
import rateLimit from "express-rate-limit";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getRevenueAnalytics,
  getTopProducts,
  getUserGrowth,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Allow up to 60 analytics requests per 15 minutes per IP
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many analytics requests, please try again later." },
});

// All analytics routes require admin authentication
router.get("/revenue", analyticsLimiter, protect, admin, getRevenueAnalytics);
router.get("/top-products", analyticsLimiter, protect, admin, getTopProducts);
router.get("/user-growth", analyticsLimiter, protect, admin, getUserGrowth);

export default router;
