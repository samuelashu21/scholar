import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { PAID_EQUIVALENT_STATUS_LIST } from "../utils/orderStatus.js";

const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const period = req.query.period || "week";
  const now = new Date();

  const startDate = new Date(now);
  if (period === "month") {
    startDate.setDate(now.getDate() - 30);
  } else if (period === "year") {
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    startDate.setDate(now.getDate() - 7);
  }

  const revenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: { $in: PAID_EQUIVALENT_STATUS_LIST } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  res.json({ period, revenue });
});

const getTopProductsAnalytics = asyncHandler(async (req, res) => {
  const topProducts = await Product.aggregate([
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: [{ $ifNull: ["$views", 0] }, 1] },
            { $multiply: [{ $ifNull: ["$numReviews", 0] }, 2] },
          ],
        },
      },
    },
    { $sort: { engagementScore: -1 } },
    { $limit: 10 },
    {
      $project: {
        name: 1,
        image: 1,
        views: 1,
        numReviews: 1,
        rating: 1,
        engagementScore: 1,
      },
    },
  ]);

  res.json(topProducts);
});

const getUserGrowthAnalytics = asyncHandler(async (_req, res) => {
  const growth = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        users: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json(growth);
});

export { getRevenueAnalytics, getTopProductsAnalytics, getUserGrowthAnalytics };
