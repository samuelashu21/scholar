  import { apiSlice } from "./apiSlice";
  import { CATEGORY_URL } from "../constants/Urls";
  
  export const categoriesApiSlice = apiSlice.injectEndpoints({
     overrideExisting: true,  
    endpoints: (builder) => ({
      // Fetch all categories
      getCategories: builder.query({
        query: () => CATEGORY_URL,
        keepUnusedDataFor: 5,
        providesTags: ["Category"],
      }),
  
      // Create a new category (admin only)
      createCategory: builder.mutation({
        query: (data) => ({
          url: CATEGORY_URL,
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["Category"],
      }),
  
      // Update a category (admin only)
      updateCategory: builder.mutation({
        query: ({ categoryId, ...data }) => ({
          url: `${CATEGORY_URL}/${categoryId}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["Category"],
      }),
  
      // Delete a category (admin only)
      deleteCategory: builder.mutation({
        query: (categoryId) => ({
          url: `${CATEGORY_URL}/${categoryId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Category"],
      }),
  
      // Upload category image
      uploadCategoryImage: builder.mutation({
        query: (formData) => ({
          url: "/api/upload", // adjust if your upload endpoint is different
          method: "POST",
          body: formData,
        }),
      }), 
    }),
  });
  
  export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useUploadCategoryImageMutation,
  } = categoriesApiSlice;
    