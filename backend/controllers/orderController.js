import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { sendPushNotification } from "../utils/notificationService.js";

// Human-readable labels for push notification messages
const STATUS_LABELS = {
  pending: "Order Received",
  confirmed: "Order Confirmed",
  processing: "Order Being Processed",
  shipped: "Order Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Order Delivered",
  cancelled: "Order Cancelled",
  refund_requested: "Refund Requested",
  refunded: "Refund Processed",
};

const addOrderItem = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems?.length) {
    res.status(400);
    throw new Error("No order items"); 
  }

  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map((x) => x._id) },
  });

  const dbOrderItems = orderItems.map((item) => {
    const dbItem = itemsFromDB.find((p) => p._id.toString() === item._id);
    return {
      ...item,
      product: item._id,
      price: dbItem.price,
      _id: undefined,
    };
  });

  const prices = calcPrices(dbOrderItems);

  const order = new Order({
    orderItems: dbOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    status: "pending",
    statusHistory: [{ status: "pending", note: "Order placed" }],
    ...prices,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "pushToken email FirstName");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.paymentId || req.body.id,
    status: "COMPLETED",
    update_time: req.body.update_time || new Date().toISOString(),
    email_address: req.body.email_address || "not.provided@example.com",
  };
  order.status = "confirmed";
  order.statusHistory.push({ status: "confirmed", note: "Payment received" });

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product ${item.product} not found`);
    if (product.countInStock < item.qty)
      throw new Error(`Insufficient stock for ${product.name}`);
     
    product.countInStock -= item.qty;
    await product.save();
  }

  const updatedOrder = await order.save();

  // Push notification to buyer
  if (order.user?.pushToken) {
    sendPushNotification(
      order.user.pushToken,
      "Payment Confirmed ✅",
      "Your order has been paid and confirmed.",
      { orderId: order._id.toString(), status: "confirmed" }
    ).catch(() => {});
  }

  res.json(updatedOrder);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "pushToken");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = "delivered";
  order.statusHistory.push({ status: "delivered", note: "Order delivered" });

  const updatedOrder = await order.save();

  // Push notification to buyer
  if (order.user?.pushToken) {
    sendPushNotification(
      order.user.pushToken,
      "Order Delivered 🎉",
      "Your order has been delivered. Enjoy!",
      { orderId: order._id.toString(), status: "delivered" }
    ).catch(() => {});
  }

  res.status(200).json(updatedOrder);
});

// @desc    Update order status (admin/seller) — full lifecycle
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Seller
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const validStatuses = [
    "pending", "confirmed", "processing", "shipped",
    "out_for_delivery", "delivered", "cancelled",
    "refund_requested", "refunded",
  ];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findById(req.params.id).populate("user", "pushToken FirstName");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || "" });

  // Sync legacy boolean fields for backward-compatibility
  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = order.deliveredAt || Date.now();
  }
  if (status === "confirmed") {
    order.isPaid = true;
    order.paidAt = order.paidAt || Date.now();
  }

  const updatedOrder = await order.save();

  // Push notification to buyer
  if (order.user?.pushToken) {
    const label = STATUS_LABELS[status] || status;
    sendPushNotification(
      order.user.pushToken,
      `Order Update: ${label}`,
      note || `Your order status has been updated to: ${label}`,
      { orderId: order._id.toString(), status }
    ).catch(() => {});
  }

  res.json(updatedOrder);
});

//for admin 
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
});

export {
  addOrderItem,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrders,
};
