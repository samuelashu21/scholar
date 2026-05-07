import express from "express";
import rateLimit from "express-rate-limit";

import {
  addOrderItem,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrders,  
} from "../controllers/orderController.js";

import { admin, protect, sellerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rate limiter for order mutations (prevent order spam)
const orderMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many order requests, please try again later." },
});

router.route("/").post(protect, orderMutationLimiter, addOrderItem).get(protect, admin, getOrders);

router.route("/mine").get(protect, getMyOrders);

router.route("/:id").get(protect, getOrderById);

router.route("/:id/pay").put(protect, orderMutationLimiter, updateOrderToPaid);

router.route("/:id/deliver").put(protect, admin, orderMutationLimiter, updateOrderToDelivered);

// Full lifecycle status update (admin or seller)
router.route("/:id/status").put(protect, sellerOrAdmin, orderMutationLimiter, updateOrderStatus);

export default router;
