import express from "express";
import rateLimit from "express-rate-limit";

import {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  addView,
  getBannerProducts,
} from "../controllers/productController.js";

import { toggleLike } from "../controllers/likeController.js";
import { protect, protectOptional, approvedSellerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false, 
  message: { success: false, message: "Too many requests, please try again later.", data: null },
});

// ✅ put static route first
router.get("/my-products", protect, getMyProducts);
 
// routes/productRoutes.js
router.get("/banner", getBannerProducts);
 
router
  .route("/")
  .get(protectOptional, getProducts)
  .post(writeLimiter, protect, approvedSellerOnly, createProduct); 

router 
  .route("/:id")
  .get(protectOptional, getProductById)
  .put(writeLimiter, protect, approvedSellerOnly, updateProduct)
  .delete(writeLimiter, protect, approvedSellerOnly, deleteProduct); 

router.put("/:id/view", writeLimiter, protectOptional, addView);
router.put("/:id/like", writeLimiter, protect, toggleLike);

router.route("/:id/reviews").post(writeLimiter, protect, createProductReview);

export default router;