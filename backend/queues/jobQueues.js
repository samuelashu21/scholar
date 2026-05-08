import Queue from "bull";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { sendMailNow } from "../utils/mailer.js";
import { sendPushNotificationNow } from "../utils/notificationService.js";

const redisUrl = process.env.REDIS_URL;
const queueConfig = redisUrl ? { redis: redisUrl } : null;

const createQueue = (name) => {
  if (!queueConfig) return null;
  return new Queue(name, queueConfig);
};

export const emailQueue = createQueue("emailQueue");
export const notificationQueue = createQueue("notificationQueue");
export const analyticsQueue = createQueue("analyticsQueue");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/api/dev/queues");

export const setupBullBoard = () => {
  const adapters = [emailQueue, notificationQueue, analyticsQueue]
    .filter(Boolean)
    .map((queue) => new BullAdapter(queue));

  if (!adapters.length) return null;

  createBullBoard({
    queues: adapters,
    serverAdapter,
  });

  return serverAdapter.getRouter();
};

export const startQueueProcessors = () => {
  if (emailQueue) {
    emailQueue.process(async (job) => {
      await sendMailNow(job.data.mailOptions);
    });
  }

  if (notificationQueue) {
    notificationQueue.process(async (job) => {
      await sendPushNotificationNow(job.data);
    });
  }

  if (analyticsQueue) {
    analyticsQueue.process(async () => {});
  }
};

export const enqueueEmail = async (mailOptions) => {
  if (!emailQueue) {
    await sendMailNow(mailOptions);
    return;
  }
  await emailQueue.add({ mailOptions }, { attempts: 3, removeOnComplete: true, removeOnFail: 50 });
};

export const enqueueNotification = async (payload) => {
  if (!notificationQueue) {
    await sendPushNotificationNow(payload);
    return;
  }
  await notificationQueue.add(payload, { attempts: 3, removeOnComplete: true, removeOnFail: 50 });
};

export const enqueueAnalytics = async (payload) => {
  if (!analyticsQueue) return;
  await analyticsQueue.add(payload, { removeOnComplete: true, removeOnFail: 20 });
};
