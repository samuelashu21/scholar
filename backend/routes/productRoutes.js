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
  getPopularProducts,
  getRecentlyViewedProducts,
} from "../controllers/productController.js";

import { toggleLike } from "../controllers/likeController.js";
import { protect, protectOptional, sellerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
const productMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ put static route first
router.get("/my-products", protect, getMyProducts);
 
// routes/productRoutes.js
router.get("/banner", getBannerProducts);
router.get("/popular", productMutationLimiter, protectOptional, getPopularProducts);
router.get("/recently-viewed", productMutationLimiter, protectOptional, getRecentlyViewedProducts);
 
router
  .route("/")
  .get(protectOptional, getProducts)
  .post(protect, sellerOrAdmin, createProduct); 

router 
  .route("/:id")
  .get(protectOptional, getProductById)
  .put(protect, sellerOrAdmin, updateProduct)
  .delete(protect, sellerOrAdmin, deleteProduct); 

router.put("/:id/view", protectOptional, addView);
router.put("/:id/like", productMutationLimiter, protect, toggleLike);

router.route("/:id/reviews").post(productMutationLimiter, protect, createProductReview);

export default router;
