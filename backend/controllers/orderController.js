import asyncHandler from "../middleware/asyncHandler.js";
import Order, { ORDER_STATUSES } from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { enqueuePushNotification, enqueueEmail } from "../utils/queues.js";

// Human-readable labels for push notification messages
const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_requested: "Refund Requested",
  refunded: "Refunded",
};

/**
 * Internal helper: notify the order owner when the order status changes.
 */
const notifyOrderStatusChange = async (order, newStatus) => {
  try {
    const user = await User.findById(order.user).select("pushToken email FirstName");
    if (!user) return;

    const label = STATUS_LABELS[newStatus] || newStatus;

    // Push notification (non-blocking via queue)
    if (user.pushToken) {
      await enqueuePushNotification(
        user.pushToken,
        "Order Update",
        `Your order is now: ${label}`,
        { orderId: order._id.toString(), status: newStatus }
      );
    }

    // Email (non-blocking via queue)
    await enqueueEmail("orderStatus", { user, order, status: newStatus });
  } catch (err) {
    console.error("notifyOrderStatusChange error:", err.message);
  }
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
  const order = await Order.findById(req.params.id);
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

  // Advance lifecycle status to "confirmed" on payment
  if (order.status === "pending") {
    order.status = "confirmed";
    order.statusHistory.push({ status: "confirmed", note: "Payment received" });
  }

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product ${item.product} not found`);
    if (product.countInStock < item.qty)
      throw new Error(`Insufficient stock for ${product.name}`);
     
    product.countInStock -= item.qty;
    await product.save();
  }

  const updatedOrder = await order.save();

  // Notify user of payment confirmation (non-blocking)
  notifyOrderStatusChange(updatedOrder, "confirmed");

  res.json(updatedOrder);
});

// Admin/seller privilege
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = "delivered";
  order.statusHistory.push({ status: "delivered", note: "Order delivered" });

  const updatedOrder = await order.save();

  // Notify user
  notifyOrderStatusChange(updatedOrder, "delivered");

  res.status(200).json(updatedOrder);
});

/**
 * PUT /api/orders/:id/status
 * Admin or seller can move an order through the full lifecycle.
 * Body: { status, note }
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${ORDER_STATUSES.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || "", timestamp: new Date() });

  // Keep legacy flags in sync
  if (status === "confirmed" || status === "processing" || status === "shipped" ||
      status === "out_for_delivery" || status === "delivered") {
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }
  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  const updatedOrder = await order.save();

  // Push notification + email (non-blocking via queue)
  notifyOrderStatusChange(updatedOrder, status);

  res.json(updatedOrder);
});

// For admin
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
