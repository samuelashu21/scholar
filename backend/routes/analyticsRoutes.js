import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getRevenueAnalytics,
  getTopProducts,
  getUserGrowth,
} from "../controllers/analyticsController.js";

const router = express.Router();

// All analytics routes require admin authentication
router.get("/revenue", protect, admin, getRevenueAnalytics);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/user-growth", protect, admin, getUserGrowth);

export default router;
