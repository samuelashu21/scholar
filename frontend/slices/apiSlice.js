import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants/Urls.js";
import { USERS_URL } from "../constants/Urls.js";
import { logout, setCredentials } from "./authSlice";

const rawBaseQuery = fetchBaseQuery({
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

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const requestUrl = typeof args === "string" ? args : args?.url;
  const isRefreshRequest = requestUrl === `${USERS_URL}/refresh`;

  if (result?.error?.status === 401 && !isRefreshRequest) {
    const refreshResult = await rawBaseQuery(
      {
        url: `${USERS_URL}/refresh`,
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult?.data?.token) {
      const currentUserInfo = api.getState().auth.userInfo;
      if (currentUserInfo) {
        api.dispatch(
          setCredentials({
            ...currentUserInfo,
            token: refreshResult.data.token,
          })
        );
      }
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "User", "UserDetails", "Order", "Seller", "Category","Subcategory","Wishlist", "Auth","Chats","ChatDetails"   ],
  endpoints: (builder) => ({}),
});
