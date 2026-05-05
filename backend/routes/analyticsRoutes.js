import express from "express";
import {
  getRevenueAnalytics,
  getTopProducts,
  getUserGrowth,
  getDashboardSummary,
} from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/revenue", protect, admin, getRevenueAnalytics);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/user-growth", protect, admin, getUserGrowth);
router.get("/summary", protect, admin, getDashboardSummary);

export default router;
