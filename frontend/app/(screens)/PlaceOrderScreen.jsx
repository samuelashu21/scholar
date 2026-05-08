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
  StatusBar,
} from "react-native";
import React, { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { useCreateOrderMutation } from "../../slices/ordersApiSlice";
import { clearCartItems } from "../../slices/cartSlice";
import { Colors } from "../../constants/Utils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const PlaceOrderScreen = () => {
  const router = useRouter();
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      router.replace("(screens)/ShippingScreen");
    } else if (!cart.paymentMethod) {
      router.replace("(screens)/PaymentScreen");
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
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: err?.data?.message || err.error,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* CONSISTENT HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PROGRESS STEPS - ALL COMPLETED */}
        <View style={styles.stepContainer}>
          <View style={[styles.stepCircle, styles.completedStep]}>
            <Ionicons name="checkmark" size={18} color="#FFF" />
          </View>
          <View style={[styles.stepLine, styles.completedLine]} />
          <View style={[styles.stepCircle, styles.completedStep]}>
            <Ionicons name="checkmark" size={18} color="#FFF" />
          </View>
          <View style={[styles.stepLine, styles.completedLine]} />
          <View style={[styles.stepCircle, styles.activeStep]}>
            <Ionicons name="flag" size={18} color="#FFF" />
          </View>
        </View>

        <Text style={styles.title}>Final Review</Text>
        <Text style={styles.subtitle}>Check your details before placing the order</Text>

        {/* SHIPPING & PAYMENT INFO CARDS */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.infoTitle}>Shipping To</Text>
            <Text style={styles.infoText} numberOfLines={2}>
              {cart.shippingAddress.address}, {cart.shippingAddress.city}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="card" size={20} color={Colors.primary} />
            <Text style={styles.infoTitle}>Payment</Text>
            <Text style={styles.infoText}>{cart.paymentMethod}</Text>
          </View>
        </View>

        {/* ORDER ITEMS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Items</Text>
          {cart.cartItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                {item.selectedVariant?.label ? (
                  <Text style={styles.variantText}>
                    {item.selectedVariant.name}: {item.selectedVariant.label}
                  </Text>
                ) : null}
                <Text style={styles.productPrice}>
                  {item.qty} x ${item.price} = <Text style={styles.itemTotal}>${(item.qty * item.price).toFixed(2)}</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>${cart.itemsPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>${cart.shippingPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${cart.taxPrice}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${cart.totalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, (cart.cartItems.length === 0 || isLoading) && styles.disabledBtn]}
          onPress={placeOrderHandler}
          disabled={cart.cartItems.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Confirm & Place Order</Text>
              <Ionicons name="shield-checkmark" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlaceOrderScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.darkGray },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: "#F1F3F5" },
  scrollContent: { padding: 20 },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStep: { backgroundColor: Colors.primary },
  completedStep: { backgroundColor: "#28a745" },
  stepLine: { width: 40, height: 2, backgroundColor: "#E9ECEF", marginHorizontal: 8 },
  completedLine: { backgroundColor: "#28a745" },
  title: { fontSize: 26, fontWeight: "800", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#6C757D", marginBottom: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  infoCard: {
    backgroundColor: "#FFF",
    width: "48%",
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },
  infoTitle: { fontSize: 14, fontWeight: "700", marginTop: 8, color: "#333" },
  infoText: { fontSize: 12, color: "#666", marginTop: 4 },
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15, color: "#1A1A1A" },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
    paddingBottom: 10,
  },
  productImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  productDetails: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "600", color: "#333" },
  variantText: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  productPrice: { fontSize: 13, color: "#666", marginTop: 2 },
  itemTotal: { fontWeight: "700", color: Colors.primary },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { color: "#666", fontSize: 14 },
  summaryValue: { fontWeight: "600", color: "#333" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#F1F3F5", paddingTop: 15, marginTop: 5 },
  totalLabel: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  totalValue: { fontSize: 18, fontWeight: "800", color: Colors.primary },
  placeOrderBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  placeOrderText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  disabledBtn: { backgroundColor: Colors.lightGray },
}); 
