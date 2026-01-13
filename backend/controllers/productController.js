import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js"; // Import Subcategory
import Like from "../models/likeModel.js";

// const getProducts = asyncHandler(async (req, res) => {
//   const pageSize = 8; 
//   const page = Number(req.query.pageNumber) || 1;

//   // 1. Handle Keyword Search
//   const keyword = req.query.keyword
//     ? { name: { $regex: req.query.keyword, $options: "i" } }
//     : {};

//      // 2. Handle Category/Subcategory filters
//   const category = req.query.category ? { category: req.query.category } : {};
//   const subcategory = req.query.subcategory ? { subcategory: req.query.subcategory } : {};
   
//   const filter = {
//     ...keyword, 
//     ...category,
//     ...subcategory, // Added to filter 
//   };

//   // 3. DYNAMIC SORTING LOGIC 
//   // We look for req.query.sort (e.g., "-price", "price", "-rating")
//   // If nothing is provided, we default to newest (-createdAt)
//   const sortOrder = req.query.sort ? req.query.sort.split(',').join(' ') : "-createdAt";

//   const count = await Product.countDocuments(filter);

//   const products = await Product.find(filter)
//     .limit(pageSize)
//     .skip(pageSize * (page - 1))
//     .populate("category", "categoryname image")
//     .populate("subcategory", "subcategoryName image") // Added populate 
//     .populate("user", "FirstName LastName")
//     .sort(sortOrder); // <--- Apply the dynamic sort here 
 
//   const userId = req.user?._id?.toString();

//   /* =======================
//      ✅ FIXED LIKE HANDLING
//      ======================= */

//   // 1️⃣ All likes for these products
//   const productIds = products.map((p) => p._id);

//   const likes = await Like.find({
//     product: { $in: productIds },
//   }).select("user product");

//   // 2️⃣ Count likes per product
//   const likeCountMap = {};
//   likes.forEach((like) => {
//     const pid = like.product.toString();
//     likeCountMap[pid] = (likeCountMap[pid] || 0) + 1;
//   });

//   // 3️⃣ Products liked by current user
//   const userLikedSet = new Set(
//     userId
//       ? likes
//           .filter((like) => like.user.toString() === userId)
//           .map((like) => like.product.toString())
//       : []
//   );

//   /* ======================= */

//   const sanitizedProducts = products.map((p) => ({
//     _id: p._id,
//     name: p.name,
//     price: p.price,
//     image: p.image,
//     category: p.category,
//     subcategory: p.subcategory, // Added to response 
//     user: p.user,
//     countInStock: p.countInStock,
//     rating: p.rating,
//     numReviews: p.numReviews,
//     createdAt: p.createdAt,

//     // ✅ CORRECT LIKE DATA
//     likesCount: likeCountMap[p._id.toString()] || 0,
//     isLiked: userLikedSet.has(p._id.toString()), 
//   }));

//   res.json({
//     products: sanitizedProducts,
//     page,
//     pages: Math.ceil(count / pageSize),
//     total: count,
//   });
// });


// @desc    Get all products with global search (Name, Category, Subcategory)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const { keyword, category, subcategory, sort } = req.query;

  let query = {};

  // --- 1. GLOBAL SEARCH LOGIC ---
  if (keyword) {
    // Find Category/Subcategory IDs that match the text
    const [matchingCategories, matchingSubcategories] = await Promise.all([
      Category.find({ categoryname: { $regex: keyword, $options: "i" } }).select("_id"),
      Subcategory.find({ subcategoryName: { $regex: keyword, $options: "i" } }).select("_id")
    ]);

    const categoryIds = matchingCategories.map(c => c._id);
    const subcategoryIds = matchingSubcategories.map(s => s._id);

    // Search Product Name OR Category OR Subcategory
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { category: { $in: categoryIds } },
      { subcategory: { $in: subcategoryIds } }
    ];
  }

  // --- 2. DIRECT FILTERS (Trending Clicks) ---
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;

  // --- 3. DYNAMIC SORTING ---
  const sortOrder = sort ? sort.split(',').join(' ') : "-createdAt";

  // --- 4. EXECUTE ---
  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("category", "categoryname image")
    .populate("subcategory", "subcategoryName image")
    .populate("user", "FirstName LastName")
    .sort(sortOrder);

  // --- 5. LIKE HANDLING ---
  const userId = req.user?._id?.toString();
  const productIds = products.map((p) => p._id);
  const likes = await Like.find({ product: { $in: productIds } });

  const likeCountMap = {};
  likes.forEach((l) => {
    const pid = l.product.toString();
    likeCountMap[pid] = (likeCountMap[pid] || 0) + 1;
  });

  const userLikedSet = new Set(
    userId ? likes.filter(l => l.user.toString() === userId).map(l => l.product.toString()) : []
  );

  res.json({
    products: products.map((p) => ({
      ...p.toObject(),
      likesCount: likeCountMap[p._id.toString()] || 0,
      isLiked: userLikedSet.has(p._id.toString()),
    })),
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
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
    subcategory: product.subcategory, // Added to response 
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
  const { categoryId, subcategoryId } = req.body;

  // Use provided IDs or try to find defaults
  let finalCategory = categoryId;
  let finalSubcategory = subcategoryId;

  if (!finalCategory) {
    const firstCat = await Category.findOne();
    finalCategory = firstCat?._id;
  }

  if (!finalSubcategory) {
    // Note: We use 'parentCategory' because that is how it's named in your Subcategory model
    const firstSub = await Subcategory.findOne({ parentCategory: finalCategory });
    finalSubcategory = firstSub?._id;
  }

  // Final check: If there are NO subcategories in your DB, Mongoose will throw the error you saw
  if (!finalSubcategory) {
    res.status(400);
    throw new Error("Cannot create product: Please create at least one subcategory first.");
  }

  const product = new Product({
    name: "Sample name",
    price: 0,
    user: req.user._id,
    image: "/uploads/sample.jpg",
    category: finalCategory,
    subcategory: finalSubcategory, // Correctly linked
    countInStock: 0,
    numReviews: 0,
    description: "Sample description",
  });

  const createdProduct = await product.save();
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
