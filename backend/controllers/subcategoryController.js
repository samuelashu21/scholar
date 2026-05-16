import asyncHandler from "../middleware/asyncHandler.js";
import Subcategory from "../models/subcategoryModel.js";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Get all subcategories (Optionally filter by parentCategory)
const getSubcategories = asyncHandler(async (req, res) => {
  const { categoryId } = req.query; // If passed, filter by main category
  if (categoryId && !mongoose.isValidObjectId(categoryId)) {
    res.status(400);
    throw new Error("Invalid category ID");
  }

  const filter = categoryId
    ? { parentCategory: new mongoose.Types.ObjectId(categoryId) }
    : {};
  
  const subcategories = await Subcategory.find(filter)
    .populate("parentCategory", "categoryname")
    .sort({ subcategoryName: 1 })
    .lean();
  res.json(subcategories);
});
 
// @desc    Add new subcategory (admin only)
const createSubcategory = asyncHandler(async (req, res) => {
  const subcategoryName = req.body.subcategoryName?.trim();
  const parentCategory = req.body.parentCategory?.trim();
  const image = req.body.image?.trim();

  if (!subcategoryName || !parentCategory) {
    res.status(400);
    throw new Error("Subcategory name and parent category ID are required");
  }

  const sanitizedParentCategoryId = new mongoose.Types.ObjectId(parentCategory);
  const parentExists = await Category.exists({ _id: sanitizedParentCategoryId });
  if (!parentExists) {
    res.status(400);
    throw new Error("Parent category not found");
  }

  const subcategoryExists = await Subcategory.findOne({
    subcategoryName: { $regex: `^${escapeRegExp(subcategoryName)}$`, $options: "i" },
  }).lean();
  if (subcategoryExists) {
    res.status(400);
    throw new Error("Subcategory already exists");
  }

  const subcategory = new Subcategory({
    subcategoryName,
    parentCategory: sanitizedParentCategoryId, // This should be the _id of the Category
    image,
  });

  const createdSubcategory = await subcategory.save();
  res.status(201).json(createdSubcategory);
});

// @desc    Update subcategory (admin only)
const updateSubcategory = asyncHandler(async (req, res) => {
  const subcategoryName = req.body.subcategoryName?.trim();
  const parentCategory = req.body.parentCategory?.trim();
  const image = req.body.image?.trim();
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    res.status(404);
    throw new Error("Subcategory not found");
  }

  if (subcategoryName && subcategoryName !== subcategory.subcategoryName) {
    const exists = await Subcategory.findOne({
      _id: { $ne: subcategory._id },
      subcategoryName: { $regex: `^${escapeRegExp(subcategoryName)}$`, $options: "i" },
    }).lean();
    if (exists) {
      res.status(400);
      throw new Error("Subcategory already exists");
    }

    subcategory.subcategoryName = subcategoryName;
  }

  if (parentCategory) {
    const sanitizedParentCategoryId = new mongoose.Types.ObjectId(parentCategory);
    const parentExists = await Category.exists({ _id: sanitizedParentCategoryId });
    if (!parentExists) {
      res.status(400);
      throw new Error("Parent category not found");
    }
    subcategory.parentCategory = sanitizedParentCategoryId;
  }

  if (image) subcategory.image = image;

  const updatedSubcategory = await subcategory.save();
  res.json(updatedSubcategory);
});

// @desc    Delete subcategory (admin only)
const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    res.status(404);
    throw new Error("Subcategory not found");
  }

  await subcategory.deleteOne();
  res.json({ message: "Subcategory removed" });
});

export {
  getSubcategories, 
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
}; 
