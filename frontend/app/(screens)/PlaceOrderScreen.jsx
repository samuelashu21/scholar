import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView, 
  Image,
} from "react-native";
import React, { useEffect } from "react";
// import { useNavigation } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

import Toast from "react-native-toast-message";

import { useCreateOrderMutation } from "../../slices/ordersApiSlice";
import { clearCartItems } from "../../slices/cartSlice";
import Message from "../../components/Message";

import { Colors } from "../../constants/Utils";

const PlaceOrderScreen = () => {
  const router = useRouter();

  const { orderId } = useLocalSearchParams();
  const cart = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      router.push("/Shipping");
    } else if (!cart.paymentMethod) {
      router.push("/Payment");
    }
  }, [cart.paymentMethod, cart.shippingAddress.address]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
        itemsPrice: cart.itemsPrice,
      }).unwrap();
 
      dispatch(clearCartItems());
 
      router.push({
        pathname: "/(screens)/OrderScreen",
        params: { orderId: res._id },
      });  
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error", 
        text2: error?.data?.message || error.error,
        position: "top",
        visibilityTime: 7000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Place Order</Text>

        <View style={styles.gridContainer}>
          <View style={styles.leftColumn}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shipping Details</Text>
              <Text style={styles.text}>
                <Text style={styles.strongText}>Address:</Text>
                {cart.shippingAddress.address}, {cart.shippingAddress.city},{" "}
                {cart.shippingAddress.postalCode},{cart.shippingAddress.country}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment Method</Text>
              <Text style={styles.text}>
                <Text style={styles.strongText}>Method:</Text>
                {cart.paymentMethod}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Order</Text>
              {cart.cartItems.length === 0 ? (
                <Message variant="info">Your cart is empty</Message>
              ) : (
                <View style={styles.orderItemsContainer}>
                  {cart.cartItems.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.productImage}
                        />
                      </View>

                      <View style={styles.productDetails}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.text}>
                          {item.qty} x ${item.price} =
                        </Text>
                        <Text style={styles.strongText}>
                          ${(item.qty * item.price).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
          <View style={styles.rightColumn}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.text}>Items</Text>
                <Text style={styles.textPrice}>${cart.itemsPrice}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.text}>Shipping</Text>
                <Text style={styles.textPrice}>${cart.shippingPrice}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.text}>Tax</Text>
                <Text style={styles.textPrice}>${cart.taxPrice}</Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalText}>${cart.totalPrice}</Text>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Message variant="danger">
                    {error?.data?.message || error.error}
                  </Message>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  cart.cartItems.length === 0 && styles.buttonDisabled,
                ]}
                onPress={placeOrderHandler}
                disabled={cart.cartItems.length === 0 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Place Order</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlaceOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 24,
    textAlign: "start",
  },
  gridContainer: {
    flexDirection: "column",
  },
  card: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    shadowColor: Colors.darkGray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textColor,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: Colors.secondaryTextColor,
    lineHeight: 24,
  },
  strongText: {
    fontWeight: "bold",
    color: Colors.primary,
    fontSize: 16,
  },
  orderItemsContainer: {
    marginTop: 8,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  imageContainer: {
    width: 64,
    height: 64,
    marginRight: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  textPrice: {
    fontSize: 16,
    color: Colors.textColor,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 16,
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textColor,
  },
  errorContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: Colors.lightGray,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  leftColumn: {
    marginBottom: 24,
  },
});
 