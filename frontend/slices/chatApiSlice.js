import { apiSlice } from "./apiSlice";
import { CHATS_URL } from "../constants/Urls"; // Define this as "/api/chats"

export const chatApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all my conversations (for the Inbox)
    getMyChats: builder.query({
      query: () => ({
        url: CHATS_URL,
      }),
      providesTags: ["Chats"],
    }),

    // Get a specific conversation
    getChatDetails: builder.query({
      query: (chatId) => ({
        url: `${CHATS_URL}/${chatId}`,
      }),
      providesTags: ["ChatDetails"],
    }),

    // Send a message
    sendMessage: builder.mutation({
      query: (data) => ({
        url: CHATS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chats"],
    }),
    // --- NEW: Edit Message ---
    editMessage: builder.mutation({
      query: ({ chatId, messageId, newText }) => ({
        url: `${CHATS_URL}/${chatId}/message/${messageId}`,
        method: "PUT",
        body: { newText },
      }),
      invalidatesTags: ["ChatDetails", "Chats"],
    }),
  
    unsendMessage: builder.mutation({
      query: ({ chatId, messageId, type }) => ({
        url: `${CHATS_URL}/${chatId}/message/${messageId}`,
        method: "DELETE",
        params: { deleteType: type }, // If type is 'everyone', this sends ?deleteType=everyone
      }),
      invalidatesTags: ["ChatDetails", "Chats"],
    }),
  }), 
});

export const {
  useGetMyChatsQuery,
  useGetChatDetailsQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useUnsendMessageMutation,
} = chatApiSlice;
