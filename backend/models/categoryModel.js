import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    categoryname: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true, // you can make it optional if needed
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
 