import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

// @desc    Get revenue aggregated by day/week/month
// @route   GET /api/admin/analytics/revenue?period=week
// @access  Private/Admin
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const period = req.query.period || "week";

  const now = new Date();
  let startDate;
  let groupFormat;

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      groupFormat = "%H:00";
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFormat = "%Y-%m-%d";
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      groupFormat = "%Y-%m";
      break;
    default: // week
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupFormat = "%Y-%m-%d";
  }

  const revenue = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0);
  const totalOrders = revenue.reduce((sum, r) => sum + r.orders, 0);

  res.json({ period, data: revenue, totalRevenue, totalOrders });
});

// @desc    Get top products by views and reviews
// @route   GET /api/admin/analytics/top-products?limit=10
// @access  Private/Admin
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const products = await Product.aggregate([
    {
      $addFields: {
        popularityScore: {
          $add: [
            { $multiply: ["$views", 0.3] },
            { $multiply: ["$numReviews", 0.5] },
            { $multiply: ["$rating", 0.2] },
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
        createdAt: 1,
      },
    },
  ]);

  res.json(products);
});

// @desc    Get user growth grouped by month
// @route   GET /api/admin/analytics/user-growth
// @access  Private/Admin
export const getUserGrowth = asyncHandler(async (req, res) => {
  const growth = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 }, // last 12 months
  ]);

  const totalUsers = await User.countDocuments();
  const totalSellers = await User.countDocuments({ isSeller: true });

  res.json({ data: growth, totalUsers, totalSellers });
});

// @desc    Summary dashboard stats
// @route   GET /api/admin/analytics/summary
// @access  Private/Admin
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    totalRevenue,
    totalUsers,
    totalProducts,
    pendingOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments({ status: "pending" }),
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalUsers,
    totalProducts,
    pendingOrders,
  });
});
