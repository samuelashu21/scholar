import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateCart } from "../constants/CartUtils"; // Assuming updateCart handles AsyncStorage internally or you'll adjust it

// Define a placeholder initial state. The actual state will be loaded asynchronously.
const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: "PayPal",
}; 

const getCartItemKey = (item) =>
  item.selectedVariant?.sku
    ? `${item._id}-${item.selectedVariant.sku}`
    : `${item._id}-${item.selectedVariant?.name || "default"}-${item.selectedVariant?.optionLabel || "default"}`;

const cartSlice = createSlice({ 
  name: "cart",
  initialState,
  reducers: {
    // Action to set the cart state after it's loaded from AsyncStorage
    setCartFromStorage: (state, action) => {
      return action.payload; // Replace the entire state with the loaded data
    },
    addToCart: (state, action) => {
      const { user, rating, numReviews, reviews, ...item } = action.payload;
      const normalizedItem = {
        ...item,
        selectedVariant: item.selectedVariant || null,
      };
      normalizedItem.cartItemKey = getCartItemKey(normalizedItem);

      const existItem = state.cartItems.find((x) => x.cartItemKey === normalizedItem.cartItemKey);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.cartItemKey === existItem.cartItemKey ? normalizedItem : x
        );
      } else {
        state.cartItems = [...state.cartItems, normalizedItem];
      }
      // Assuming updateCart handles saving to AsyncStorage internally,
      // or you'll adjust it to accept a callback or return a promise
      const updatedState = updateCart(state, normalizedItem);
      AsyncStorage.setItem("cart", JSON.stringify(updatedState)); // Save to AsyncStorage
      return updatedState;
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.cartItemKey !== action.payload);
      const updatedState = updateCart(state); // updateCart might calculate totals, etc.
      AsyncStorage.setItem("cart", JSON.stringify(updatedState)); // Save to AsyncStorage
      return updatedState;
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      AsyncStorage.setItem("cart", JSON.stringify(state)); // Save to AsyncStorage
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      AsyncStorage.setItem("cart", JSON.stringify(state)); // Save to AsyncStorage
    },
    clearCartItems: (state) => {
      // Removed action as it's not used
      state.cartItems = [];
      AsyncStorage.setItem("cart", JSON.stringify(state)); // Save to AsyncStorage
    },
    // Resetting the cart should also clear AsyncStorage
    resetCart: (state) => {
      const newState = initialState; // Use the predefined empty initial state
      AsyncStorage.removeItem("cart"); // Clear from AsyncStorage
      return newState;
    },
  },
});

export const {
  setCartFromStorage, // Export the new action
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
