import {
  StyleSheet,
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { KeyboardAvoidingView } from "react-native";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useUpdateUserProfileMutation,useUploadProfileImageMutation } from "../../slices/userAPiSlice";
import { setCredentials } from "../../slices/authSlice";
import { Colors } from "../../constants/Utils";
import * as ImagePicker from "expo-image-picker"; 
import Message from "../../components/Message";
import { BASE_URL } from "../../constants/Urls";  
import Toast from "react-native-toast-message";

const AccountInformation = () => { 
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); 

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

const { userInfo } = useSelector((state) => state.auth);
const [profileImage, setProfileImage] = useState(userInfo?.profileImage || "");

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useUpdateUserProfileMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProfileImageMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      const splitName = userInfo.name?.split(" ") || [];
      setFirstName(splitName[0] || "");
      setLastName(splitName[1] || "");
      setEmail(userInfo.email || "");
      setPhone(userInfo.phone || "");
      setProfileImage(userInfo.profileImage || "");
    }
  }, [userInfo]);

  const validatePhone = (phone) => /^\+251\d{9}$/.test(phone);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

const submitHandler = async () => {
  console.log("Update button clicked");

  // Password match check
  if (password && password !== confirmPassword) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Passwords do not match",
      position: "top",
      visibilityTime: 7000,
    });
    return;
  }

  // Phone validation only if user entered it
  if (phone && !validatePhone(phone)) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Phone number must start with +251 and have 9 digits",
      position: "top",
      visibilityTime: 7000,
    });
    return;
  }

  try {
    // Build payload with only the fields that changed
    const payload = {};
    if (firstName && firstName !== userInfo.name.split(" ")[0]) payload.FirstName = firstName;
    if (lastName && lastName !== userInfo.name.split(" ")[1]) payload.LastName = lastName;
    if (email && email !== userInfo.email) payload.email = email;
    if (phone && phone !== userInfo.phone) payload.phone = phone;
    if (profileImage && profileImage !== userInfo.profileImage) payload.profileImage = profileImage;
    if (password) payload.password = password; // only if user entered a new password

    if (Object.keys(payload).length === 0) {
      Toast.show({
        type: "info",
        text1: "No changes",
        text2: "You didn't change any fields",
      });
      return;
    }

    const res = await updateProfile(payload).unwrap();

    dispatch(setCredentials({ ...res }));
    setError("");
    setPassword("");
    setConfirmPassword("");

    Toast.show({
      type: "success",
      text1: "Success", 
      text2: "Profile updated successfully",
      position: "top",
      visibilityTime: 5000,
    });
  } catch (error) {
    setError(error?.data?.message || error.message);
    Toast.show({
      type: "error",
      text1: "Update Failed",
      text2: error?.data?.message || error.message,
    });
  } 
};



  const uploadFileHandler = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2: "Camera roll access is required",
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append("image", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "image.jpg",
        });
        const response = await uploadProductImage(formData).unwrap();
        setProfileImage(response.image);
        Toast.show({
          type: "success",
          text1: "Uploaded",
          text2: "Image uploaded successfully",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: error?.data?.message || error.error || error?.message,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons
          name="chevron-back-circle"
          size={38}
          color={Colors.primary}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Account Information</Text>
      <View style={{ width: 35 }} /> 
    </View>

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Profile Image */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: profileImage
                ? getImageUrl(profileImage)
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarBtn} onPress={uploadFileHandler}>
            <Ionicons name="camera" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>

          {error && (
            <Message variant="error">
              <Text>{error}</Text>
            </Message>
          )}

          {/* First Name */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+251XXXXXXXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={13}
            />
          </View>

          {/* Password */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={
                    showConfirmPassword ? "eye-off-outline" : "eye-outline"
                  }
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={submitHandler}
            disabled={loadingUpdateProfile}
          >
            {loadingUpdateProfile ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.updateBtnText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

export default AccountInformation;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.darkGray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "start",
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textColor,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: Colors.textColor,
  },
  eyeIcon: {
    padding: 12,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },






  /** HEADER **/
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  backButton: { width: 40 },

  /** SCROLL CONTENT **/
  scrollContent: { paddingBottom: 40 },

  /** PROFILE IMAGE **/
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 120,
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 50,
  },

  /** FORM CARD **/
  formCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  /** INPUT **/
  inputSection: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: Colors.textColor,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.white,
    fontSize: 15,
  },

  /** PASSWORD BOX **/
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15 },

  /** BUTTON **/
  updateButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  updateBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },

});
