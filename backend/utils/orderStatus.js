export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refund_requested",
  "refunded",
];

const PAID_EQUIVALENT_STATUSES = new Set([
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "refund_requested",
  "refunded",
]);

const DELIVERED_EQUIVALENT_STATUSES = new Set(["delivered"]);

export const mapLegacyFlagsFromStatus = (status) => ({
  isPaid: PAID_EQUIVALENT_STATUSES.has(status),
  isDelivered: DELIVERED_EQUIVALENT_STATUSES.has(status),
});

export const isOrderStatus = (status) => ORDER_STATUSES.includes(status);

export const formatOrderStatus = (status) =>
  status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
