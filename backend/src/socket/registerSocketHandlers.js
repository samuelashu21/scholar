import User from "../../models/userModel.js";
import { SocketEvents } from "./events.js";

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on(SocketEvents.USER_ONLINE, async (userId) => {
      socket.userId = userId;
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit(SocketEvents.USER_STATUS_CHANGED, { userId, isOnline: true });
    });

    socket.on(SocketEvents.JOIN_ROOM, (chatId) => {
      socket.join(chatId);
    });

    socket.on(SocketEvents.TYPING, (data) => {
      socket.to(data.chatId).emit(SocketEvents.DISPLAY_TYPING, data);
    });

    socket.on(SocketEvents.DELETE_MESSAGE, ({ chatId, messageId }) => {
      socket.to(chatId).emit(SocketEvents.DELETE_MESSAGE, messageId);
    });

    socket.on(SocketEvents.EDIT_MESSAGE, (data) => {
      socket.to(data.chatId).emit(SocketEvents.MESSAGE_EDITED, data);
    });

    socket.on(SocketEvents.NEW_MESSAGE, (message) => {
      socket.to(message.chatId).emit(SocketEvents.MESSAGE_RECEIVED, message);
    });

    socket.on("disconnect", async () => {
      if (socket.userId) {
        const now = new Date();
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: now });
        io.emit(SocketEvents.USER_STATUS_CHANGED, {
          userId: socket.userId,
          isOnline: false,
          lastSeen: now,
        });
      }

      console.log("User Disconnected");
    });
  });
};

export default registerSocketHandlers;
