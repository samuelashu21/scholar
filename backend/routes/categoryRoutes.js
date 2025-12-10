 import express from "express";
import { getCategories, createCategory,updateCategory,deleteCategory } from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router(); 
 
// Public: get all categories 
router.get("/", getCategories);

// Admin-only: create category
router.post("/", protect, admin, createCategory);

// Admin-only: update category
router.put("/:id", protect, admin, updateCategory);

// Admin-only: delete category
router.delete("/:id", protect, admin, deleteCategory);
 
export default router;
  