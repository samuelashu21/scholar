import asyncHandler from "../middleware/asyncHandler.js";
import Category from "../models/categoryModel.js";

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 
// @desc    Get all categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ categoryname: 1 }).lean();
  res.json(categories);
}); 
 
// @desc    Add new category (admin only)
const createCategory = asyncHandler(async (req, res) => {
  const categoryname = req.body.categoryname?.trim();
  const image = req.body.image?.trim();

  if (!categoryname || !image) {
    res.status(400);
    throw new Error("Category name and image are required");
  }

  const categoryExists = await Category.findOne({
    categoryname: { $regex: `^${escapeRegExp(categoryname)}$`, $options: "i" },
  }).lean();

  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = new Category({ categoryname, image });
  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});


// @desc    Update category (admin only)
const updateCategory = asyncHandler(async (req, res) => {
  const categoryname = req.body.categoryname?.trim();
  const image = req.body.image?.trim();
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Check if the new categoryname already exists (to prevent duplicates)
  if (categoryname && categoryname !== category.categoryname) {
    const exists = await Category.findOne({
      _id: { $ne: category._id },
      categoryname: { $regex: `^${escapeRegExp(categoryname)}$`, $options: "i" },
    }).lean();
    if (exists) {
      res.status(400);
      throw new Error("Category name already exists");
    }
    category.categoryname = categoryname;
  }

  if (image) category.image = image;

  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});


// @desc    Delete category (admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.deleteOne();
  res.json({ message: "Category successfully deleted" });
});

export { getCategories, createCategory, updateCategory, deleteCategory };
 
