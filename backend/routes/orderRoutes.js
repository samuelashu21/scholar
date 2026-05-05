import express from "express";

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

router.route("/").post(protect, addOrderItem).get(protect, admin, getOrders);

router.route("/mine").get(protect, getMyOrders);

router.route("/:id").get(protect, getOrderById);

router.route("/:id/pay").put(protect, updateOrderToPaid);

router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);

// Full lifecycle status update (admin or seller)
router.route("/:id/status").put(protect, sellerOrAdmin, updateOrderStatus);

export default router;
