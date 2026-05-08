import { apiSlice } from "./apiSlice";

export const adminAnalyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRevenueAnalytics: builder.query({
      query: (period = "week") => ({
        url: "/api/admin/analytics/revenue",
        params: { period },
      }),
    }),
    getTopProductsAnalytics: builder.query({
      query: () => ({
        url: "/api/admin/analytics/top-products",
      }),
    }),
    getUserGrowthAnalytics: builder.query({
      query: () => ({
        url: "/api/admin/analytics/user-growth",
      }),
    }),
  }),
});

export const {
  useGetRevenueAnalyticsQuery,
  useGetTopProductsAnalyticsQuery,
  useGetUserGrowthAnalyticsQuery,
} = adminAnalyticsApiSlice;
