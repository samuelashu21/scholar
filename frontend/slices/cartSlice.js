import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateCart } from "../constants/CartUtils"; // Assuming updateCart handles AsyncStorage internally or you'll adjust it

// Define a placeholder initial state. The actual state will be loaded asynchronously.
const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: "PayPal",
}; 

/**
 * Returns a unique cart key for a product+variant combination.
 * This allows the same product with different variants to be separate cart entries.
 */
const getCartItemKey = (item) => {
  if (item.selectedVariant) {
    return `${item._id}:${item.selectedVariant.name}:${item.selectedVariant.label}`;
  }
  return item._id;
};

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

      const itemKey = getCartItemKey(item);
      const existItem = state.cartItems.find((x) => getCartItemKey(x) === itemKey);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          getCartItemKey(x) === itemKey ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      const updatedState = updateCart(state, item);
      AsyncStorage.setItem("cart", JSON.stringify(updatedState)); // Save to AsyncStorage
      return updatedState;
    },
    removeFromCart: (state, action) => {
      // action.payload may be a plain _id string (backward compat) or a cart key
      const key = action.payload;
      state.cartItems = state.cartItems.filter(
        (x) => getCartItemKey(x) !== key && x._id !== key
      );
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
