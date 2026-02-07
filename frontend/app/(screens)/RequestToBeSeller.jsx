import React, { useState, useCallback } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
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

  // Redirect if already a seller or request is pending
  useFocusEffect(
    useCallback(() => {
      if (userInfo?.sellerRequest?.isRequested) {
        router.replace("/sellerDashboard");
      }
      
      // Pre-fill fields if user is returning to a half-finished form
      if (userInfo?.sellerProfile) {
        setStoreName(userInfo.sellerProfile.storeName || "");
        setStoreDescription(userInfo.sellerProfile.storeDescription || "");
        setStoreLogo(userInfo.sellerProfile.storeLogo || "");
      }
    }, [userInfo])
  );

  const getImageUrl = (path) => {
    if (!path) return "https://cdn-icons-png.flaticon.com/512/3597/3597075.png";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const uploadLogoHandler = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Permission denied", text2: "We need gallery access to upload a logo." });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6, // Compressed for faster upload
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const formData = new FormData();
      
      // Better file naming logic
      const uri = Platform.OS === "android" ? asset.uri : asset.uri.replace("file://", "");
      const fileName = asset.uri.split("/").pop();
      const fileType = fileName.split(".").pop();

      formData.append("image", {
        uri,
        name: fileName || "upload.jpg",
        type: `image/${fileType || "jpeg"}`,
      });

      try {
        const res = await uploadImage(formData).unwrap();
        setStoreLogo(res.image);
        Toast.show({ type: "success", text1: "Logo updated" });
      } catch (err) {
        Toast.show({ 
            type: "error", 
            text1: "Upload failed", 
            text2: err?.data?.message || "Internal server error" 
        });
      }
    }
  };

  const isFormValid = storeName.trim().length > 2 && storeDescription.trim().length > 10;

  const submitRequest = async () => {
    if (!isFormValid) {
      Toast.show({ 
        type: "error", 
        text1: "Invalid Form", 
        text2: "Please provide a valid store name and detailed description." 
      });
      return;
    }

    try {
      const payload = { storeName, storeDescription, storeLogo, subscriptionType };
      await requestSeller(payload).unwrap();
      
      // Update local state to reflect the new "pending" status
      dispatch(setCredentials({
        ...userInfo,
        sellerProfile: { storeName, storeDescription, storeLogo },
        sellerRequest: { isRequested: true, status: "pending", subscriptionType },
      }));

      Toast.show({ type: "success", text1: "Application Submitted!" });
      router.replace("/sellerDashboard"); 
      
    } catch (err) {
      const errorMessage = err?.data?.message || "Something went wrong";
      if (errorMessage.toLowerCase().includes("already requested")) {
        router.replace("/sellerDashboard");
      } else {
        Toast.show({ type: "error", text1: "Submission Failed", text2: errorMessage });
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Registration</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Logo Upload Section */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoShadow}>
              <Image source={{ uri: getImageUrl(storeLogo) }} style={styles.storeLogo} />
              
              {loadingUpload && (
                <View style={styles.imageOverlay}>
                   <ActivityIndicator color="white" />
                </View>
              )}

              <TouchableOpacity 
                style={styles.editLogoBtn} 
                onPress={uploadLogoHandler} 
                disabled={loadingUpload}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.logoText}>Store Branding</Text>
          </View>

          {/* Form Fields */}
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
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Store Description</Text>
                    <Text style={styles.charCount}>{storeDescription.length}/500</Text>
                </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                maxLength={500}
                placeholder="What are you selling? Describe your brand's mission..."
                placeholderTextColor="#ADB5BD"
                value={storeDescription}
                onChangeText={setStoreDescription}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Choose a Plan</Text>
              <View style={styles.subscriptionRow}>
                {[
                  { id: "free", label: "FREE", price: "$0" },
                  { id: "paid_1_month", label: "1 MO", price: "$9" },
                  { id: "paid_6_month", label: "6 MO", price: "$49" }
                ].map((plan) => (
                  <TouchableOpacity 
                    key={plan.id}
                    style={[styles.subCard, subscriptionType === plan.id && styles.subActive]}
                    onPress={() => setSubscription(plan.id)}
                  >
                    <Text style={[styles.subText, subscriptionType === plan.id && styles.subTextActive]}>
                      {plan.label}
                    </Text>
                    <Text style={[styles.subPrice, subscriptionType === plan.id && styles.subTextActive]}>
                      {plan.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn, 
                (!isFormValid || loadingSubmit) && { backgroundColor: "#DEE2E6" }
              ]}
              onPress={submitRequest}
              disabled={loadingSubmit || !isFormValid}
            >
              {loadingSubmit ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitText}>Submit Application</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.footerNote}>
                By submitting, you agree to our Seller Terms & Conditions.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  logoWrapper: {
    alignItems: "center",
    marginVertical: 25,
  },
  logoShadow: {
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  storeLogo: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#E9ECEF",
    borderWidth: 3,
    borderColor: "white",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editLogoBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: Colors.primary || "#007AFF",
    padding: 8,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "white",
  },
  logoText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "700",
    color: "#ADB5BD",
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputSection: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#495057",
  },
  charCount: {
    fontSize: 11,
    color: '#ADB5BD'
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#F1F3F5",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  subscriptionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  subCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#F1F3F5",
    alignItems: "center",
  },
  subActive: {
    backgroundColor: Colors.primary || "#007AFF",
    borderColor: Colors.primary || "#007AFF",
  },
  subText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6C757D",
  },
  subPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#212529",
    marginTop: 2,
  },
  subTextActive: {
    color: "white",
  },
  submitBtn: {
    backgroundColor: Colors.primary || "#007AFF",
    padding: 16, 
    borderRadius: 14,
    marginTop: 10,
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  footerNote: {
      textAlign: 'center',
      fontSize: 11,
      color: '#ADB5BD',
      marginTop: 16,
      lineHeight: 16,
  }
});