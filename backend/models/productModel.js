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

// Variant option sub-schema (e.g. "Red / M" with its own sku, stock, price)
const variantOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    sku: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

// Variant group (e.g. "Color", "Size")
const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    options: { type: [variantOptionSchema], default: [] },
  },
  { _id: false }
);

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

    // Base stock (used when no variants defined)
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },

    // Product variants (e.g. Color/Size combinations)
    variants: {
      type: [variantSchema],
      default: [],
    },
  }, 
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Popularity score weights (single source of truth — used here and in analyticsController)
export const POPULARITY_WEIGHTS = { views: 0.3, reviews: 0.5, rating: 0.2 };

// Virtual: total stock = sum of all variant option stocks when variants exist,
// otherwise falls back to countInStock field.
productSchema.virtual("totalStock").get(function () {
  if (!this.variants || this.variants.length === 0) return this.countInStock;
  return this.variants.reduce((sum, variant) => {
    return sum + variant.options.reduce((s, opt) => s + (opt.stock || 0), 0);
  }, 0);
});

// Virtual: popularity score for recommendation ranking
productSchema.virtual("popularityScore").get(function () {
  return (this.views || 0) * POPULARITY_WEIGHTS.views +
    (this.numReviews || 0) * POPULARITY_WEIGHTS.reviews +
    (this.rating || 0) * POPULARITY_WEIGHTS.rating;
});

const Product = mongoose.model("Product", productSchema);
export default Product;
