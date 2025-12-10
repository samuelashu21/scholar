import express from "express";

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
// USER PROFILE ROUTES
// ---------------------------
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 

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
router
  .route("/:id")
  .get(protect, admin, getUserById)   
   .get(protect, getSellerById) 
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
