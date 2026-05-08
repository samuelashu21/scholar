import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { formatOrderStatus, isOrderStatus } from "../utils/orderStatus.js";
import { enqueueJob, analyticsQueue, notificationQueue } from "../queues/index.js";
import { sendOrderStatusEmail } from "../utils/smtp_function.js";

const findVariantOption = (product, selectedVariant) => {
  if (!selectedVariant || !product.variants?.length) return null;

  for (const variant of product.variants) {
    const option = (variant.options || []).find((opt) => {
      if (selectedVariant.sku && opt.sku) return opt.sku === selectedVariant.sku;
      return opt.label === selectedVariant.label && variant.name === selectedVariant.name;
    });

    if (option) {
      return { variantName: variant.name, option };
    }
  }

  return null;
};

const reduceStockForItem = async (item) => {
  const product = await Product.findById(item.product);
  if (!product) throw new Error(`Product ${item.product} not found`);

  if (item.selectedVariant && product.variants?.length) {
    const match = findVariantOption(product, item.selectedVariant);
    if (!match) {
      throw new Error(`Selected variant not found for ${product.name}`);
    }

    if ((match.option.stock || 0) < item.qty) {
      throw new Error(`Insufficient stock for ${product.name} (${match.option.label})`);
    }

    match.option.stock -= item.qty;
    product.countInStock = product.getVariantStockTotal();
    await product.save();
    return;
  }

  if (product.countInStock < item.qty) {
    throw new Error(`Insufficient stock for ${product.name}`);
  }

  product.countInStock -= item.qty;
  await product.save();
};

const notifyOrderStatus = async (order, status, note = "") => {
  const user = await User.findById(order.user).select("FirstName email pushToken");
  if (!user) return;

  const statusLabel = formatOrderStatus(status);
  const title = "Order update";
  const body = `Your order is now ${statusLabel}.`;

  if (user.pushToken) {
    await enqueueJob(notificationQueue, "push", {
      payload: {
        to: user.pushToken,
        title,
        body,
        data: { orderId: order._id.toString(), status },
      },
    });
  }

  if (user.email) {
    await sendOrderStatusEmail(user.email, order._id.toString(), statusLabel, note);
  }

  await enqueueJob(analyticsQueue, "order-status", {
    type: "order-status",
    payload: { orderId: order._id.toString(), status },
  });
};

const transitionOrderStatus = async (order, status, note = "", actorId = null) => {
  if (!isOrderStatus(status)) {
    throw new Error("Invalid order status");
  }

  const previousStatus = order.status;
  order.status = status;

  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note: note || `Updated from ${previousStatus} to ${status}`,
    actor: actorId,
  });

  if (status === "confirmed" && previousStatus !== "confirmed") {
    for (const item of order.orderItems) {
      await reduceStockForItem(item);
    }
  }

  const updatedOrder = await order.save();
  await notifyOrderStatus(updatedOrder, status, note);
  return updatedOrder;
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

    const matchedVariant = findVariantOption(dbItem, item.selectedVariant);
    const variantPrice = matchedVariant?.option?.price;

    return {
      ...item,
      product: item._id,
      price: variantPrice && variantPrice > 0 ? variantPrice : dbItem.price,
      selectedVariant: item.selectedVariant || null,
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
  const order = await Order.findById(req.params.id).populate("user", "name email");
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

  order.paymentResult = {
    id: req.body.paymentId || req.body.id,
    status: "COMPLETED",
    update_time: req.body.update_time || new Date().toISOString(),
    email_address: req.body.email_address || "not.provided@example.com",
  };

  const updatedOrder = await transitionOrderStatus(
    order,
    "confirmed",
    "Payment received",
    req.user?._id
  );

  res.json(updatedOrder);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const updatedOrder = await transitionOrderStatus(
    order,
    "delivered",
    "Marked as delivered",
    req.user?._id
  );

  res.status(200).json(updatedOrder);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note = "" } = req.body;
  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const updatedOrder = await transitionOrderStatus(order, status, note, req.user?._id);
  res.status(200).json(updatedOrder);
});

const getOrders = asyncHandler(async (_req, res) => {
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
