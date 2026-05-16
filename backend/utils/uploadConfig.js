import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

const ALLOWED_EXTENSIONS = /jpg|jpeg|png|webp/;
const ALLOWED_MIME_TYPES = /image\/(jpg|jpeg|png|webp)/;

const checkFileType = (file, cb) => {
  const extname = ALLOWED_EXTENSIONS.test(path.extname(file.originalname).toLowerCase());
  const mimetype = ALLOWED_MIME_TYPES.test((file.mimetype || "").toLowerCase());

  if (extname && mimetype) {
    return cb(null, true);
  }

  return cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
};

export const createImageUploadMiddleware = ({ folder }) =>
  multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: async () => ({
        folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        resource_type: "image",
        transformation: [
          {
            width: 1600,
            height: 1600,
            crop: "limit",
            quality: "auto:good",
            fetch_format: "auto",
          },
        ],
      }),
    }),
    limits: {
      fileSize: MAX_IMAGE_SIZE_BYTES,
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    },
  });

export const getUploadErrorDetails = (error) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return {
        statusCode: 413,
        message: `Image too large. Maximum upload size is ${Math.round(
          MAX_IMAGE_SIZE_BYTES / (1024 * 1024)
        )}MB.`,
      };
    }

    return {
      statusCode: 400,
      message: error.message,
    };
  }

  return {
    statusCode: 400,
    message: error?.message || "Error processing upload",
  };
};
