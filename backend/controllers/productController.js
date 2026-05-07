import asyncHandler from "../middleware/asyncHandler.js";
import Product, { POPULARITY_WEIGHTS } from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js"; // Import Subcategory
import Like from "../models/likeModel.js";
import mongoose from 'mongoose';
import { cacheGet, cacheSet, cacheInvalidatePattern } from "../utils/redisClient.js";

// Cache TTLs
const PRODUCT_LIST_TTL = 5 * 60;  // 5 minutes
const PRODUCT_DETAIL_TTL = 10 * 60; // 10 minutes

 
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const { keyword, category, subcategory, mine } = req.query;

  // Build cache key from query params (skip for authenticated mine queries)
  const cacheKey = `products:list:${keyword || ""}:${category || ""}:${subcategory || ""}:${page}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.json(cached);
  }
   
  let query = {}; 
  
  // 1. Basic Filtering (Keyword/Category/Subcategory)
  if (keyword) {
    const [matchingCategories, matchingSubcategories] = await Promise.all([
      Category.find({ categoryname: { $regex: keyword, $options: "i" } }).select("_id"),
      Subcategory.find({ subcategoryName: { $regex: keyword, $options: "i" } }).select("_id")
    ]);
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { category: { $in: matchingCategories.map(c => c._id) } },
      { subcategory: { $in: matchingSubcategories.map(s => s._id) } }
    ];
  }
  if (category) query.category = new mongoose.Types.ObjectId(category);
  if (subcategory) query.subcategory = new mongoose.Types.ObjectId(subcategory);

  // 2. The Aggregation Pipeline (The "Magic" Sort)
  const products = await Product.aggregate([
    { $match: query }, // Filter products first
    {
      $lookup: {
        from: "users", // Join with the User collection
        localField: "user",
        foreignField: "_id",
        as: "seller"
      }
    },
    { $unwind: "$seller" }, // Convert seller array to object
    {
      $addFields: {
        // We create a priority score. 
        // If subscription is expired, we force it to level 0 (Free)
        effectivePriority: {
          $cond: [
            { $gt: ["$seller.sellerRequest.subscriptionEnd", new Date()] },
            { $ifNull: ["$seller.sellerRequest.subscriptionLevel", 0] },
            0
          ]
        }
      }
    },
    { 
      $sort: {
        effectivePriority: -1, 
        createdAt: -1
      }
    },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize }
  ]);

  // 3. Count total for pagination
  const totalCount = await Product.countDocuments(query);
  // 4. Populate Category/Subcategory (Manually since aggregate doesn't auto-populate)
  const populatedProducts = await Product.populate(products, [
    { path: "category", select: "categoryname image" },
    { path: "subcategory", select: "subcategoryName image" }
  ]);
  // 5. Like Handling (Reuse your existing logic)
  const userId = req.user?._id?.toString();
  const productIds = populatedProducts.map((p) => p._id);
  const likes = await Like.find({ product: { $in: productIds } });
  
  const likeCountMap = {};
  likes.forEach((l) => {
    const pid = l.product.toString();
    likeCountMap[pid] = (likeCountMap[pid] || 0) + 1;
  });

  const userLikedSet = new Set(
    userId ? likes.filter(l => l.user.toString() === userId).map(l => l.product.toString()) : []
  );

  const responseData = {
    products: populatedProducts.map((p) => ({
      ...p,
      likesCount: likeCountMap[p._id.toString()] || 0,
      isLiked: userLikedSet.has(p._id.toString()),
    })),
    page,
    pages: Math.ceil(totalCount / pageSize),
    total: totalCount,
  };

  // Cache the result (skip user-specific likes — cache only for anonymous/general queries)
  if (!userId) {
    await cacheSet(cacheKey, responseData, PRODUCT_LIST_TTL);
  }

  res.json(responseData);
});
    


 
export const getMyProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const { keyword, category, subcategory } = req.query;

  console.log("getMyProducts -> req.user:", req.user?._id); // 👈 add

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

  console.log("getMyProducts -> query:", query); // 👈 add

  const products = await Product.find(query)
    .populate("category", "categoryname image")
    .populate("subcategory", "subcategoryName image")
    .sort({ createdAt: -1 }) 
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  const totalCount = await Product.countDocuments(query);

  console.log("getMyProducts -> totalCount:", totalCount); // 👈 add

  res.json({
    products,
    page,
    pages: Math.ceil(totalCount / pageSize),
    total: totalCount,
  });
});



// @route   GET /api/products/:id 

const getProductById = asyncHandler(async (req, res) => {
 
  const product = await Product.findById(req.params.id)
    .populate("user", "FirstName LastName email")
    .populate("category", "categoryname")
    .populate("subcategory", "subcategoryName") // Added populate 
    .populate({
      path: "reviews.user", 
      select: "FirstName LastName",
    });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Defensive default for arrays
  // Handle Likes for Single Product
  // Assuming 'likes' is an array of User IDs in your Product model 
  product.likes = product.likes || [];
  product.reviews = product.reviews || [];

  const userId = req.user?._id?.toString();
   
  // Count likes from the Like collection
  const likesCount = await Like.countDocuments({ product: req.params.id });

  const isLiked = userId 
    ? await Like.exists({ product: req.params.id, user: userId }) 
    : false; 
 
  res.json({
    _id: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory, // Added to response 
    user: product.user,
    countInStock: product.countInStock,
    rating: product.rating,
    numReviews: product.numReviews,
    reviews: product.reviews || [], // make sure this is included!
    createdAt: product.createdAt,

    // ✅ SAFE
    likesCount,
    isLiked: !!isLiked, 
  });
});
 
 
const createProduct = asyncHandler(async (req, res) => {
  // Extract full data from the request body
  const {  
    name, 
    price, 
    description, 
    image, 
    categoryId, 
    subcategoryId, 
    countInStock 
  } = req.body;

  // Validation: Ensure required fields are present
  if (!name || !price || !categoryId || !subcategoryId) {
    res.status(400);
    throw new Error("Please provide name, price, category, and subcategory");
  }
  const product = new Product({
    user: req.user._id, // The seller/admin creating it
    name,
    price,
    description: description || "No description provided",
    image: image || "/uploads/sample.jpg",
    category: categoryId,
    subcategory: subcategoryId,
    countInStock: countInStock || 0,
    numReviews: 0,
  });

  const createdProduct = await product.save();
  // Invalidate product list cache on new product
  await cacheInvalidatePattern("products:list:*");
  res.status(201).json(createdProduct);
}); 


const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, categoryId,subcategoryId, countInStock } =
    req.body;
 
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Only the seller who owns the product or admin can update
  if (
    product.user.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error("Not authorized to update this product");
  }

  product.name = name || product.name;
  product.price = price || product.price;
  product.description = description || product.description;
  product.image = image || product.image;
  product.countInStock = countInStock || product.countInStock;

  if (categoryId) {
    product.category = categoryId;
  }  
   if (subcategoryId) {
    product.subcategory = subcategoryId;
  }  
  
  const updatedProduct = await product.save();
  // Invalidate caches for this product and the list
  await Promise.all([
    cacheInvalidatePattern("products:list:*"),
    cacheInvalidatePattern(`products:detail:${product._id}`),
  ]);
 
  // Populate category name before sending response
  await updatedProduct.populate("category", "categoryname");
  await updatedProduct.populate("subcategory", "subcategoryName"); 

  res.json(updatedProduct);
});

// @desc    Delete product (seller only if owner, admin can delete any)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Only the seller who owns the product or admin can delete
  if (
    product.user.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error("Not authorized to delete this product");
  }

  await Product.deleteOne({ _id: product._id });
  // Invalidate caches
  await Promise.all([
    cacheInvalidatePattern("products:list:*"),
    cacheInvalidatePattern(`products:detail:${product._id}`),
  ]);
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
  }

  res.json({ views: product.views });
};

/* ================================================
   Create a product review
================================================= */
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
    product.reviews.reduce((acc, item) => acc + item.rating, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
});



// controllers/productController.js
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
    { $sort: { createdAt: -1 } }, // or random/sample
    { $limit: limit },
  ]);

  const populated = await Product.populate(products, [
    { path: "category", select: "categoryname image" },
    { path: "subcategory", select: "subcategoryName image" },
  ]);

  res.json(populated);
});

/**
 * GET /api/products/popular?limit=10
 * Returns products sorted by popularity score (views * 0.3 + numReviews * 0.5 + rating * 0.2)
 */
const getPopularProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);

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
    { $sort: { popularityScore: -1 } },
    { $limit: limit },
  ]);

  const populated = await Product.populate(products, [
    { path: "category", select: "categoryname image" },
    { path: "subcategory", select: "subcategoryName image" },
  ]);

  res.json(populated);
});

/**
 * POST /api/products/recently-viewed
 * Body: { ids: ["id1", "id2", ...] }
 * Accepts a list of product IDs (stored client-side) and returns populated products.
 * Avoids growing viewedBy array per user on the server side.
 */
const getRecentlyViewedProducts = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.json([]);
  }

  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const products = await Product.find({ _id: { $in: objectIds } })
    .populate("category", "categoryname image")
    .populate("subcategory", "subcategoryName image")
    .select("-viewedBy -viewedByDevices -reviews");

  // Preserve client-side order
  const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
  const ordered = objectIds
    .map((id) => productMap[id.toString()])
    .filter(Boolean);

  res.json(ordered);
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
