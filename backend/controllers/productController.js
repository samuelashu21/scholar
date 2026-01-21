import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js"; // Import Subcategory
import Like from "../models/likeModel.js";
 

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

  // Add this safety check at the very top
  // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  //   res.status(400);
  //   throw new Error("Invalid product ID format");
  // }

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

export {
  getProductById, 
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
