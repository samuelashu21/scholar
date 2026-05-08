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
const orderMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.route("/").post(protect, addOrderItem).get(protect, admin, getOrders);

router.route("/mine").get(protect, getMyOrders);

router.route("/:id").get(protect,getOrderById)

router.route("/:id/pay").put(orderMutationLimiter, protect,updateOrderToPaid)


router.route("/:id/deliver").put(orderMutationLimiter, protect,admin, updateOrderToDelivered)
router.route("/:id/status").put(orderMutationLimiter, protect, sellerOrAdmin, updateOrderStatus);

export default router;
