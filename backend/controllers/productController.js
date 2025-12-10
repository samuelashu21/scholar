import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

const getProducts = asyncHandler(async (req, res) => { 
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: { $regex: req.query.keyword, $options: "i" },
      }
    : {}; 
  
  let filter = { ...keyword };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1)) 
    .populate("category", "categoryname") // populate category name
    .populate("user", "FirstName LastName")   // seller info
    .sort({ createdAt: -1 }); // most recent first 

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count, 
  });
}); 

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
   .populate("user", "FirstName LastName email"); // include seller name/email 
 
  if (product) { 
   return res.json(product);
  }
  res.status(404); 
  throw new Error("Product not found ");
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
  const { name, price, description, image, categoryId, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404); 
    throw new Error("Product not found");
  }

  // Only the seller who owns the product or admin can update
  if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
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
  if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error("Not authorized to delete this product");
  }

  await Product.deleteOne({ _id: product._id });
  res.json({ message: "Product successfully deleted" });
}); 

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        res.status(400)
        throw new Error("Product already reviewed");
    }
    const review={
        name:req.user.FirstName,
        rating:Number(rating), 
        comment,
        user:req.user._id
    }
    product.reviews.push(review);

    product.numReviews=product.reviews.length;
    product.rating=product.reviews.reduce((acc, item) => item.rating+acc,0)/product.reviews.length;
    await product.save();
    res.status(201).json({message:"Review added"});
  }else{
    res.status(404)
    throw new Error("Product not found");
  }
});


export{
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview
} 