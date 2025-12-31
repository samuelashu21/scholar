import express from "express";

import multer from "multer";
import path from "path";
import fs from "fs";

import {
  authUser,
  registerUser,
  logoutUser,
  resendOTP,
  verifyOTP,
  requestResetPassword,
  resetPassword,
  resendResetPasswordOTP,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage, 
  getUsers,
  getUserById,
  getSellerById,
  updateUser,
  deleteUser, 
  requestSeller,
  getSellerRequests,
  approveSeller,
  rejectSeller,
} from "../controllers/userController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------------------
// PUBLIC ROUTES
// ---------------------------
router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/request-reset-password", requestResetPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-reset-password-otp", resendResetPasswordOTP);
router.post("/logout", logoutUser);




// ---------------------------
// MULTER SETUP FOR PROFILE IMAGE
// ---------------------------
const uploadsDir = path.join(process.cwd(), "uploadsprofile");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const filename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only (jpg, jpeg, png)"));
  }
}

const upload = multer({
  storage,
  fileFilter: checkFileType,
});

 
// ---------------------------
// USER PROFILE ROUTES
// ---------------------------
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 

// Profile image upload
router.post("/uploadprofile", protect, upload.single("image"), uploadProfileImage);
 
// ---------------------------
// SELLER REQUEST ROUTES
// --------------------------- 
router.post("/request-seller", protect, requestSeller);

// ---------------------------
// ADMIN SELLER MANAGEMENT
// ---------------------------
router.get("/seller-requests", protect, admin, getSellerRequests);
router.put("/approve-seller/:id", protect, admin, approveSeller);
router.put("/reject-seller/:id", protect, admin, rejectSeller);

// ---------------------------
// ADMIN USER MANAGEMENT
// ---------------------------
router.get("/", protect, admin, getUsers);

// VERY LAST ROUTE — MUST STAY LAST 
// Admin: get user by ID
router.get("/:id", protect, admin, getUserById);

// Public or protected seller info by ID
router.get("/seller/:id", protect, getSellerById);
// Update & delete (admin only)
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser); 
export default router;
