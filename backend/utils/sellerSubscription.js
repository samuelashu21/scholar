import { ROLES, resolveUserRole } from "../constants/roles.js";
export const SUBSCRIPTION_TYPES = ["free", "paid_1_month", "paid_6_month", "paid_1_year"];

export const calculateSubscription = (subscriptionType = "free", startDate = new Date()) => {
  const subscriptionStart = new Date(startDate);
  const result = {
    subscriptionType,
    subscriptionLevel: 0,
    subscriptionStart: null,
    subscriptionEnd: null,
    boostActive: false,
  };

  if (subscriptionType === "free") {
    return result;
  }

  if (subscriptionType === "paid_1_month") {
    result.subscriptionLevel = 1;
    result.subscriptionStart = subscriptionStart;
    result.subscriptionEnd = new Date(subscriptionStart);
    result.subscriptionEnd.setMonth(result.subscriptionEnd.getMonth() + 1);
    result.boostActive = true;
    return result;
  }

  if (subscriptionType === "paid_6_month") {
    result.subscriptionLevel = 2;
    result.subscriptionStart = subscriptionStart;
    result.subscriptionEnd = new Date(subscriptionStart);
    result.subscriptionEnd.setMonth(result.subscriptionEnd.getMonth() + 6);
    result.boostActive = true;
    return result;
  }

  if (subscriptionType === "paid_1_year") {
    result.subscriptionLevel = 3;
    result.subscriptionStart = subscriptionStart;
    result.subscriptionEnd = new Date(subscriptionStart);
    result.subscriptionEnd.setMonth(result.subscriptionEnd.getMonth() + 12);
    result.boostActive = true;
    return result;
  }

  return result;
};

export const hasActivePremiumSubscription = (sellerRequest, now = new Date()) =>
  Boolean(
    sellerRequest?.boostActive &&
      sellerRequest?.subscriptionEnd &&
      new Date(sellerRequest.subscriptionEnd) > now &&
      sellerRequest?.subscriptionLevel > 0
  );

export const isSellerApprovedAndActive = (user, now = new Date()) =>
  Boolean(
    resolveUserRole(user) === ROLES.SELLER &&
      user?.accountStatus === "active" &&
      user?.sellerRequest?.status === "approved" &&
      hasActivePremiumSubscription(user?.sellerRequest, now)
  );

export const downgradeExpiredSubscription = (user, now = new Date()) => {
  if (!user?.sellerRequest?.subscriptionEnd) return false;
  if (new Date(user.sellerRequest.subscriptionEnd) > now) return false;
  if (user.sellerRequest.subscriptionType === "free" && user.sellerRequest.subscriptionLevel === 0) return false;

  user.sellerRequest.subscriptionType = "free";
  user.sellerRequest.subscriptionLevel = 0;
  user.sellerRequest.subscriptionStart = null;
  user.sellerRequest.subscriptionEnd = null;
  user.sellerRequest.boostActive = false;
  return true;
};  