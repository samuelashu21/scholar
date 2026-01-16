import express from "express";
const router = express.Router();
import { getMyChats, sendMessage, getChatById } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

router.route("/").get(protect, getMyChats).post(protect, sendMessage);
router.route("/:id").get(protect, getChatById);

export default router;  