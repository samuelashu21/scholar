import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform, // Added Platform 
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { savePaymentMethod } from "../../slices/cartSlice";
import { Colors } from "../../constants/Utils";
import { Ionicons, MaterialIcons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";

const PaymentScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState("PayPal");

  useEffect(() => {
    if (!shippingAddress || !shippingAddress.address) {
      router.replace("(screens)/ShippingScreen");
    }
  }, [shippingAddress, router]);

  const submitHandler = () => {
    if (!paymentMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }
    dispatch(savePaymentMethod(paymentMethod));
    router.push("(screens)/PlaceOrderScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Ensure Status bar is visible and dark */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* HEADER - Explicitly positioned */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        {/* PROGRESS STEPS */}
        <View style={styles.stepContainer}>
          <View style={[styles.stepCircle, styles.completedStep]}>
            <Ionicons name="checkmark" size={18} color="#FFF" />
          </View>
          <View style={[styles.stepLine, styles.completedLine]} />
          <View style={[styles.stepCircle, styles.activeStep]}>
            <Ionicons name="card" size={18} color="#FFF" />
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}>
            <Ionicons name="checkmark-done" size={18} color={Colors.lightGray} />
          </View>
        </View>

        <Text style={styles.title}>Payment Method</Text>
        <Text style={styles.subtitle}>Choose your preferred way to pay</Text>

        <View style={styles.methodCard}>
          {/* PAYPAL */}
          <TouchableOpacity
            style={[styles.radioButton, paymentMethod === "PayPal" && styles.selectedRadio]}
            onPress={() => setPaymentMethod("PayPal")}
          >
            <View style={styles.radioIconText}>
              <FontAwesome name="paypal" size={24} color="#003087" style={styles.methodIcon} />
              <View>
                <Text style={styles.radioLabel}>PayPal</Text>
                <Text style={styles.radioSubLabel}>PayPal, Debit, or Credit Card</Text>
              </View>
            </View>
            <MaterialIcons
              name={paymentMethod === "PayPal" ? "radio-button-checked" : "radio-button-unchecked"}
              size={24}
              color={paymentMethod === "PayPal" ? Colors.primary : Colors.lightGray}
            />
          </TouchableOpacity>

          {/* STRIPE */}
          <TouchableOpacity
            style={[styles.radioButton, paymentMethod === "Stripe" && styles.selectedRadio]}
            onPress={() => setPaymentMethod("Stripe")}
          >
            <View style={styles.radioIconText}>
              <FontAwesome name="credit-card" size={22} color={Colors.primary} style={styles.methodIcon} />
              <View>
                <Text style={styles.radioLabel}>Stripe</Text>
                <Text style={styles.radioSubLabel}>Secure Card Payment</Text>
              </View>
            </View>
            <MaterialIcons
              name={paymentMethod === "Stripe" ? "radio-button-checked" : "radio-button-unchecked"}
              size={24}
              color={paymentMethod === "Stripe" ? Colors.primary : Colors.lightGray}
            />
          </TouchableOpacity>

          {/* CASH */}
          <TouchableOpacity
            style={[styles.radioButton, paymentMethod === "Cash" && styles.selectedRadio]}
            onPress={() => setPaymentMethod("Cash")}
          >
            <View style={styles.radioIconText}>
              <FontAwesome5 name="money-bill-wave" size={20} color="#28a745" style={styles.methodIcon} />
              <View>
                <Text style={styles.radioLabel}>Cash on Delivery</Text>
                <Text style={styles.radioSubLabel}>Pay when you receive your order</Text>
              </View>
            </View>
            <MaterialIcons
              name={paymentMethod === "Cash" ? "radio-button-checked" : "radio-button-unchecked"}
              size={24}
              color={paymentMethod === "Cash" ? "#28a745" : Colors.lightGray}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.mainButton} onPress={submitHandler}>
            <Text style={styles.buttonText}>Review Order</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8F9FA",
    // FIX: Add padding for Android Status Bar
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    // Visual separation
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 3,
    zIndex: 100,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.darkGray },
  backBtn: { 
    padding: 8, 
    borderRadius: 12, 
    backgroundColor: "#F1F3F5",
  },
  container: { 
    flex: 1, 
    padding: 20 
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStep: { backgroundColor: Colors.primary },
  completedStep: { backgroundColor: "#28a745" },
  stepLine: { width: 40, height: 2, backgroundColor: "#E9ECEF", marginHorizontal: 8 },
  completedLine: { backgroundColor: "#28a745" },
  title: { fontSize: 26, fontWeight: "800", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#6C757D", marginBottom: 25, marginTop: 4 },
  methodCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E9ECEF",
  },
  selectedRadio: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  radioIconText: { flexDirection: "row", alignItems: "center" },
  methodIcon: { width: 35, marginRight: 10, textAlign: 'center' },
  radioLabel: { fontSize: 16, fontWeight: "700", color: "#212529" },
  radioSubLabel: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  footer: { flex: 1, justifyContent: "flex-end", marginBottom: 20 }, 
  mainButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});