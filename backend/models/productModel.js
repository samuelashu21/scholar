import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: { 
      type: String,
      required: true,
    },
    rating: { 
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Each option within a variant (e.g. "Red / Size M")
const variantOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },   // e.g. "Red", "Large"
  sku: { type: String, default: "" },
  stock: { type: Number, default: 0 },
  price: { type: Number, default: 0 },       // 0 means use product base price
});

// A variant group (e.g. "Color", "Size")
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },    // e.g. "Color"
  options: { type: [variantOptionSchema], default: [] },
});

const productSchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    image: { 
      type: String,
      required: true,
    }, 
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true, 
    },
     subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true, 
    }, 
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },  
    views: {
      type: Number,
      default: 0,
    },
 
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      }, 
    ], 
    viewedByDevices: [
      {
        type: String, 
      },
    ], 
    reviews: {
      type: [reviewSchema],
      default: [],
    }, 
    rating: {
      type: Number,
      required: true,
      default: 0,
    }, 
    numReviews: {
      type: Number,
      default: 0,
      required: true,
    }, 
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    // Product variants (size, color, etc.)
    variants: {
      type: [variantSchema],
      default: [],
    },
  }, 
  { timestamps: true }
);

// Virtual: if variants exist, countInStock is the sum of all variant option stocks
productSchema.virtual("effectiveStock").get(function () {
  if (!this.variants || this.variants.length === 0) return this.countInStock;
  return this.variants.reduce(
    (total, v) => total + v.options.reduce((s, o) => s + (o.stock || 0), 0),
    0
  );
});

// Text index for search
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
