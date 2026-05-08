import express from "express";
import rateLimit from "express-rate-limit";
import {
  getRevenueAnalytics,
  getTopProductsAnalytics,
  getUserGrowthAnalytics,
} from "../controllers/adminAnalyticsController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/revenue", analyticsLimiter, protect, admin, getRevenueAnalytics);
router.get("/top-products", analyticsLimiter, protect, admin, getTopProductsAnalytics);
router.get("/user-growth", analyticsLimiter, protect, admin, getUserGrowthAnalytics);

export default router;
