import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
import Toast from "react-native-toast-message";

import {
  useRequestSellerMutation,
  useUploadProfileImageMutation,
} from "../../slices/userAPiSlice";
import { setCredentials } from "../../slices/authSlice";

export default function RequestToBeSeller() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [subscriptionType, setSubscription] = useState("free");

  const [uploadImage, { isLoading: loadingUpload }] = useUploadProfileImageMutation();
  const [requestSeller, { isLoading: loadingSubmit }] = useRequestSellerMutation();

  useEffect(() => {
    if (!userInfo) return;

    // 1. REDIRECT LOGIC: If already requested, go straight to dashboard
    if (userInfo.sellerRequest?.isRequested) {
      router.replace("/sellerDashboard");
      return;
    } 

    // 2. PRE-FILL LOGIC: Fill existing profile info if it exists
    setStoreName(userInfo.sellerProfile?.storeName || "");
    setStoreDescription(userInfo.sellerProfile?.storeDescription || "");
    setStoreLogo(userInfo.sellerProfile?.storeLogo || "");
    const subType = userInfo.sellerRequest?.subscriptionType ?? "free";
    setSubscription(subType); 
  }, [userInfo]);

  const getImageUrl = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  const uploadLogoHandler = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Permission denied" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      const formData = new FormData();
      
      const uri = Platform.OS === "android" ? selectedImage.uri : selectedImage.uri.replace("file://", "");

      formData.append("image", {
        uri: uri,
        type: "image/jpeg",
        name: "store-logo.jpg",
      });

      try {
        const res = await uploadImage(formData).unwrap();
        setStoreLogo(res.image);
        Toast.show({ type: "success", text1: "Logo uploaded successfully" });
      } catch (err) {
        Toast.show({ 
          type: "error", 
          text1: "Upload failed", 
          text2: err?.data?.message || "Check your internet connection" 
        });
      }
    }
  };

  const submitRequest = async () => {
    if (!storeName || !storeDescription) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Store name and description are required." });
      return;
    }

    const payload = { 
      storeName, 
      storeDescription, 
      storeLogo, 
      subscriptionType: subscriptionType ?? "free" 
    };

    try {
      await requestSeller(payload).unwrap();
      
      // Update local Redux state
      dispatch(setCredentials({
        ...userInfo,
        sellerProfile: { storeName, storeDescription, storeLogo },
        sellerRequest: { isRequested: true, status: "pending", subscriptionType: subscriptionType ?? "free" },
      }));

      Toast.show({ type: "success", text1: "Request Sent" });
      router.replace("/sellerDashboard"); 
      
    } catch (err) {
      const errorMessage = err?.data?.message || err.message;
      
      // 3. ERROR HANDLING: If server says already requested, redirect user
      if (errorMessage.toLowerCase().includes("already requested")) {
        router.replace("/sellerDashboard");
      } else {
        Toast.show({ type: "error", text1: "Request Failed", text2: errorMessage });
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Registration</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.logoWrapper}>
          <View style={styles.logoShadow}>
            <Image
              source={{
                uri: storeLogo
                  ? getImageUrl(storeLogo)
                  : "https://cdn-icons-png.flaticon.com/512/3597/3597075.png",
              }}
              style={styles.storeLogo}
            />
            <TouchableOpacity 
              style={styles.editLogoBtn} 
              onPress={uploadLogoHandler} 
              disabled={loadingUpload}
            >
              {loadingUpload ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.logoText}>Store Logo</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Official Store Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apex Global"
              placeholderTextColor="#ADB5BD"
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Store Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Tell us about your products..."
              placeholderTextColor="#ADB5BD"
              value={storeDescription}
              onChangeText={setStoreDescription}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Subscription Plan</Text>
            <View style={styles.subscriptionRow}>
              {[
                { id: "free", label: "FREE" },
                { id: "paid_1_month", label: "1 MONTH" },
                { id: "paid_6_month", label: "6 MONTHS" }
              ].map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.subCard, subscriptionType === plan.id && styles.subActive]}
                  onPress={() => setSubscription(plan.id)}
                >
                  <Text style={[styles.subText, subscriptionType === plan.id && styles.subTextActive]}>
                    {plan.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loadingSubmit && { opacity: 0.7 }]}
            onPress={submitRequest}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBFBFB",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  logoWrapper: {
    alignItems: "center",
    marginVertical: 30,
  },
  logoShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  storeLogo: {
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "white",
  },
  editLogoBtn: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "white",
  },
  logoText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#ADB5BD",
  },
  formCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 24,
    elevation: 3,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: "#343A40",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  subscriptionRow: {
    flexDirection: "row",
    gap: 8,
  },
  subCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#EDF2F7",
    alignItems: "center",
  },
  subActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  subText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6C757D",
  },
  subTextActive: {
    color: "white",
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 18, 
    borderRadius: 16,
    marginTop: 10,
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
});