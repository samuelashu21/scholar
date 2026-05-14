import { PRODUCT_URL } from "../constants/Urls";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword, pageNumber, category, subcategory, sort }) => ({
        url: PRODUCT_URL,
        params: { keyword, pageNumber, category, subcategory, sort },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Product", "Auth"],
    }),

    getMyProducts: builder.query({
      query: ({ keyword, pageNumber, category, subcategory, sort }) => ({
        url: `${PRODUCT_URL}/my-products`,
        params: { keyword, pageNumber, category, subcategory, sort },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Product"],
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
      query: (data) => ({
        // 1. Add (data) here
        url: PRODUCT_URL,
        method: "POST",
        body: data, // 2. Add body: data here
      }),
      invalidatesTags: ["Product"],
    }),

    addView: builder.mutation({
      query: ({ productId, deviceId }) => ({
        url: `/api/products/${productId}/view`,
        method: "PUT",
        body: { deviceId },
      }),
      invalidatesTags: ["Product"],
    }),

    toggleLike: builder.mutation({
      query: (productId) => ({
        url: `/api/products/${productId}/like`,
        method: "PUT",
      }),
      invalidatesTags: ["Product"], // This refreshes the product data in the UI
    }),

    getBannerProducts: builder.query({
      query: (limit = 6) => ({
        url: `${PRODUCT_URL}/banner`,
        params: { limit },
      }), 
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetMyProductsQuery,
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useCreateProductMutation,
  useAddViewMutation,
  useToggleLikeMutation,
  useGetBannerProductsQuery
} = productsApiSlice;
