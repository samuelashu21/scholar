import { apiSlice } from "./apiSlice";

const ANALYTICS_URL = "/api/admin/analytics";

export const analyticsApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getRevenue: builder.query({
      query: (period = "week") => ({
        url: `${ANALYTICS_URL}/revenue`,
        params: { period },
      }),
      keepUnusedDataFor: 60,
    }),
    getTopProducts: builder.query({
      query: (limit = 10) => ({
        url: `${ANALYTICS_URL}/top-products`,
        params: { limit },
      }),
      keepUnusedDataFor: 60,
    }),
    getUserGrowth: builder.query({
      query: () => ({
        url: `${ANALYTICS_URL}/user-growth`,
      }),
      keepUnusedDataFor: 60,
    }),
    getDashboardSummary: builder.query({
      query: () => ({
        url: `${ANALYTICS_URL}/summary`,
      }),
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useGetRevenueQuery,
  useGetTopProductsQuery,
  useGetUserGrowthQuery,
  useGetDashboardSummaryQuery,
} = analyticsApiSlice;
