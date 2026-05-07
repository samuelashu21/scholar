import express from "express";

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

// Static routes — must come before parameterised /:id routes
router.get("/my-products", protect, getMyProducts);
router.get("/banner", getBannerProducts);
router.get("/popular", getPopularProducts);
router.post("/recently-viewed", getRecentlyViewedProducts);

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
router.put("/:id/like", protect, toggleLike);

router.route("/:id/reviews").post(protect, createProductReview);

export default router;