import Like from "../models/likeModel.js";

// likeController.js
export const toggleLike = async (req, res) => {
  const userId = req.user._id;
  const productId = req.params.id;

  // Use findOneAndDelete for a more atomic operation
  const existingLike = await Like.findOne({
    user: userId,
    product: productId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.json({ isLiked: false, message: "Unliked" });
  }

  const newLike = new Like({ user: userId, product: productId });
  await newLike.save(); // Ensure it is saved before responding
  
  res.json({ isLiked: true, message: "Liked" });
};