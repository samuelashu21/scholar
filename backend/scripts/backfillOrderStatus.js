import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Order from "../models/orderModel.js";

dotenv.config();

const resolveStatus = (order) => {
  if (order.status) return order.status;
  if (order.isDelivered) return "delivered";
  if (order.isPaid) return "confirmed";
  return "pending";
};

const run = async () => {
  await connectDB();

  const orders = await Order.find({});
  let updated = 0;

  for (const order of orders) {
    const status = resolveStatus(order);
    const history = order.statusHistory?.length
      ? order.statusHistory
      : [{ status, timestamp: order.createdAt, note: "Backfilled from legacy flags" }];

    order.status = status;
    order.statusHistory = history;
    await order.save();
    updated += 1;
  }

  console.log(`Backfill complete. Updated ${updated} orders.`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
