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
  },
  { timestamps: true }
);

const Chats = mongoose.model("Chats", chatSchema);
export default Chats; 