import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview, 
} from "../controllers/productController.js";
 import { protect, admin  } from "../middleware/authMiddleware.js"; 

const router = express.Router();  

router.route("/")   
  .get(getProducts)                     // Anyone can view products
  .post(protect, admin, createProduct); // Only sellers or admins

router.route("/:id") 
  .get(getProductById)                   // Anyone can view product
  .put(protect, admin, updateProduct)   // Only seller (owner) or admin
  .delete(protect, admin, deleteProduct); // Only seller (owner) or admin

router.route("/:id/reviews")
  .post(protect, createProductReview);  // Any logged-in user can review
 
export default router;   