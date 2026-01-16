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
  }),
});

export const {
  useGetMyChatsQuery,
  useGetChatDetailsQuery,
  useSendMessageMutation,
} = chatApiSlice; 