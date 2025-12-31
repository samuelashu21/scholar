import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
};

export const addToWishlist = async (req, res) => { 
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
 
  if (user.wishlist.includes(productId)) {
    return res.status(400).json({ message: "Already in wishlist" });
  }

  user.wishlist.push(productId);
  await user.save();

  res.json({ message: "Added to wishlist", wishlist: user.wishlist });
};

// Remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId } = req.params;

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
}); 
  