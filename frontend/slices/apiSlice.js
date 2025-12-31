import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants/Urls.js";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL, 
  // prepareHeaders: (headers) => {
  //   headers.set("Content-Type", "application/json");
  //   return headers;
  // },
});

export const apiSlice = createApi({
  baseQuery: baseQuery,
  tagTypes: ["Product", "User", "UserDetails", "Order", "Seller", "Category","Wishlist", "Auth"   ],
  endpoints: (builder) => ({}),
});
