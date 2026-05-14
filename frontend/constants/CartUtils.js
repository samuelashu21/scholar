import AsyncStorage from "@react-native-async-storage/async-storage";

export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

export const updateCart = (state) => {
  const itemsPrice = state.cartItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );
  state.itemsPrice = addDecimals(itemsPrice); 

  const shippingPrice = itemsPrice > 1000 ? 10 : 0;
  state.shippingPrice = addDecimals(shippingPrice);

  const taxPrice = 0.15 * itemsPrice;
  state.taxPrice = addDecimals(taxPrice);

  const totalPrice =
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.taxPrice);


    state.totalPrice = addDecimals(totalPrice);


    AsyncStorage.setItem("cart", JSON.stringify(state));
 
    return state;
};
