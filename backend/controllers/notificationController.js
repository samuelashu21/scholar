import asyncHandler from "../middleware/asyncHandler.js";
import { sendInternalNotification } from "../utils/internalNotification.js";

export const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, body, data } = req.body;

  if (!userId || !title || !body) {
    res.status(400);
    throw new Error("userId, title, and body are required");
  }

  await sendInternalNotification({ userId, title, body, data });
  res.status(202).json({ message: "Notification queued" });
});
