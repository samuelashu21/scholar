import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants/Urls.js";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include", // send HTTP-only cookies
  prepareHeaders: (headers, { getState }) => {
    const userInfo = getState().auth.userInfo;
    if (userInfo && userInfo.token) {
      headers.set("authorization", `Bearer ${userInfo.token}`);
    }
    return headers;
  },
});

/**
 * Wraps the base query to handle access token expiry.
 * On a 401 with message "token_expired", calls /refresh to get a new access
 * token (refreshed via HTTP-only cookie) and retries the original request once.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    result.error.status === 401 &&
    result.error.data?.message === "token_expired"
  ) {
    // Attempt to refresh the access token
    const refreshResult = await rawBaseQuery(
      { url: "/api/users/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Token refreshed successfully — retry original request
      result = await rawBaseQuery(args, api, extraOptions);
    }
    // If refresh failed, the original 401 propagates naturally
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "User", "UserDetails", "Order", "Seller", "Category", "Subcategory", "Wishlist", "Auth", "Chats", "ChatDetails"],
  endpoints: (builder) => ({}),
});
