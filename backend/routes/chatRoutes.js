import express from "express";
const router = express.Router();
import { 
  getMyChats, 
  sendMessage, 
  getChatById, 
  unsendMessage, 
  editMessage 
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

// Root routes: /api/chats
router.route("/")
  .get(protect, getMyChats)
  .post(protect, sendMessage);

// Detail routes: /api/chats/:id
router.route("/:id")
  .get(protect, getChatById);

// --- THE FIX IS HERE ---
// Message specific routes: /api/chats/:chatId/message/:messageId
router.route("/:chatId/message/:messageId")
  .put(protect, editMessage)      // Matches useEditMessageMutation
  .delete(protect, unsendMessage); // Matches useUnsendMessageMutation

export default router;