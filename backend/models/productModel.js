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
  }, 
  { timestamps: true }
);

productSchema.index({ views: -1, createdAt: -1 });

const Product = mongoose.model("Product", productSchema);
export default Product;