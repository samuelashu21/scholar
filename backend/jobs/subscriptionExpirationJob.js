import cron from "node-cron";
import User from "../models/userModel.js";
import { ROLES } from "../constants/roles.js";

export const runSubscriptionExpirationJob = async () => {
  const now = new Date();
  const result = await User.updateMany(
    {
      role: ROLES.SELLER,
      "sellerRequest.status": "approved",
      "sellerRequest.subscriptionEnd": { $lte: now },
      "sellerRequest.subscriptionLevel": { $gt: 0 },
    },
    {
      $set: { 
        "sellerRequest.subscriptionType": "free",
        "sellerRequest.subscriptionLevel": 0,
        "sellerRequest.subscriptionStart": null,
        "sellerRequest.subscriptionEnd": null,
        "sellerRequest.boostActive": false,
      },
    }
  );

  return result;
};

export const startSubscriptionExpirationCron = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      await runSubscriptionExpirationJob();
    } catch (error) {
      console.error("Subscription expiration cron failed:", error.message);
    }
  });
};