import express from "express";

import multer from "multer";
import path from "path";
import fs from "fs";

import {
  authUser,
  registerUser,
  updatePushToken, 
  logoutUser,
  resendOTP,
  verifyOTP,
  requestResetPassword,
  resetPassword,
  resendResetPasswordOTP,
  getUserProfile,
  searchSellers,
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

import { protect, admin ,sellerOrAdmin} from "../middleware/authMiddleware.js";
 
const router = express.Router();

// ---------------------------
// PUBLIC ROUTES
// ---------------------------
router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.route('/push-token').put(protect, updatePushToken); 
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
// ---------------------------
// 4. SELLER ROUTES (Must be above Admin /:id)
// ---------------------------
// ---------------------------
// SELLER REQUEST ROUTES
// --------------------------- 
router.post("/request-seller", protect, requestSeller);

router.get("/search", searchSellers);  

// Public or protected seller info by ID
router.get("/seller/:id", protect, getSellerById);


// ADMIN  MANAGEMENT
// ---------------------------
router.get("/seller-requests", protect, admin, getSellerRequests);
router.put("/approve-seller/:id", protect, admin, approveSeller);
router.put("/reject-seller/:id", protect, admin, rejectSeller);
// ---------------------------
router.get("/", protect, admin, getUsers);


// ---------------------------
// 6. GENERIC ID ROUTES (Must be LAST)
// ---------------------------
// VERY LAST ROUTE — MUST STAY LAST 
// Admin: get user by ID
router.get("/:id", protect, getUserById); 
// Update & delete (admin only)
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser); 
export default router; 
