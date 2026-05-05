import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateCart } from "../constants/CartUtils";

const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: "PayPal",
}; 

const cartSlice = createSlice({ 
  name: "cart",
  initialState,
  reducers: {
    setCartFromStorage: (state, action) => {
      return action.payload;
    },
    addToCart: (state, action) => {
      const { user, rating, numReviews, reviews, selectedVariant, ...item } = action.payload;

      // Build a unique cart key: productId + variant label (if any)
      const variantKey = selectedVariant ? `${item._id}::${selectedVariant.label}` : item._id;
      const itemWithVariant = { ...item, selectedVariant: selectedVariant || null, variantKey };

      const existItem = state.cartItems.find((x) => x.variantKey === variantKey);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.variantKey === variantKey ? itemWithVariant : x
        );
      } else {
        state.cartItems = [...state.cartItems, itemWithVariant];
      }

      const updatedState = updateCart(state, itemWithVariant);
      AsyncStorage.setItem("cart", JSON.stringify(updatedState));
      return updatedState;
    },
    removeFromCart: (state, action) => {
      // action.payload can be _id (legacy) or variantKey
      state.cartItems = state.cartItems.filter(
        (x) => x.variantKey !== action.payload && x._id !== action.payload
      );
      const updatedState = updateCart(state);
      AsyncStorage.setItem("cart", JSON.stringify(updatedState));
      return updatedState;
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      AsyncStorage.setItem("cart", JSON.stringify(state));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      AsyncStorage.setItem("cart", JSON.stringify(state));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      AsyncStorage.setItem("cart", JSON.stringify(state));
    },
    resetCart: () => {
      AsyncStorage.removeItem("cart");
      return initialState;
    },
  },
});

export const {
  setCartFromStorage,
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
