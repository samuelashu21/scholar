import { apiSlice } from "./apiSlice";
import { SUBCATEGORY_URL } from "../constants/Urls";

export const subcategoryApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Fetch subcategories (supports filtering by ?categoryId=...)
    getSubcategories: builder.query({
      query: (categoryId) => ({
        url: SUBCATEGORY_URL,
        params: categoryId ? { categoryId } : {},
      }),
      providesTags: ["Subcategory"],
      keepUnusedDataFor: 5,
    }),

    // Get a single subcategory by ID
    getSubcategoryDetails: builder.query({
      query: (subcategoryId) => ({
        url: `${SUBCATEGORY_URL}/${subcategoryId}`,
      }),
      providesTags: (result, error, subcategoryId) => [
        { type: "Subcategory", id: subcategoryId },
      ],
    }),

    // Admin: Create subcategory
    createSubcategory: builder.mutation({
      query: (data) => ({
        url: SUBCATEGORY_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subcategory"],
    }),

    // Admin: Update subcategory
    updateSubcategory: builder.mutation({
      query: ({ subcategoryId, ...data }) => ({
        url: `${SUBCATEGORY_URL}/${subcategoryId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { subcategoryId }) => [
        "Subcategory",
        { type: "Subcategory", id: subcategoryId },
      ],
    }),

    // Admin: Delete subcategory
    deleteSubcategory: builder.mutation({
      query: (subcategoryId) => ({
        url: `${SUBCATEGORY_URL}/${subcategoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subcategory"],
    }),
  }),
});

export const {
  useGetSubcategoriesQuery,
  useGetSubcategoryDetailsQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = subcategoryApiSlice;