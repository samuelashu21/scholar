import Like from "../models/likeModel.js";

export const toggleLike = async (req, res) => {
  const userId = req.user._id;
  const productId = req.params.id;

  const existingLike = await Like.findOne({
    user: userId,
    product: productId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.json({ isLiked: false });
  }

  await Like.create({ user: userId, product: productId });
  res.json({ isLiked: true });
};
 