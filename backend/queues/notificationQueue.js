import Bull from "bull";
import { sendPushNotification } from "../utils/notificationService.js";

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
};

let notificationQueue = null;

const getNotificationQueue = () => {
  if (notificationQueue) return notificationQueue;

  try {
    notificationQueue = new Bull("notifications", { redis: redisConfig });

    notificationQueue.process(async (job) => {
      const { pushToken, title, body, data } = job.data;
      await sendPushNotification(pushToken, title, body, data);
    });

    notificationQueue.on("failed", (job, err) => {
      console.error(`Notification job ${job.id} failed:`, err.message);
    });
  } catch {
    notificationQueue = null;
  }

  return notificationQueue;
};

/**
 * Enqueue a push notification. Falls back to direct call if queue is unavailable.
 */
export const enqueueNotification = async (pushToken, title, body, data = {}) => {
  const queue = getNotificationQueue();
  if (queue) {
    try {
      await queue.add({ pushToken, title, body, data }, { attempts: 3, backoff: 2000 });
      return;
    } catch {
      // fall through to direct send
    }
  }
  // Fallback: direct (non-blocking)
  sendPushNotification(pushToken, title, body, data).catch(() => {});
};
