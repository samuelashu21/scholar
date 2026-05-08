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

const variantOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    sku: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    options: {
      type: [variantOptionSchema],
      default: [],
    },
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
    baseStock: {
      type: Number,
      default: 0,
    }, 
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

productSchema.virtual("countInStock").get(function () {
  if (Array.isArray(this.variants) && this.variants.length > 0) {
    return this.variants.reduce((variantAcc, variant) => {
      const variantStock = (variant.options || []).reduce(
        (optionAcc, option) => optionAcc + (option.stock || 0),
        0
      );
      return variantAcc + variantStock;
    }, 0);
  }
  return this.baseStock || 0;
});

productSchema.virtual("popularityScore").get(function () {
  return (this.views || 0) * 0.3 + (this.numReviews || 0) * 0.5 + (this.rating || 0) * 0.2;
});

const Product = mongoose.model("Product", productSchema);
export default Product;
