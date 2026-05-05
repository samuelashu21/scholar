import Bull from "bull";
import {
  sendOTPEmail,
  sendResetPasswordEmail,
  sendSellerApprovalEmail,
  sendSellerRejectionEmail,
  sendSellerRequestEmail,
} from "../utils/smtp_function.js";

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
};

let emailQueue = null;

const getEmailQueue = () => {
  if (emailQueue) return emailQueue;

  try {
    emailQueue = new Bull("emails", { redis: redisConfig });

    emailQueue.process(async (job) => {
      const { type, payload } = job.data;
      switch (type) {
        case "otp":
          await sendOTPEmail(payload.email, payload.otp);
          break;
        case "reset_password":
          await sendResetPasswordEmail(payload.email, payload.otp);
          break;
        case "seller_approval":
          await sendSellerApprovalEmail(payload.user);
          break;
        case "seller_rejection":
          await sendSellerRejectionEmail(payload.user);
          break;
        case "seller_request":
          await sendSellerRequestEmail(payload.user, payload.adminEmail);
          break;
        default:
          console.warn(`Unknown email type: ${type}`);
      }
    });

    emailQueue.on("failed", (job, err) => {
      console.error(`Email job ${job.id} failed:`, err.message);
    });
  } catch {
    emailQueue = null;
  }

  return emailQueue;
};

/**
 * Enqueue an email job. Falls back to direct send if queue is unavailable.
 */
export const enqueueEmail = async (type, payload) => {
  const queue = getEmailQueue();
  if (queue) {
    try {
      await queue.add({ type, payload }, { attempts: 3, backoff: 3000 });
      return;
    } catch {
      // fall through to direct send
    }
  }
  // Fallback: direct send
  switch (type) {
    case "otp":
      sendOTPEmail(payload.email, payload.otp).catch(() => {});
      break;
    case "reset_password":
      sendResetPasswordEmail(payload.email, payload.otp).catch(() => {});
      break;
    case "seller_approval":
      sendSellerApprovalEmail(payload.user).catch(() => {});
      break;
    case "seller_rejection":
      sendSellerRejectionEmail(payload.user).catch(() => {});
      break;
    case "seller_request":
      sendSellerRequestEmail(payload.user, payload.adminEmail).catch(() => {});
      break;
  }
};
