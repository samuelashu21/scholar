import express from "express";
import rateLimit from "express-rate-limit";
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
});
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public: Get subcategories 
// Note: Can be called as /api/subcategories OR /api/subcategories?categoryId=ID
router.get("/", readLimiter, getSubcategories);

// Admin-only: Create subcategory
router.post("/", writeLimiter, protect, admin, createSubcategory);

// Admin-only: Update subcategory
router.put("/:id", writeLimiter, protect, admin, updateSubcategory);

// Admin-only: Delete subcategory
router.delete("/:id", writeLimiter, protect, admin, deleteSubcategory);

export default router; 