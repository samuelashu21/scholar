import Queue from "bull";
import { isRedisEnabled, getBullRedisConfig } from "../config/redis.js";

const queueOptions = {
  redis: getBullRedisConfig(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export const emailQueue = isRedisEnabled ? new Queue("emailQueue", queueOptions) : null;
export const notificationQueue = isRedisEnabled
  ? new Queue("notificationQueue", queueOptions)
  : null;
export const analyticsQueue = isRedisEnabled ? new Queue("analyticsQueue", queueOptions) : null;

export const enqueueJob = async (queue, name, payload) => {
  if (!queue) {
    return { skipped: true };
  }
  return queue.add(name, payload);
};
