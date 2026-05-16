 
import express from "express";
import multer from "multer";
import path from "path"; 
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "scholar/products",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images only");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

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
  const message =
    typeof err === "string"
      ? err
      : err?.message || "Error processing upload";
  res.status(500).json({ message });
});

export default router; 
