 import express from "express";
import rateLimit from "express-rate-limit";
import { getCategories, createCategory,updateCategory,deleteCategory } from "../controllers/categoryController.js";
import { protectOptional,protect, admin } from "../middleware/authMiddleware.js";
 
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
 
// Public: get all categories 
router.get("/", readLimiter, protectOptional,getCategories);

// Admin-only: create category
router.post("/", writeLimiter, protect, admin, createCategory);

// Admin-only: update category 
router.put("/:id", writeLimiter, protect, admin, updateCategory);

// Admin-only: delete category
router.delete("/:id", writeLimiter, protect, admin, deleteCategory);
 
export default router;
  
