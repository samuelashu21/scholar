export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:9090";

// Product API endpoints
export const PRODUCT_URL = "/api/products";

// User API endpoints
export const USERS_URL = "/api/users";
export const AUTH_URL = "/api/auth";

// Order API endpoints
export const ORDERS_URL = "/api/orders";

// Category API endpoints
export const CATEGORY_URL = "/api/categories";  

export const SUBCATEGORY_URL = "/api/subcategories";  

export const CHATS_URL = "/api/chats"; 

// export const SOCKET_URL = "http://192.168.43.217:9090"; // Use your actual IP address
