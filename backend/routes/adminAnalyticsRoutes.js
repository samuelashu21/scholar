import express from "express";
import {
  getRevenueAnalytics,
  getTopProductsAnalytics,
  getUserGrowthAnalytics,
} from "../controllers/adminAnalyticsController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/revenue", protect, admin, getRevenueAnalytics);
router.get("/top-products", protect, admin, getTopProductsAnalytics);
router.get("/user-growth", protect, admin, getUserGrowthAnalytics);

export default router;
