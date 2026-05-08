import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import Like from "../models/likeModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { cacheKeys, invalidateCachePatterns, withCache } from "../services/cacheService.js";
import { enqueueJob, notificationQueue } from "../queues/index.js";

const normalizeVariants = (variants = []) =>
  variants.map((variant) => ({
    name: variant.name,
    options: (variant.options || []).map((option) => ({
      label: option.label,
      sku: option.sku || "",
      stock: Number(option.stock || 0),
      price: Number(option.price || 0),
    })),
  }));

const getEffectiveStock = (product) => {
  if (product?.variants?.length) {
    return product.variants.reduce((variantTotal, variant) => {
      const optionTotal = (variant.options || []).reduce(
        (acc, option) => acc + (Number(option.stock) || 0),
        0
      );
      return variantTotal + optionTotal;
    }, 0);
  }

  return Number(product.countInStock || 0);
};

const getProducts = asyncHandler(async (req, res) => {
  const defaultPageSize = Number(req.query.limit) || 8;
  const page = Number(req.query.pageNumber) || 1;
  const { keyword, category, subcategory, exclude } = req.query;

  let query = {};

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
  if (exclude) query._id = { $ne: new mongoose.Types.ObjectId(exclude) };

  const userId = req.user?._id?.toString() || "anon";
  const key = cacheKeys.products({
    keyword,
    category,
    subcategory,
    page,
    limit: defaultPageSize,
    exclude,
    userId,
  });

  const payload = await withCache(
    key,
    async () => {
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
        {
          $sort: {
            effectivePriority: -1,
            createdAt: -1,
          },
        },
        { $skip: defaultPageSize * (page - 1) },
        { $limit: defaultPageSize },
      ]);

      const totalCount = await Product.countDocuments(query);
      const populatedProducts = await Product.populate(products, [
        { path: "category", select: "categoryname image" },
        { path: "subcategory", select: "subcategoryName image" },
      ]);

      const productIds = populatedProducts.map((p) => p._id);
      const likes = await Like.find({ product: { $in: productIds } });

      const likeCountMap = {};
      likes.forEach((l) => {
        const pid = l.product.toString();
        likeCountMap[pid] = (likeCountMap[pid] || 0) + 1;
      });

      const userLikedSet = new Set(
        userId !== "anon"
          ? likes.filter((l) => l.user.toString() === userId).map((l) => l.product.toString())
          : []
      );

      return {
        products: populatedProducts.map((p) => ({
          ...p,
          countInStock: getEffectiveStock(p),
          likesCount: likeCountMap[p._id.toString()] || 0,
          isLiked: userLikedSet.has(p._id.toString()),
        })),
        page,
        pages: Math.ceil(totalCount / defaultPageSize),
        total: totalCount,
      };
    },
    5 * 60
  );

  res.json(payload);
});

const getMyProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const { keyword, category, subcategory } = req.query;

  let query = { user: req.user._id };

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
  const userId = req.user?._id?.toString() || "anon";
  const key = cacheKeys.productById({ id: req.params.id, userId });

  const payload = await withCache(
    key,
    async () => {
      const product = await Product.findById(req.params.id)
        .populate("user", "FirstName LastName email")
        .populate("category", "categoryname")
        .populate("subcategory", "subcategoryName")
        .populate({
          path: "reviews.user",
          select: "FirstName LastName",
        });

      if (!product) {
        return null;
      }

      const likesCount = await Like.countDocuments({ product: req.params.id });
      const isLiked =
        userId !== "anon"
          ? await Like.exists({ product: req.params.id, user: userId })
          : false;

      return {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        user: product.user,
        countInStock: getEffectiveStock(product),
        variants: product.variants || [],
        rating: product.rating,
        numReviews: product.numReviews,
        reviews: product.reviews || [],
        views: product.views || 0,
        popularityScore: product.popularityScore,
        createdAt: product.createdAt,
        likesCount,
        isLiked: !!isLiked,
      };
    },
    10 * 60
  );

  if (!payload) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(payload);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, categoryId, subcategoryId, countInStock, variants = [] } =
    req.body;

  if (!name || !price || !categoryId || !subcategoryId) {
    res.status(400);
    throw new Error("Please provide name, price, category, and subcategory");
  }

  const parsedVariants = normalizeVariants(variants);

  const product = new Product({
    user: req.user._id,
    name,
    price,
    description: description || "No description provided",
    image: image || "/uploads/sample.jpg",
    category: categoryId,
    subcategory: subcategoryId,
    variants: parsedVariants,
    countInStock: countInStock || 0,
    numReviews: 0,
  });

  const createdProduct = await product.save();
  await invalidateCachePatterns(["products:list:*"]);
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

  if (Array.isArray(variants)) {
    product.variants = normalizeVariants(variants);
  }

  if (!product.variants?.length) {
    product.countInStock = countInStock ?? product.countInStock;
  }

  if (categoryId) product.category = categoryId;
  if (subcategoryId) product.subcategory = subcategoryId;

  const updatedProduct = await product.save();

  await updatedProduct.populate("category", "categoryname");
  await updatedProduct.populate("subcategory", "subcategoryName");
  await invalidateCachePatterns(["products:list:*", `products:detail:${product._id}:*`]);

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
  await invalidateCachePatterns(["products:list:*", `products:detail:${product._id}:*`]);
  res.json({ message: "Product successfully deleted" });
});

const addView = async (req, res) => {
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
    await invalidateCachePatterns([`products:detail:${product._id}:*`, "products:list:*"]);
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

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

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
  await invalidateCachePatterns(["products:list:*", `products:detail:${product._id}:*`]);

  if (product.user?.toString() !== req.user._id.toString()) {
    const seller = await User.findById(product.user).select("pushToken");
    if (seller?.pushToken) {
      await enqueueJob(notificationQueue, "push", {
        payload: {
          to: seller.pushToken,
          title: "New product review",
          body: `${req.user.FirstName} left a review on ${product.name}.`,
          data: { productId: product._id.toString() },
        },
      });
    }
  }

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

  const popularProducts = await Product.aggregate([
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
    { $sort: { popularityScore: -1 } },
    { $limit: limit },
  ]);

  res.json(popularProducts);
});

const getRecentlyViewedProducts = asyncHandler(async (req, res) => {
  const idsRaw = req.query.ids || "";
  const ids = idsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (!ids.length) {
    return res.json([]);
  }

  const products = await Product.find({ _id: { $in: ids } })
    .populate("category", "categoryname image")
    .populate("subcategory", "subcategoryName image");

  const indexMap = new Map(ids.map((id, idx) => [id, idx]));
  const sorted = products.sort(
    (a, b) => (indexMap.get(a._id.toString()) ?? 9999) - (indexMap.get(b._id.toString()) ?? 9999)
  );

  res.json(sorted);
});

export {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getBannerProducts,
  getPopularProducts,
  getRecentlyViewedProducts,
};
