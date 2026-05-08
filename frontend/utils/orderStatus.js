export const getOrderLifecycleStatus = (order) => {
  if (order?.status) return order.status;
  if (order?.isDelivered) return "delivered";
  if (order?.isPaid) return "confirmed";
  return "pending";
};

export const formatOrderLifecycleStatus = (order) =>
  getOrderLifecycleStatus(order).replaceAll("_", " ").toUpperCase();
