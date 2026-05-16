import mongoose from "mongoose";

const subcategorySchema = mongoose.Schema(
  {
    subcategoryName: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate subcategory names
      trim: true,
    },
    // This connects the subcategory to a specific Parent Category
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category", // This must match the name used in mongoose.model("Category", ...)
    },
    image: { 
      type: String,
      required: false, // Optional: if you want icons for subcategories too
    },
  },
  { timestamps: true }
);

subcategorySchema.index({ parentCategory: 1, subcategoryName: 1 });

const Subcategory = mongoose.model("Subcategory", subcategorySchema);
export default Subcategory;
