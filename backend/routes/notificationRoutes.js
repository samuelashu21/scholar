import express from "express";
import rateLimit from "express-rate-limit";
import { sendNotification } from "../controllers/notificationController.js";
import { protect, sellerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
const notificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/send", notificationLimiter, protect, sellerOrAdmin, sendNotification);

export default router;
