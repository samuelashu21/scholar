import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform, // Added Platform 
  Keyboard,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { saveShippingAddress } from "../../slices/cartSlice";
import { Colors } from "../../constants/Utils";
import { Ionicons } from "@expo/vector-icons";

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "");
  const [country, setCountry] = useState(shippingAddress.country || "");

  const dispatch = useDispatch();
  const router = useRouter();

  const submitHandler = () => {
    Keyboard.dismiss();
    if (!address || !city || !postalCode || !country) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all shipping details to continue",
      });
      return;
    }
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    router.push("(screens)/PaymentScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Set Background color for Android Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* HEADER WITH BACK BUTTON */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* PROGRESS STEPS */}
          <View style={styles.stepContainer}>
            <View style={[styles.stepCircle, styles.activeStep]}>
              <Ionicons name="location" size={18} color="#FFF" />
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepCircle}>
              <Ionicons name="card" size={18} color={Colors.lightGray} />
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepCircle}>
              <Ionicons name="checkmark-done" size={18} color={Colors.lightGray} />
            </View>
          </View>

          <Text style={styles.title}>Shipping Address</Text>
          <Text style={styles.subtitle}>Where should we send your order?</Text>

          <View style={styles.formCard}>
            {/* ADDRESS INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="map-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="123 Main St"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* CITY INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New York"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>

            <View style={styles.row}>
              {/* POSTAL CODE */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Postal Code</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="10001"
                      value={postalCode}
                      onChangeText={setPostalCode}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* COUNTRY */}
              <View style={{ flex: 1.5 }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Country</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="USA"
                      value={country}
                      onChangeText={setCountry}
                    />
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.mainButton} onPress={submitHandler} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Continue to Payment</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
 
export default ShippingScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8F9FA",
    // Fix for Header hiding under Status Bar
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    // Ensure visibility
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 3,
    zIndex: 1000,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.darkGray },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: "#F1F3F5" },
  scrollContent: { padding: 20, paddingBottom: 40 },
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
  stepLine: { width: 40, height: 2, backgroundColor: "#E9ECEF", marginHorizontal: 8 },
  title: { fontSize: 26, fontWeight: "800", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#6C757D", marginBottom: 25, marginTop: 4 },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "700", color: "#495057", marginBottom: 8, marginLeft: 2 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16, color: "#212529" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  mainButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    height: 60,
    borderRadius: 16,
    justifyContent: "center", 
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});