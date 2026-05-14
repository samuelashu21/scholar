import asyncHandler from "../middleware/asyncHandler.js";
import Chats from "../models/chatModel.js";

// @desc    Get all conversations for a user
// @route   GET /api/chats
const getMyChats = asyncHandler(async (req, res) => {
  const chat = await Chats.find({ participants: req.user._id })
    .populate("participants", "FirstName LastName profileImage")
    .populate("product", "name price image")
    .populate({
      path: "messages",
      options: { limit: 1, sort: { createdAt: -1 } },
    })
    .sort({ updatedAt: -1 });

  res.json(chat);
});

// @desc    Send a message / Create conversation
// @route   POST /api/chats
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, text, productId, replyTo } = req.body;
  // 1. Check if conversation already exists
  let chat = await Chats.findOne({
    participants: { $all: [req.user._id, receiverId] },
  });
  // 2. If not, create new one
  if (!chat) {
    chat = new Chats({
      participants: [req.user._id, receiverId],
      product: productId,
      messages: [],
    });
  }
  // 3. Add message
  const newMessage = {
    sender: req.user._id,
    text,
    isRead: false, // Explicitly set as false for new messages
    replyTo: replyTo ? replyTo : null, // Save the reply object
  };
  chat.messages.push(newMessage);
  chat.lastMessage = text;
  chat.lastMessageTime = Date.now();
  // Use a dedicated field for sorting if necessary, or rely on updatedAt
  await chat.save();
  res.status(201).json(chat);
});

// @desc    Get messages for a specific chat
// @route   GET /api/chats/:id
const getChatById = asyncHandler(async (req, res) => {
  // 1. Update messages: Mark as read if the current user is NOT the sender
  // This logic runs as soon as the user opens the ChatScreen
  await Chats.updateOne(
    { _id: req.params.id },
    {
      $set: { "messages.$[elem].isRead": true },
    },
    {
      arrayFilters: [
        { "elem.sender": { $ne: req.user._id }, "elem.isRead": false },
      ],
    },
  );
  // 2. Fetch the updated chat
  const chat = await Chats.findById(req.params.id)
    .populate("participants", "FirstName LastName profileImage")
    .populate("product");

  if (chat) {
    res.json(chat);
  } else {
    res.status(404);
    throw new Error("Chat not found");
  }
});

// @desc    Delete message (Logic for "For Me" vs "For Everyone")
// @route   DELETE /api/chats/:chatId/message/:messageId
const unsendMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  const { deleteType } = req.query; // "me" or "everyone"

  const chat = await Chats.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  const message = chat.messages.id(messageId);
  if (!message) throw new Error("Message not found");

  if (deleteType === "everyone") {
    // Only sender can delete for everyone
    // 1. AUTHORIZATION: Check if the requester is the sender
    // 1. Find the message to check ownership
    const message = chat.messages.id(messageId);
    if (message.sender.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Only the sender can delete for everyone");
    }
    // 2. HARD DELETE: Remove the message from the messages array entirely
    chat.messages.pull(messageId); // Remove from DB entirely
  } else {
    // "Delete for me" - Just add user to deletedBy array
    // 3. SOFT DELETE: Only hide it for the current user
    const message = chat.messages.id(messageId);
    if (message && !message.deletedBy.includes(req.user._id)) {
      message.deletedBy.push(req.user._id);
    }
  }
  // Update the last message preview for the inbox
  const remaining = chat.messages.filter(
    (m) => !m.deletedBy.includes(req.user._id),
  );
  chat.lastMessage =
    remaining.length > 0
      ? remaining[remaining.length - 1].text
      : "Message deleted";

  await chat.save();
  res.status(200).json({ success: true });
});

// @desc    Edit a message
// @route   PUT /api/chats/:chatId/message/:messageId
const editMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  const { newText } = req.body;
  const chat = await Chats.findOneAndUpdate(
    { _id: chatId, "messages._id": messageId, "messages.sender": req.user._id },
    { $set: { "messages.$.text": newText, "messages.$.isEdited": true } },
    { new: true },
  );
  if (!chat)
    return res
      .status(404)
      .json({ message: "Message not found or unauthorized" });
  res.json(chat);
});

export { getMyChats, sendMessage, getChatById, unsendMessage, editMessage };
