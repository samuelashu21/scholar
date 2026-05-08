import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import { enqueueJob, notificationQueue } from "../queues/index.js";
import mongoose from "mongoose";

const sendNotification = asyncHandler(async (req, res) => {
  const { userId, pushToken, title, body, data = {} } = req.body;

  if ((!userId && !pushToken) || !title || !body) {
    res.status(400);
    throw new Error("userId or pushToken, title, and body are required");
  }

  let token = pushToken;

  if (!token && userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400);
      throw new Error("Invalid userId");
    }
    const user = await User.findById(userId).select("pushToken");
    token = user?.pushToken;
  }

  if (!token) {
    return res.status(200).json({ queued: false, reason: "missing_push_token" });
  }

  await enqueueJob(notificationQueue, "push", {
    payload: {
      to: token,
      title,
      body,
      data,
    },
  });

  res.status(202).json({ queued: true });
});

export { sendNotification };
