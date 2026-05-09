import express from "express";
import { authLimiter } from "../middleware/rateLimiters.js";
import {
  authUser,
  logoutUser,
  refreshAccessToken,
  getUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authLimiter, authUser);
router.post("/refresh", authLimiter, refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/me", protect, getUserProfile);

export default router;
