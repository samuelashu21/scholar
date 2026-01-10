import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Like from "../models/likeModel.js";

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

     // 🗂 Category filter (ObjectId)  
  const category = req.query.category ? { category: req.query.category } : {};

  const filter = {
    ...keyword, 
    ...category,
  };
  const count = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("category", "categoryname image")
    .populate("user", "FirstName LastName")
    .sort({ createdAt: -1 });
 
  const userId = req.user?._id?.toString();

  /* =======================
     ✅ FIXED LIKE HANDLING
     ======================= */

  // 1️⃣ All likes for these products
  const productIds = products.map((p) => p._id);

  const likes = await Like.find({
    product: { $in: productIds },
  }).select("user product");

  // 2️⃣ Count likes per product
  const likeCountMap = {};
  likes.forEach((like) => {
    const pid = like.product.toString();
    likeCountMap[pid] = (likeCountMap[pid] || 0) + 1;
  });

  // 3️⃣ Products liked by current user
  const userLikedSet = new Set(
    userId
      ? likes
          .filter((like) => like.user.toString() === userId)
          .map((like) => like.product.toString())
      : []
  );

  /* ======================= */

  const sanitizedProducts = products.map((p) => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    image: p.image,
    category: p.category,
    user: p.user,
    countInStock: p.countInStock,
    rating: p.rating,
    numReviews: p.numReviews,
    createdAt: p.createdAt,

    // ✅ CORRECT LIKE DATA
    likesCount: likeCountMap[p._id.toString()] || 0,
    isLiked: userLikedSet.has(p._id.toString()),
  }));

  res.json({
    products: sanitizedProducts,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("user", "FirstName LastName email")
    .populate("category", "categoryname")
    .populate({
      path: "reviews.user",
      select: "FirstName LastName",
    });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Defensive default for arrays
  product.likes = product.likes || [];
  product.reviews = product.reviews || [];

  const userId = req.user?._id?.toString();

  const isLiked = userId
    ? product.likes.some((id) => id.toString() === userId)
    : false;

  res.json({
    _id: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description,
    category: product.category,
    user: product.user,
    countInStock: product.countInStock,
    rating: product.rating,
    numReviews: product.numReviews,
    reviews: product.reviews || [], // make sure this is included!
    createdAt: product.createdAt,

    // ✅ SAFE
    likesCount: product.likes.length,
    isLiked,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const { categoryId } = req.body || {}; // <-- safe destructuring

  // Use a default category if none provided
  let finalCategoryId = categoryId;
  if (!finalCategoryId) {
    const defaultCategory = await Category.findOne(); // pick first category
    finalCategoryId = defaultCategory?._id;
  }

  const product = new Product({
    name: "Sample name",
    user: req.user._id,
    price: 0,
    image: "/uploads/sample.png",
    category: finalCategoryId,
    countInStock: 0,
    numReviews: 0,
    description: "Sample description",
  });

  const createdProduct = await product.save();
  await createdProduct.populate("category", "categoryname");

  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, categoryId, countInStock } =
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

  const updatedProduct = await product.save();

  // Populate category name before sending response
  await updatedProduct.populate("category", "categoryname");

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
  res.json({ message: "Product successfully deleted" });
});

export const addView = async (req, res) => {
  const { deviceId } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // 👤 Logged-in user
  if (req.user) {
    const alreadyViewed = product.viewedBy.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!alreadyViewed) {
      product.views = (product.views || 0) + 1;
      product.viewedBy.push(req.user._id);
      await product.save();
    }
  }
  // 👥 Guest user (device-based)
  else if (deviceId) {
    if (!product.viewedByDevices.includes(deviceId)) {
      product.views = (product.views || 0) + 1;
      product.viewedByDevices.push(deviceId);
      await product.save();
    }
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

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
