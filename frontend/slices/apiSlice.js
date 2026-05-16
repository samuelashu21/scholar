import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants/Urls.js";
import { USERS_URL } from "../constants/Urls.js";
import { logout, setCredentials } from "./authSlice";

const CSRF_URL = "/api/csrf-token";
let csrfToken = null;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    if (csrfToken) {
      headers.set("x-csrf-token", csrfToken);
    }

    // 1. Get userInfo from the auth state
    const userInfo = getState().auth.userInfo;
     
    // 2. If token exists, add it to headers
    if (userInfo && userInfo.token) {
      headers.set("authorization", `Bearer ${userInfo.token}`);
    }
    return headers;
  },
});

const getRequestMethod = (args) =>
  (typeof args === "string" ? "GET" : args?.method || "GET").toUpperCase();

const isUnsafeRequest = (args) => !["GET", "HEAD", "OPTIONS"].includes(getRequestMethod(args));

const updateCachedCsrfToken = (result) => {
  const token =
    result?.data?.csrfToken ||
    result?.meta?.response?.headers?.get?.("x-csrf-token") ||
    null;

  if (token) {
    csrfToken = token;
  }
};

const ensureCsrfToken = async (api, extraOptions) => {
  if (csrfToken) {
    return true;
  }

  const tokenResult = await rawBaseQuery(
    {
      url: CSRF_URL,
      method: "GET",
    },
    api,
    extraOptions
  );

  updateCachedCsrfToken(tokenResult);
  return Boolean(csrfToken);
};

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const requestUrl = typeof args === "string" ? args : args?.url;
  const isCsrfRequest = requestUrl === CSRF_URL;
  const isRefreshRequest = requestUrl === `${USERS_URL}/refresh`;

  if (!isCsrfRequest && isUnsafeRequest(args) && !csrfToken) {
    await ensureCsrfToken(api, extraOptions);
  }

  let result = await rawBaseQuery(args, api, extraOptions);
  updateCachedCsrfToken(result);

  if (!isCsrfRequest && result?.error?.status === 403 && isUnsafeRequest(args)) {
    csrfToken = null;
    const tokenLoaded = await ensureCsrfToken(api, extraOptions);
    if (tokenLoaded) {
      result = await rawBaseQuery(args, api, extraOptions);
      updateCachedCsrfToken(result);
    }
  }

  if (result?.error?.status === 401 && !isRefreshRequest) {
    await ensureCsrfToken(api, extraOptions);
    const refreshResult = await rawBaseQuery(
      {
        url: `${USERS_URL}/refresh`,
        method: "POST",
      },
      api,
      extraOptions
    );
    updateCachedCsrfToken(refreshResult);

    if (!refreshResult?.error && refreshResult?.data?.token) {
      const currentUserInfo = api.getState().auth.userInfo;
      if (!currentUserInfo) {
        csrfToken = null;
        api.dispatch(logout());
        return {
          error: {
            status: 401,
            data: { message: "Session expired. Please log in again." },
          },
        };
      }

      api.dispatch(
        setCredentials({
          ...currentUserInfo,
          token: refreshResult.data.token,
        })
      );
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      csrfToken = null;
      api.dispatch(logout());
      return {
        error: {
          status: 401,
          data: { message: "Session expired. Please log in again." },
        },
      };
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Product",
    "User",
    "UserDetails",
    "Order",
    "Seller",
    "Category",
    "Subcategory",
    "Wishlist",
    "Auth",
    "Chats",
    "ChatDetails",
  ],
  endpoints: (builder) => ({}),
}); 
