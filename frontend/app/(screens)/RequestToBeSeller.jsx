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

  const [uploadImage, { isLoading: loadingUpload }] =
    useUploadProfileImageMutation();

  const [requestSeller, { isLoading: loadingSubmit }] =
    useRequestSellerMutation();

  useEffect(() => {
    if (!userInfo) return;

    setStoreName(userInfo.sellerProfile?.storeName || "");
    setStoreDescription(userInfo.sellerProfile?.storeDescription || "");
    setStoreLogo(userInfo.sellerProfile?.storeLogo || "");
     // Use optional chaining and default
  const subType = userInfo.sellerRequest?.subscriptionType ?? "free";
  setSubscription(subType);
  }, [userInfo]);

  const getImageUrl = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  const uploadLogoHandler = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Permission denied" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["Images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append("image", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "logo.jpg",
      });

      try {
        const res = await uploadImage(formData).unwrap();
        setStoreLogo(res.image);
        Toast.show({ type: "success", text1: "Logo uploaded" });
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Upload error",
          text2: err.message,
        });
      }
    }
  };

  const submitRequest = async () => {
    if (!storeName || !storeDescription) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please complete all seller profile fields",
      }); 
      return;
    }

    const payload = {
      storeName,
      storeDescription,
      storeLogo,
      subscriptionType: subscriptionType ?? "free",
    };

    try {
      const res = await requestSeller(payload).unwrap();

      dispatch(
        setCredentials({
          ...userInfo,
          sellerProfile: {
            storeName,
            storeDescription,
            storeLogo,
          },
          sellerRequest: {
            isRequested: true,
            status: "pending",
            subscriptionType: subscriptionType ?? "free",
          },
        })
      );
 
      Toast.show({
        type: "success",
        text1: "Request sent",
        text2: "Your seller request is now pending approval.",
      });

      router.back();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.data?.message || err.message,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name="chevron-back-circle"
            size={38}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Seller</Text>
        <View style={{ width: 35 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
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
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Store Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your store name"
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Store Description</Text>
            <TextInput
              style={[styles.input, { height: 110, textAlignVertical: "top" }]}
              multiline
              placeholder="Describe your store"
              value={storeDescription}
              onChangeText={setStoreDescription}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Subscription Plan</Text>
            <View style={styles.subscriptionRow}>
              {["free", "paid_1_month", "paid_6_month"].map((plan) => (
                <TouchableOpacity
                  key={plan}
                  style={[
                    styles.subCard,
                    subscriptionType === plan && styles.subActive,
                  ]}
                  onPress={() => setSubscription(plan)}
                >
                  <Text
                    style={[
                      styles.subText,
                      subscriptionType === plan && styles.subTextActive,
                    ]}
                  >
                    {plan === "free"
                      ? "FREE"
                      : plan.replace("paid_", "").replace("_", " ").toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={submitRequest}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>Submit Request</Text>
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
    backgroundColor: Colors.offWhite,
    paddingTop: 10,
  },
  header: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  backBtn: { width: 40 },
  scrollContainer: {
    paddingBottom: 40,
  },
  logoContainer: { 
    alignItems: "center",
    marginVertical: 20,
  },
  storeLogo: {
    width: 120,
    height: 120,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  editLogoBtn: {
    position: "absolute",
    bottom: 0,
    right: 140,
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 50,
  },
  formCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  inputSection: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: Colors.textColor,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: Colors.white,
  },
  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subCard: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: "center",
    marginRight: 10,
  },
  subActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  subText: {
    fontSize: 15,
    color: Colors.darkGray,
  },
  subTextActive: {
    color: "white",
    fontWeight: "700",
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
