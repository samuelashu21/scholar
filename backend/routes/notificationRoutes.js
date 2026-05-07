import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { enqueuePushNotification } from "../utils/queues.js";

const router = express.Router();

/**
 * POST /api/notifications/send
 * Internal utility: send a push notification to a specific token.
 * Body: { token, title, body, data }
 */
router.post(
  "/send",
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
