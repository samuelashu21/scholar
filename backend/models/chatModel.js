import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  { 
    sender: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,  
    },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false }, 
    isEdited: { type: Boolean, default: false }, 
    // Optional: add this if you want to support "Delivered" status specifically
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // <--- ADD THIS 
    replyTo: {
      text: { type: String },
      senderName: { type: String },
      messageId: { type: mongoose.Schema.Types.ObjectId }
    }, 
    status: {  
      type: String, 
      enum: ["sent", "delivered", "read"], 
      default: "sent" 
    }, 
  },
  { timestamps: true }
);

const chatSchema = mongoose.Schema(
  { 
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Optional: link to the product they are discussing 
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    messages: [messageSchema], 
    lastMessage: { type: String },
    // Useful for sorting the inbox (most recent chats at the top)
    lastMessageTime: { type: Date, default: Date.now }, 
  },
  { timestamps: true } 
);

const Chats = mongoose.model("Chats", chatSchema);
export default Chats; 