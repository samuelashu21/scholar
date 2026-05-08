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
    variants: {
      type: [variantSchema],
      default: [],
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    }, 
  }, 
  { timestamps: true }
);

productSchema.virtual("popularityScore").get(function () {
  return (this.views || 0) * 0.3 + (this.numReviews || 0) * 0.5 + (this.rating || 0) * 0.2;
});

productSchema.methods.getVariantStockTotal = function () {
  if (!Array.isArray(this.variants) || this.variants.length === 0) {
    return this.countInStock || 0;
  }

  return this.variants.reduce((variantTotal, variant) => {
    const optionsTotal = (variant.options || []).reduce(
      (optionTotal, option) => optionTotal + (Number(option.stock) || 0),
      0
    );
    return variantTotal + optionsTotal;
  }, 0);
};

productSchema.pre("save", function (next) {
  if (Array.isArray(this.variants) && this.variants.length > 0) {
    this.countInStock = this.getVariantStockTotal();
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
