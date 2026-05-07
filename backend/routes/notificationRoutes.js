import express from "express";
import rateLimit from "express-rate-limit";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { enqueuePushNotification } from "../utils/queues.js";

const router = express.Router();

// 30 notification sends per 15 minutes per IP
const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many notification requests, please try again later." },
});

/**
 * POST /api/notifications/send
 * Internal utility: send a push notification to a specific token.
 * Body: { token, title, body, data }
 */
router.post(
  "/send",
  notificationLimiter,
  protect,
  asyncHandler(async (req, res) => {
    const { token, title, body, data } = req.body;
    if (!token || !title || !body) {
      res.status(400);
      throw new Error("token, title and body are required");
    }
    await enqueuePushNotification(token, title, body, data || {});
    res.json({ message: "Notification queued" });
  })
);

export default router;
