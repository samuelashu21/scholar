 


import React, { useState, useEffect } from "react";
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
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, Stack } from "expo-router"; // Added Stack
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import { useUpdateUserProfileMutation, useUploadProfileImageMutation } from "../../slices/userAPiSlice";
import { setCredentials } from "../../slices/authSlice";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
import Message from "../../components/Message";

const AccountInformation = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const [updateProfile, { isLoading: loadingUpdateProfile }] = useUpdateUserProfileMutation();
  const [uploadProfileImage, { isLoading: loadingUpload }] = useUploadProfileImageMutation();

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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  const uploadFileHandler = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
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
        const formData = new FormData();
        formData.append("image", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "profile.jpg",
        });
        const response = await uploadProfileImage(formData).unwrap();
        setProfileImage(response.image);
        Toast.show({ type: "success", text1: "Photo Updated" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Upload failed" });
    }
  };

  const submitHandler = async () => {
    if (password && password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    try {
      const payload = {};
      const currentFirst = userInfo.name.split(" ")[0];
      const currentLast = userInfo.name.split(" ")[1];

      if (firstName !== currentFirst) payload.FirstName = firstName;
      if (lastName !== currentLast) payload.LastName = lastName;
      if (email !== userInfo.email) payload.email = email;
      if (phone !== userInfo.phone) payload.phone = phone;
      if (profileImage !== userInfo.profileImage) payload.profileImage = profileImage;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        Toast.show({ type: "info", text1: "No changes detected" });
        return;
      }

      const res = await updateProfile(payload).unwrap();
      dispatch(setCredentials({ ...res }));
      setPassword("");
      setConfirmPassword("");
      Toast.show({ type: "success", text1: "Profile Updated" });
    } catch (err) {
      setError(err?.data?.message || err.message);
    }
  };

  const CustomInput = ({ label, value, onChangeText, placeholder, keyboardType = "default", secureTextEntry = false, showIcon = false, onIconPress, iconName }) => (
    <View style={styles.inputSection}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, showIcon && styles.rowInput]}>
        <TextInput
          style={[styles.input, showIcon && { flex: 1 }]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#ADB5BD"
        />
        {showIcon && (
          <TouchableOpacity onPress={onIconPress} style={styles.eyeIcon}>
            <Ionicons name={iconName} size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* EXPO ROUTER HEADER TITLE */}
      <Stack.Screen options={{ title: "Account", headerShown: false }} />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={26} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* AVATAR SECTION */}
          <View style={styles.avatarWrapper}>
            <View style={styles.imageCircle}>
              {loadingUpload ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Image source={{ uri: getImageUrl(profileImage) }} style={styles.avatar} />
              )}
            </View>
            <TouchableOpacity style={styles.cameraBtn} onPress={uploadFileHandler}>
              <Ionicons name="camera" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            {error && <Message variant="error"><Text>{error}</Text></Message>}

            <View style={styles.nameRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <CustomInput label="First Name" value={firstName} onChangeText={setFirstName} placeholder="John" />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Doe" />
              </View>
            </View>

            <CustomInput label="Email Address" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" />
            
            <CustomInput label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+251..." keyboardType="phone-pad" />

            <View style={styles.divider} />
            <Text style={styles.subTitle}>Update Password</Text>

            <CustomInput 
              label="New Password" 
              value={password} 
              onChangeText={setPassword} 
              placeholder="••••••••" 
              secureTextEntry={!showPassword}
              showIcon 
              iconName={showPassword ? "eye-off" : "eye"}
              onIconPress={() => setShowPassword(!showPassword)}
            />

            <CustomInput 
              label="Confirm Password" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              placeholder="••••••••" 
              secureTextEntry={!showConfirmPassword}
              showIcon 
              iconName={showConfirmPassword ? "eye-off" : "eye"}
              onIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <TouchableOpacity 
              style={[styles.updateButton, loadingUpdateProfile && { opacity: 0.7 }]} 
              onPress={submitHandler}
              disabled={loadingUpdateProfile}
            >
              {loadingUpdateProfile ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.updateBtnText}>Save Changes</Text>
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
    backgroundColor: "#F8F9FA",
    // Fix for Android back button visibility
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    // Elevation for header
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
    zIndex: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  backButton: { 
    padding: 4, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollContent: { paddingBottom: 40 },
  
  avatarWrapper: { alignItems: "center", marginTop: 25, marginBottom: 20 },
  imageCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatar: { width: 104, height: 104, borderRadius: 52 },
  cameraBtn: {
    position: "absolute",
    bottom: 5,
    right: "37%",
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#F8F9FA",
  },

  formCard: { paddingHorizontal: 20 },
  nameRow: { flexDirection: "row", justifyContent: "space-between" },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#6C757D", marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  input: { paddingHorizontal: 15, paddingVertical: 14, fontSize: 15, color: "#1A1A1A" },
  rowInput: { flexDirection: "row", alignItems: "center" },
  eyeIcon: { paddingHorizontal: 15 },
  
  divider: { height: 1, backgroundColor: "#E9ECEF", marginVertical: 20 },
  subTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 20 },

  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  updateBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});