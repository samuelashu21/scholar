import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

import Message from "../../components/Message";
import { addToCart, removeFromCart } from "../../slices/cartSlice";
import { Colors } from "../../constants/Utils";

 

const Cart = () => {

   const router = useRouter();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const { userInfo } = useSelector((state) => state.auth);
   
   
   const totalPrice = cartItems
    .reduce((acc, item) => acc + item.qty * item.price, 0)
    .toFixed(2);

  const updateQuantity = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  }; 

    const deleteItem = (id) => {
    dispatch(removeFromCart(id));
  }; 
  
    
    const handleCheckout = () => {
    if (userInfo) {
      router.push("(screens)/ShippingScreen");
    } else {
      router.push({
        pathname: "(screens)/LoginScreen",
        params: {
          redirect: "(screens)/ShippingScreen",
        },
      });
    }
  };
   
    const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "(screens)/ProductScreen",
              params: { productId: item._id },
            })
          }
        >
          <Text style={styles.itemName}>
            {item.name.split(" ").slice(0, 2).join(" ") +
              (item.name.split(" ").length > 2 ? "..." : "")}
          </Text>
        </TouchableOpacity>
        <Text style={styles.itemPrice}>${item.price}</Text>
      </View>

      <View style={styles.itemActions}>
        <Picker
          selectedValue={item.qty}
          onValueChange={(value) => updateQuantity(item, Number(value))}
          style={styles.qtyPicker}
        >
          {[...Array(item.countInStock).keys()].map((x) => (
            <Picker.Item key={x + 1} label={`${x + 1}`} value={x + 1} />
          ))}
        </Picker>

        <TouchableOpacity
          style={styles.removeIcon}
          onPress={() => deleteItem(item._id)}
        >
          <Ionicons name="trash" size={20} color={Colors.textRed} />
        </TouchableOpacity>
      </View>
    </View>
  );


   return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Shopping Cart</Text>
        {cartItems.length === 0 ? (
          <Message variant="info" style={styles.emptyMessage}>
            Your Cart is empty
            <Text style={styles.backLink} onPress={() => router.back()}>
              Go Back
            </Text>
          </Message>
        ) : (
          <View style={styles.content}>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.summary}> 
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Items: </Text>
                <Text style={styles.value}>{totalItems}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Total: </Text>
                <Text style={styles.value}>${totalPrice}</Text>
              </View>

             <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  cartItems.length === 0 && styles.checkoutDisabled,
                ]}
                onPress={handleCheckout}
                disabled={cartItems.length === 0}
              >
                <Text style={styles.checkoutText}>Proceed To Checkout </Text>
              </TouchableOpacity>  
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default Cart


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  container: {
    padding: 20,
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 20,
  },
  emptyMessage: {
    marginTop: 20,
    padding: 20,
    backgroundColor: Colors.infoBorder,
    borderColor: Colors.infoBorder,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  backLink: {
    color: Colors.primary,
    textDecorationLine: "underline",
    fontWeight: "black",
  },
  content: {
    flex: 1,
  },
  list: { paddingBottom: 20 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    justifyContent: "center",
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textColor,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.secondaryTextColor,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyPicker: {
    height: 40,
    width: 80,
    color: Colors.textColor,
  },
  removeIcon: {
    marginLeft: 10,
    padding: 10,
  },
  summary: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    borderColor: Colors.lightGray,
    borderWidth: 1,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.darkGray,
    textAlign: "center",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: Colors.secondaryTextColor,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGray,
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textColor,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  checkoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutDisabled: {
    backgroundColor: Colors.darkGray,
  },
});
