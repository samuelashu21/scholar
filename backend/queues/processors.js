import { analyticsQueue, emailQueue, notificationQueue } from "./index.js";
import {
  deliverOTPEmail,
  deliverOrderStatusEmail,
  deliverResetPasswordEmail,
  deliverSellerApprovalEmail,
  deliverSellerRejectionEmail,
  deliverSellerRequestEmail,
} from "../utils/smtp_function.js";
import { sendPushNotification } from "../utils/notificationService.js";

export const registerQueueProcessors = () => {
  if (emailQueue) {
    emailQueue.process(async (job) => {
      const { type, payload } = job.data;

      switch (type) {
        case "otp":
          return deliverOTPEmail(payload.userEmail, payload.otp);
        case "reset-password":
          return deliverResetPasswordEmail(payload.userEmail, payload.otp);
        case "seller-request":
          return deliverSellerRequestEmail(payload.user, payload.adminEmail);
        case "seller-approval":
          return deliverSellerApprovalEmail(payload.user);
        case "seller-rejection":
          return deliverSellerRejectionEmail(payload.user);
        case "order-status":
          return deliverOrderStatusEmail(payload);
        default:
          return null;
      }
    });

    emailQueue.on("failed", (job, err) => {
      console.error(`Email queue job failed (${job?.id}):`, err.message);
    });
  }

  if (notificationQueue) {
    notificationQueue.process(async (job) => {
      const { payload } = job.data;
      return sendPushNotification(payload);
    });

    notificationQueue.on("failed", (job, err) => {
      console.error(`Notification queue job failed (${job?.id}):`, err.message);
    });
  }

  if (analyticsQueue) {
    analyticsQueue.process(async (job) => {
      // Placeholder queue for async analytics events.
      return { processed: true, event: job.data?.type || "unknown" };
    });

    analyticsQueue.on("failed", (job, err) => {
      console.error(`Analytics queue job failed (${job?.id}):`, err.message);
    });
  }
};
