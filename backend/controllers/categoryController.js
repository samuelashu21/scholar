import asyncHandler from "../middleware/asyncHandler.js";
import Category from "../models/categoryModel.js";
import { cacheGet, cacheSet, cacheDel } from "../config/redis.js";

const CATEGORIES_CACHE_KEY = "categories:all";
const CATEGORY_TTL = 24 * 60 * 60; // 24 hours

// @desc    Get all categories
const getCategories = asyncHandler(async (req, res) => {
  const cached = await cacheGet(CATEGORIES_CACHE_KEY);
  if (cached) return res.json(cached);

  const categories = await Category.find({});
  await cacheSet(CATEGORIES_CACHE_KEY, categories, CATEGORY_TTL);
  res.json(categories);
}); 
 
// @desc    Add new category (admin only)
const createCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryname, image } = req.body;
 
    if (!categoryname || !image) {
      throw new Error("Category name and image are required");
    }
    const categoryExists = await Category.findOne({ categoryname });

    if (categoryExists) {
      res.status(400);
      throw new Error("Category already exists");
    }
    
    const category = new Category({ categoryname, image });

    const createdCategory = await category.save();
    await cacheDel(CATEGORIES_CACHE_KEY);
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error while creating category",
      error: error.stack,
    });
  }
});


// @desc    Update category (admin only)
const updateCategory = asyncHandler(async (req, res) => {
  const { categoryname, image } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (categoryname && categoryname !== category.categoryname) {
    const exists = await Category.findOne({ categoryname });
    if (exists) {
      res.status(400);
      throw new Error("Category name already exists");
    }
    category.categoryname = categoryname;
  }

  if (image) category.image = image;

  const updatedCategory = await category.save();
  await cacheDel(CATEGORIES_CACHE_KEY);
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
  await cacheDel(CATEGORIES_CACHE_KEY);
  res.json({ message: "Category successfully deleted" });
});

export { getCategories, createCategory, updateCategory, deleteCategory };
 