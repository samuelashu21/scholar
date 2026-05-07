import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product, { POPULARITY_WEIGHTS } from "../models/productModel.js";
import User from "../models/userModel.js";

/**
 * GET /api/admin/analytics/revenue?period=week|month|year
 * Aggregates Order.totalPrice grouped by day for the requested period.
 */
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = "week" } = req.query;

  const periodDays = { week: 7, month: 30, year: 365 };
  const days = periodDays[period] || 7;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const revenue = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: "$_id",
        total: 1,
        count: 1,
        _id: 0,
      },
    },
  ]);

  res.json({ period, revenue });
});

/**
 * GET /api/admin/analytics/top-products?limit=10
 * Returns products sorted by views + numReviews.
 */
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const products = await Product.aggregate([
    {
      $addFields: {
        popularityScore: {
          $add: [
            { $multiply: [{ $ifNull: ["$views", 0] }, POPULARITY_WEIGHTS.views] },
            { $multiply: [{ $ifNull: ["$numReviews", 0] }, POPULARITY_WEIGHTS.reviews] },
            { $multiply: [{ $ifNull: ["$rating", 0] }, POPULARITY_WEIGHTS.rating] },
          ],
        },
      },
    },
    { $sort: { popularityScore: -1 } },
    { $limit: limit },
    {
      $project: {
        name: 1,
        image: 1,
        price: 1,
        views: 1,
        numReviews: 1,
        rating: 1,
        countInStock: 1,
        popularityScore: 1,
      },
    },
  ]);

  res.json(products);
});

/**
 * GET /api/admin/analytics/user-growth
 * Returns users grouped by registration month.
 */
export const getUserGrowth = asyncHandler(async (req, res) => {
  const growth = await User.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        month: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  res.json(growth);
});
