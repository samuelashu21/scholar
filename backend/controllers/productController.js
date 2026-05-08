import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import Like from "../models/likeModel.js";
import mongoose from "mongoose";
import { deleteCacheByPattern, getCachedValue, setCachedValue } from "../utils/cache.js";
import { sendInternalNotification } from "../utils/internalNotification.js";
import { enqueueAnalytics } from "../queues/jobQueues.js";

const buildProductCacheKey = (prefix, payload = {}) => {
  const sorted = Object.keys(payload)
    .sort()
    .reduce((acc, key) => {
      if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") {
        acc[key] = payload[key];
      }
      return acc;
    }, {});
  return `${prefix}:${JSON.stringify(sorted)}`;
};

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 8;
  const page = Number(req.query.pageNumber) || 1;
  const { keyword, category, subcategory, exclude } = req.query;

  const cacheKey = buildProductCacheKey("products:list", {
    keyword,
    category,
    subcategory,
    exclude,
    page,
    pageSize,
    userId: req.user?._id?.toString(),
  });
  const cached = await getCachedValue(cacheKey);
  if (cached) return res.json(cached);

  const query = {};

  if (keyword) {
    const [matchingCategories, matchingSubcategories] = await Promise.all([
      Category.find({ categoryname: { $regex: keyword, $options: "i" } }).select("_id"),
      Subcategory.find({ subcategoryName: { $regex: keyword, $options: "i" } }).select("_id"),
    ]);
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { category: { $in: matchingCategories.map((c) => c._id) } },
      { subcategory: { $in: matchingSubcategories.map((s) => s._id) } },
    ];
  }

  if (category) query.category = new mongoose.Types.ObjectId(category);
  if (subcategory) query.subcategory = new mongoose.Types.ObjectId(subcategory);
  if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
    query._id = { $ne: new mongoose.Types.ObjectId(exclude) };
  }

  const products = await Product.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "seller",
      },
    },
    { $unwind: "$seller" },
    {
      $addFields: {
        effectivePriority: {
          $cond: [
            { $gt: ["$seller.sellerRequest.subscriptionEnd", new Date()] },
            { $ifNull: ["$seller.sellerRequest.subscriptionLevel", 0] },
            0,
          ],
        },
      },
    },
    { $sort: { effectivePriority: -1, createdAt: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
  ]);

  const totalCount = await Product.countDocuments(query);
  const populatedProducts = await Product.populate(products, [
    { path: "category", select: "categoryname image" },
    { path: "subcategory", select: "subcategoryName image" },
  ]);

  const userId = req.user?._id?.toString();
  const productIds = populatedProducts.map((p) => p._id);
  const likes = await Like.find({ product: { $in: productIds } });

  const likeCountMap = {};
  likes.forEach((l) => {
    const pid = l.product.toString();
    likeCountMap[pid] = (likeCountMap[pid] || 0) + 1;
  });

  const userLikedSet = new Set(
    userId ? likes.filter((l) => l.user.toString() === userId).map((l) => l.product.toString()) : []
  );

  const response = {
    products: populatedProducts.map((p) => ({
      ...p,
      likesCount: likeCountMap[p._id.toString()] || 0,
      isLiked: userLikedSet.has(p._id.toString()),
    })),
    page,
    pages: Math.ceil(totalCount / pageSize),
    total: totalCount,
  };

  await setCachedValue(cacheKey, response, 5 * 60);
  res.json(response);
});

export const getMyProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const { keyword, category, subcategory } = req.query;

  const query = { user: req.user._id };

  if (keyword) {
    const [matchingCategories, matchingSubcategories] = await Promise.all([
      Category.find({ categoryname: { $regex: keyword, $options: "i" } }).select("_id"),
      Subcategory.find({ subcategoryName: { $regex: keyword, $options: "i" } }).select("_id"),
    ]);

    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { category: { $in: matchingCategories.map((c) => c._id) } },
      { subcategory: { $in: matchingSubcategories.map((s) => s._id) } },
    ];
  }

  if (category) query.category = new mongoose.Types.ObjectId(category);
  if (subcategory) query.subcategory = new mongoose.Types.ObjectId(subcategory);

  const products = await Product.find(query)
    .populate("category", "categoryname image")
    .populate("subcategory", "subcategoryName image")
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  const totalCount = await Product.countDocuments(query);

  res.json({
    products,
    page,
    pages: Math.ceil(totalCount / pageSize),
    total: totalCount,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const cacheKey = buildProductCacheKey("products:detail", {
    productId: req.params.id,
    userId: req.user?._id?.toString(),
  });
  const cached = await getCachedValue(cacheKey);
  if (cached) return res.json(cached);

  const product = await Product.findById(req.params.id)
    .populate("user", "FirstName LastName email")
    .populate("category", "categoryname")
    .populate("subcategory", "subcategoryName")
    .populate({
      path: "reviews.user",
      select: "FirstName LastName",
    });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const userId = req.user?._id?.toString();
  const likesCount = await Like.countDocuments({ product: req.params.id });
  const isLiked = userId ? await Like.exists({ product: req.params.id, user: userId }) : false;

  const response = {
    _id: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    user: product.user,
    countInStock: product.countInStock,
    variants: product.variants,
    rating: product.rating,
    numReviews: product.numReviews,
    reviews: product.reviews || [],
    views: product.views,
    popularityScore: product.popularityScore,
    createdAt: product.createdAt,
    likesCount,
    isLiked: !!isLiked,
  };

  await setCachedValue(cacheKey, response, 10 * 60);
  res.json(response);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, categoryId, subcategoryId, countInStock, variants } = req.body;

  if (!name || !price || !categoryId || !subcategoryId) {
    res.status(400);
    throw new Error("Please provide name, price, category, and subcategory");
  }

  const product = new Product({
    user: req.user._id,
    name,
    price,
    description: description || "No description provided",
    image: image || "/uploads/sample.jpg",
    category: categoryId,
    subcategory: subcategoryId,
    baseStock: countInStock || 0,
    variants: Array.isArray(variants) ? variants : [],
    numReviews: 0,
  });

  const createdProduct = await product.save();
  await deleteCacheByPattern("products:*");
  await sendInternalNotification({
    userId: req.user._id,
    title: "Product created",
    body: `${createdProduct.name} was created successfully.`,
    data: { productId: createdProduct._id.toString(), type: "product_created" },
  });

  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, categoryId, subcategoryId, countInStock, variants } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error("Not authorized to update this product");
  }

  product.name = name || product.name;
  product.price = price || product.price;
  product.description = description || product.description;
  product.image = image || product.image;
  if (countInStock !== undefined) product.baseStock = countInStock;
  if (Array.isArray(variants)) product.variants = variants;

  if (categoryId) {
    product.category = categoryId;
  }
  if (subcategoryId) {
    product.subcategory = subcategoryId;
  }

  const updatedProduct = await product.save();
  await updatedProduct.populate("category", "categoryname");
  await updatedProduct.populate("subcategory", "subcategoryName");

  await deleteCacheByPattern("products:*");
  await sendInternalNotification({
    userId: req.user._id,
    title: "Product updated",
    body: `${updatedProduct.name} was updated.`,
    data: { productId: updatedProduct._id.toString(), type: "product_updated" },
  });

  res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error("Not authorized to delete this product");
  }

  await Product.deleteOne({ _id: product._id });
  await deleteCacheByPattern("products:*");
  await sendInternalNotification({
    userId: req.user._id,
    title: "Product deleted",
    body: `${product.name} was deleted.`,
    data: { productId: product._id.toString(), type: "product_deleted" },
  });
  res.json({ message: "Product successfully deleted" });
});

export const addView = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });

  const { deviceId } = req.body;
  let hasViewed = false;

  if (req.user) {
    hasViewed = product.viewedBy.includes(req.user._id);
    if (!hasViewed) {
      product.viewedBy.push(req.user._id);
    }
  } else if (deviceId) {
    hasViewed = product.viewedByDevices.includes(deviceId);
    if (!hasViewed) {
      product.viewedByDevices.push(deviceId);
    }
  }

  if (!hasViewed) {
    product.views = (product.views || 0) + 1;
    await product.save();
    await enqueueAnalytics({
      type: "product_view",
      productId: product._id.toString(),
      userId: req.user?._id?.toString(),
      deviceId: deviceId || null,
      timestamp: new Date().toISOString(),
    });
    await deleteCacheByPattern("products:detail*");
  }

  res.json({ views: product.views });
};

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.reviews = product.reviews || [];

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Product already reviewed");
  }

  const review = {
    name: req.user.FirstName,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length;

  await product.save();
  await deleteCacheByPattern("products:*");
  res.status(201).json({ message: "Review added" });
});

const getBannerProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const products = await Product.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "seller",
      },
    },
    { $unwind: "$seller" },
    {
      $match: {
        "seller.sellerRequest.status": "approved",
        "seller.sellerRequest.boostActive": true,
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
  ]);

  const populated = await Product.populate(products, [
    { path: "category", select: "categoryname image" },
    { path: "subcategory", select: "subcategoryName image" },
  ]);

  res.json(populated);
});

const getPopularProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const products = await Product.aggregate([
    {
      $addFields: {
        popularityScore: {
          $add: [
            { $multiply: [{ $ifNull: ["$views", 0] }, 0.3] },
            { $multiply: [{ $ifNull: ["$numReviews", 0] }, 0.5] },
            { $multiply: [{ $ifNull: ["$rating", 0] }, 0.2] },
          ],
        },
      },
    },
    { $sort: { popularityScore: -1, createdAt: -1 } },
    { $limit: limit },
  ]);

  res.json(products);
});

const getRecentlyViewedProducts = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.productIds) ? req.body.productIds : [];
  if (!ids.length) return res.json([]);

  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
  const products = await Product.find({ _id: { $in: objectIds } })
    .populate("category", "categoryname image")
    .populate("subcategory", "subcategoryName image");

  const orderMap = new Map(objectIds.map((id, index) => [id.toString(), index]));
  products.sort((a, b) => (orderMap.get(a._id.toString()) ?? 0) - (orderMap.get(b._id.toString()) ?? 0));

  res.json(products);
});

export {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getBannerProducts,
  getPopularProducts,
  getRecentlyViewedProducts,
};
