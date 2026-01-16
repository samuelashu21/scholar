import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview, 
  addView
} from "../controllers/productController.js";
  
import { toggleLike } from "../controllers/likeController.js";
 
 import { protect,protectOptional, admin,sellerOrAdmin  } from "../middleware/authMiddleware.js"; 
 
const router = express.Router();  

router.route("/")    
  .get(protectOptional,getProducts)                     // Anyone can view products
  .post(protect, sellerOrAdmin, createProduct); // Only sellers or admins
  
router.route("/:id") 
  .get(protectOptional,getProductById)                   // Anyone can view product
  .put(protect, sellerOrAdmin, updateProduct)   // Only seller (owner) or admin
  .delete(protect, sellerOrAdmin, deleteProduct); // Only seller (owner) or admin
 
router.put("/:id/view", protectOptional, addView); 
router.put("/:id/like", protect, toggleLike); 

  
router.route("/:id/reviews")
  .post(protect, createProductReview);  // Any logged-in user can review
 
export default router;   