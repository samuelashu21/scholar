import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { sendInternalNotification } from "../utils/internalNotification.js";
import { sendOrderStatusEmail } from "../utils/smtp_function.js";

const appendStatusHistory = (order, status, note = "") => {
  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
  });
};

const sendOrderStatusUpdates = async (order, status, note = "") => {
  const user = await User.findById(order.user).select("pushToken email FirstName");
  if (!user) return;

  const humanStatus = status.replaceAll("_", " ");
  const title = "Order update";
  const body = `Order #${order._id.toString().slice(-6).toUpperCase()} is now ${humanStatus}.`;

  await sendInternalNotification({
    userId: user._id,
    title,
    body,
    data: {
      orderId: order._id.toString(),
      status,
      note,
    },
  });

  await sendOrderStatusEmail({
    email: user.email,
    firstName: user.FirstName,
    orderId: order._id.toString().slice(-6).toUpperCase(),
    status,
    note,
  });
};

const decrementStockForOrder = async (order) => {
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product ${item.product} not found`);

    if (item.selectedVariant?.name && item.selectedVariant?.optionLabel) {
      const variant = (product.variants || []).find((v) => v.name === item.selectedVariant.name);
      const option = variant?.options?.find((opt) => opt.label === item.selectedVariant.optionLabel);
      if (!option) {
        throw new Error(`Variant ${item.selectedVariant.name}/${item.selectedVariant.optionLabel} not found for ${product.name}`);
      }
      if ((option.stock || 0) < item.qty) {
        throw new Error(`Insufficient stock for ${product.name} (${option.label})`);
      }
      option.stock -= item.qty;
    } else {
      if ((product.baseStock || 0) < item.qty) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      product.baseStock -= item.qty;
    }

    await product.save();
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
    if (!dbItem) {
      throw new Error(`Product ${item._id} not found`);
    }

    let itemPrice = dbItem.price;
    if (item.selectedVariant?.name && item.selectedVariant?.optionLabel) {
      const variant = (dbItem.variants || []).find((v) => v.name === item.selectedVariant.name);
      const option = variant?.options?.find((opt) => opt.label === item.selectedVariant.optionLabel);
      if (!option) throw new Error(`Variant option not found for ${dbItem.name}`);
      if ((option.stock || 0) < item.qty) throw new Error(`Insufficient stock for ${dbItem.name}`);
      itemPrice = option.price || dbItem.price;
    } else if ((dbItem.countInStock || 0) < item.qty) {
      throw new Error(`Insufficient stock for ${dbItem.name}`);
    }

    return {
      ...item,
      selectedVariant: item.selectedVariant || undefined,
      product: item._id,
      price: itemPrice,
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
    statusHistory: [{ status: "pending", timestamp: new Date(), note: "Order placed" }],
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
  const order = await Order.findById(req.params.id).populate("user", "FirstName LastName email");
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

  if (!order.isPaid) {
    await decrementStockForOrder(order);
  }

  order.paymentResult = {
    id: req.body.paymentId || req.body.id,
    status: "COMPLETED",
    update_time: req.body.update_time || new Date().toISOString(),
    email_address: req.body.email_address || "not.provided@example.com",
  };

  appendStatusHistory(order, "confirmed", "Payment received");
  const updatedOrder = await order.save();

  await sendOrderStatusUpdates(updatedOrder, "confirmed", "Payment received");
  res.json(updatedOrder);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  appendStatusHistory(order, "delivered", "Order delivered");
  const updatedOrder = await order.save();
  await sendOrderStatusUpdates(updatedOrder, "delivered", "Order delivered");
  res.status(200).json(updatedOrder);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note = "" } = req.body;
  const validStatuses = [
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

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.status === status) {
    return res.status(200).json(order);
  }

  if (status === "confirmed" && !order.isPaid) {
    await decrementStockForOrder(order);
  }

  appendStatusHistory(order, status, note);
  const updatedOrder = await order.save();
  await sendOrderStatusUpdates(updatedOrder, status, note);
  res.status(200).json(updatedOrder);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id FirstName LastName email");
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
