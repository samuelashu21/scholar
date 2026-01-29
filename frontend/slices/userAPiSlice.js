import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants/Urls";

export const userApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true, // ✅ Add this line
  endpoints: (builder) => ({
    // ---------------------------
    // AUTH
    // ---------------------------
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    register: builder.mutation({
      query: (data) => ({
        url: USERS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    verifyOTP: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-otp`, // ✅ correct endpoint
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }), 

    resendOTP: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-otp`, // ✅ correct endpoint
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }), 

    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    requestPasswordReset: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/request-reset-password`,
        method: "POST",
        body: data, // { email }
      }),
      invalidatesTags: ["User"],
    }),    

    // Reset password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password`,
        method: "POST",
        body: data, // { email, otp, newPassword }
      }),
      invalidatesTags: ["User"],
    }), 

 
     resendResetPasswordOTP: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-reset-password-otp`, // ✅ correct endpoint
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }), 
    // ---------------------------
    // PROFILE
    // ---------------------------
    getProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
      }),
      providesTags: ["User"],
    }),

    savePushToken: builder.mutation({ 
      query: (data) => ({
        url: `${USERS_URL}/push-token`,
        method: "PUT",
        body: data, // Expects { token: "ExponentPushToken[xxx]" }
      }),
      invalidatesTags: ["User"],
    }), 

    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    uploadProfileImage: builder.mutation({
      query: (data) => ({
        url: "/api/uploadprofile",
        method: "POST",
        body: data,
      }),
    }),

    // ---------------------------
    // ADMIN USERS
    // ---------------------------
    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ["User"],
    }),
 
    getSellerById: builder.query({
      query: (userId) => `/api/users/${userId}`, // your backend route
      keepUnusedDataFor: 5,
      providesTags: ["User"],
    }), 
    
    searchSellers: builder.query({
      query: (searchQuery) => ({
        url: `${USERS_URL}/search`,
        params: { q: searchQuery },
      }),
      keepUnusedDataFor: 5,
    }), 

    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      providesTags: ["UserDetails"],
    }),

    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User", "UserDetails"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // ---------------------------
    //SELLER REQUEST SYSTEM
    //---------------------------
    requestSeller: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/request-seller`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["User", "Seller"],
    }),

    getSellerRequests: builder.query({
      query: () => ({
        url: `${USERS_URL}/seller-requests`,
      }),
      providesTags: ["Seller"],
      keepUnusedDataFor: 5,
    }),

    approveSeller: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `${USERS_URL}/approve-seller/${userId}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Seller", "User"],
    }),

    rejectSeller: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/reject-seller/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Seller", "User"],
    }),
  }),
});

export const { 
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useLogoutMutation, 
  useRequestPasswordResetMutation,
   useResendResetPasswordOTPMutation,
  useResetPasswordMutation, 

  // Profile
  useGetProfileQuery,
  useSavePushTokenMutation,  
  useGetSellerByIdQuery, 
  useSearchSellersQuery, 
  useUpdateUserProfileMutation, 
  useUploadProfileImageMutation,

  // Admin user management
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery, 
  useUpdateUserMutation,

  // Seller request system
  useRequestSellerMutation,
  useGetSellerRequestsQuery,
  useApproveSellerMutation,
  useRejectSellerMutation,
} = userApiSlice;
