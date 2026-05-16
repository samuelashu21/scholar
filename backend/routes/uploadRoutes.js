 
import express from "express";
import {
  createImageUploadMiddleware,
  getUploadErrorDetails,
} from "../utils/uploadConfig.js";

const router = express.Router();
const upload = createImageUploadMiddleware({ folder: "scholar/products" });

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.send({
    message: "Image uploaded successfully",
    image: req.file.path,
  });
});



router.use((err, req, res, next) => {
  const { statusCode, message } = getUploadErrorDetails(err);
  res.status(statusCode).json({ message });
});

export default router;   