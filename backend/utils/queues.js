import Bull from "bull";
import { sendPushNotification } from "./notificationService.js";
import {
  sendOTPEmail,
  sendResetPasswordEmail,
  sendSellerApprovalEmail,
  sendSellerRejectionEmail,
  sendSellerRequestEmail,
  sendOrderStatusEmail,
} from "./smtp_function.js";

const redisUrl = process.env.REDIS_URL || null;

const queueOptions = redisUrl
  ? { redis: redisUrl }
  : {
      // No Redis — queues will not be created
    };

const createQueue = (name) => {
  if (!redisUrl) {
    console.warn(`Bull queue "${name}" disabled — REDIS_URL not set`);
    return null;
  }
  return new Bull(name, queueOptions);
};

// ----- Queue instances -----
export const emailQueue = createQueue("emailQueue");
export const notificationQueue = createQueue("notificationQueue");
export const analyticsQueue = createQueue("analyticsQueue");

// ----- Email queue processor -----
if (emailQueue) {
  emailQueue.process(async (job) => {
    const { type, payload } = job.data;
    switch (type) {
      case "otp":
        await sendOTPEmail(payload.email, payload.otp);
        break;
      case "resetPassword":
        await sendResetPasswordEmail(payload.email, payload.otp);
        break;
      case "sellerRequest":
        await sendSellerRequestEmail(payload.user, payload.adminEmail);
        break;
      case "sellerApproval":
        await sendSellerApprovalEmail(payload.user);
        break;
      case "sellerRejection":
        await sendSellerRejectionEmail(payload.user);
        break;
      case "orderStatus":
        if (typeof sendOrderStatusEmail === "function") {
          await sendOrderStatusEmail(payload.user, payload.order, payload.status);
        }
        break;
      default:
        console.warn(`Unknown email job type: ${type}`);
    }
  });

  emailQueue.on("failed", (job, err) => {
    console.error(`Email job ${job.id} failed:`, err.message);
  });
}

// ----- Notification queue processor -----
if (notificationQueue) {
  notificationQueue.process(async (job) => {
    const { token, title, body, data } = job.data;
    await sendPushNotification(token, title, body, data);
  });

  notificationQueue.on("failed", (job, err) => {
    console.error(`Notification job ${job.id} failed:`, err.message);
  });
}

// ----- Analytics queue processor (placeholder) -----
if (analyticsQueue) {
  analyticsQueue.process(async (job) => {
    // Future: persist analytics events to a time-series store
    console.log("Analytics event:", job.data);
  });
}

// ----- Helper: enqueue a push notification -----
export const enqueuePushNotification = async (token, title, body, data = {}) => {
  if (notificationQueue) {
    await notificationQueue.add({ token, title, body, data }, { attempts: 3, backoff: 2000 });
  } else {
    // Fallback: send inline when no queue is available
    await sendPushNotification(token, title, body, data);
  }
};

// ----- Helper: enqueue an email -----
export const enqueueEmail = async (type, payload) => {
  if (emailQueue) {
    await emailQueue.add({ type, payload }, { attempts: 3, backoff: 3000 });
  } else {
    // Fallback: send inline
    switch (type) {
      case "otp":
        await sendOTPEmail(payload.email, payload.otp);
        break;
      case "resetPassword":
        await sendResetPasswordEmail(payload.email, payload.otp);
        break;
      case "sellerRequest":
        await sendSellerRequestEmail(payload.user, payload.adminEmail);
        break;
      case "sellerApproval":
        await sendSellerApprovalEmail(payload.user);
        break;
      case "sellerRejection":
        await sendSellerRejectionEmail(payload.user);
        break;
      case "orderStatus":
        if (typeof sendOrderStatusEmail === "function") {
          await sendOrderStatusEmail(payload.user, payload.order, payload.status);
        }
        break;
      default:
        break;
    }
  }
};
