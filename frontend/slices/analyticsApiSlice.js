import { apiSlice } from "./apiSlice";

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRevenueAnalytics: builder.query({
      query: (period = "week") => ({
        url: `/api/admin/analytics/revenue`,
        params: { period },
      }),
      keepUnusedDataFor: 60,
    }),

    getTopProducts: builder.query({
      query: (limit = 10) => ({
        url: `/api/admin/analytics/top-products`,
        params: { limit },
      }),
      keepUnusedDataFor: 60,
    }),

    getUserGrowth: builder.query({
      query: () => ({
        url: `/api/admin/analytics/user-growth`,
      }),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGetRevenueAnalyticsQuery,
  useGetTopProductsQuery,
  useGetUserGrowthQuery,
} = analyticsApiSlice;
