import asyncHandler from "../middleware/asyncHandler.js";
import Subcategory from "../models/subcategoryModel.js";

// @desc    Get all subcategories (Optionally filter by parentCategory)
const getSubcategories = asyncHandler(async (req, res) => {
  const { categoryId } = req.query; // If passed, filter by main category
  const filter = categoryId ? { parentCategory: categoryId } : {};
  
  const subcategories = await Subcategory.find(filter).populate("parentCategory", "categoryname");
  res.json(subcategories);
});
 
// @desc    Add new subcategory (admin only)
const createSubcategory = asyncHandler(async (req, res) => {
  const { subcategoryName, parentCategory, image } = req.body;

  if (!subcategoryName || !parentCategory) {
    res.status(400);
    throw new Error("Subcategory name and parent category ID are required");
  }

  const subcategoryExists = await Subcategory.findOne({ subcategoryName });
  if (subcategoryExists) {
    res.status(400);
    throw new Error("Subcategory already exists");
  }

  const subcategory = new Subcategory({
    subcategoryName,
    parentCategory, // This should be the _id of the Category
    image,
  });

  const createdSubcategory = await subcategory.save();
  res.status(201).json(createdSubcategory);
});

// @desc    Update subcategory (admin only)
const updateSubcategory = asyncHandler(async (req, res) => {
  const { subcategoryName, parentCategory, image } = req.body;
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    res.status(404);
    throw new Error("Subcategory not found");
  }

  if (subcategoryName) subcategory.subcategoryName = subcategoryName;
  if (parentCategory) subcategory.parentCategory = parentCategory;
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