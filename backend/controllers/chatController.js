import asyncHandler from "../middleware/asyncHandler.js";
import Chats from "../models/chatModel.js";

// @desc    Get all conversations for a user
// @route   GET /api/chats
const getMyChats = asyncHandler(async (req, res) => {
  const chat = await Chats.find({ participants: req.user._id })
    .populate("participants", "FirstName LastName profileImage")
    .populate("product", "name price image")
    .populate({
      path: 'messages',
      options: { limit: 1, sort: { createdAt: -1 } } 
    })
    .sort({ updatedAt: -1 }); 

  res.json(chat);
});

// @desc    Send a message / Create conversation
// @route   POST /api/chats
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, text, productId } = req.body;

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
  };
 
  chat.messages.push(newMessage);
  chat.lastMessage = text;
  await chat.save();  

  res.status(201).json(chat);
});

// @desc    Get messages for a specific chat
// @route   GET /api/chats/:id
const getChatById = asyncHandler(async (req, res) => {
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

export { getMyChats, sendMessage, getChatById }; 