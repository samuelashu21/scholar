import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants/Urls.js";
import { logout, setCredentials } from "./authSlice";

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

let refreshPromise = null;

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        let refreshResult = await baseQuery(
          { url: "/api/auth/refresh", method: "POST" },
          api,
          extraOptions
        );

        if (refreshResult?.error) {
          refreshResult = await baseQuery(
            { url: "/api/users/refresh", method: "POST" },
            api,
            extraOptions
          );
        }

        return refreshResult;
      })().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshResult = await refreshPromise;

    if (refreshResult?.data?.success && refreshResult.data.data?.accessToken) {
      const existing = api.getState().auth?.userInfo || {};
      api.dispatch(
        setCredentials({
          ...existing,
          token: refreshResult.data.data.accessToken,
        })
      );
      result = await baseQuery(args, api, extraOptions);
    } else if (refreshResult?.data?.accessToken) {
      const existing = api.getState().auth?.userInfo || {};
      api.dispatch(setCredentials({ ...existing, token: refreshResult.data.accessToken }));
      result = await baseQuery(args, api, extraOptions);
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
