import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants/Urls.js";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // 1. Get userInfo from the auth state
    const userInfo = getState().auth.userInfo;
    
    // 2. If token exists, add it to headers
    if (userInfo && userInfo.token) {
      headers.set("authorization", `Bearer ${userInfo.token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery: baseQuery,
  tagTypes: ["Product", "User", "UserDetails", "Order", "Seller", "Category","Subcategory","Wishlist", "Auth","Chats","ChatDetails"   ],
  endpoints: (builder) => ({}),
});
