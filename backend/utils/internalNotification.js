import User from "../models/userModel.js";
import { enqueueNotification } from "../queues/jobQueues.js";

export const sendInternalNotification = async ({ userId, title, body, data = {} }) => {
  if (!userId) return;
  const user = await User.findById(userId).select("pushToken");
  if (!user?.pushToken) return;

  await enqueueNotification({
    to: user.pushToken,
    title,
    body,
    data,
  });
};
