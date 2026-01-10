import { PRODUCT_URL } from "../constants/Urls";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword, pageNumber, category }) => ({
        url: PRODUCT_URL,
        params: { keyword, pageNumber, category },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Product", "Auth"],
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Product"],
    }), 

    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/${data.productId}/reviews`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/${data.productId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: "/api/upload",
        method: "POST",
        body: data,
      }),
    }),
    createProduct: builder.mutation({
      query: () => ({
        url: PRODUCT_URL,
        method: "POST",
      }),
      invalidatesTags: ["Product"],
    }),

    addView: builder.mutation({
      query: ({ productId, deviceId }) => ({
        url: `/api/products/${productId}/view`,
        method: "PUT",
        body: { deviceId },
      }), 
    }),  

    toggleLike: builder.mutation({
      query: (productId) => ({
        url: `/api/products/${productId}/like`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useCreateProductMutation,
  useAddViewMutation,
  useToggleLikeMutation,
} = productsApiSlice;
