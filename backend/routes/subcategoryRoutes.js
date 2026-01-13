import express from "express";
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Get subcategories 
// Note: Can be called as /api/subcategories OR /api/subcategories?categoryId=ID
router.get("/", getSubcategories);

// Admin-only: Create subcategory
router.post("/", protect, admin, createSubcategory);

// Admin-only: Update subcategory
router.put("/:id", protect, admin, updateSubcategory);

// Admin-only: Delete subcategory
router.delete("/:id", protect, admin, deleteSubcategory);

export default router;