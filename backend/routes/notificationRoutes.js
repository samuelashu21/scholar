import express from "express";
import { sendNotification } from "../controllers/notificationController.js";
import { protect, sellerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sellerOrAdmin, sendNotification);

export default router;
