import { apiSlice } from "./apiSlice";

import {
  ORDERS_URL,
} from "../constants/Urls";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),

    // Admin: list all orders
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
    }),

    // Admin: mark as delivered (legacy)
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
    }),

    // Admin/seller: full lifecycle status update
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status, note }) => ({
        url: `${ORDERS_URL}/${orderId}/status`,
        method: "PUT",
        body: { status, note },
      }),
    }),
  }),
});

export const { 
  useCreateOrderMutation,
  useGetOrderDetailsQuery, 
  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApiSlice;
