import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import {
  useRegisterMutation,
  useUploadProfileImageMutation,
} from "../../slices/userAPiSlice";
import Toast from "react-native-toast-message";
import FormContainer from "../../components/FormContainer";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const RegisterScreen = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+251",
    profileImage: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [uploadProfileImage, { isLoading: loadingUpload }] =
    useUploadProfileImageMutation();
  const localSearchParams = useLocalSearchParams();
  const redirect = localSearchParams.redirect || "/";

  const handleChange = (field, value) => setForm({ ...form, [field]: value });
  const validatePhone = (phone) => /^\+251\d{9}$/.test(phone);

  const getImageUrl = (imagePath) =>
    imagePath?.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;

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
        const response = await uploadProfileImage(formData).unwrap();
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

  const submitHandler = async () => {
    Keyboard.dismiss();

    if (form.password !== form.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
        position: "top",
        visibilityTime: 7000,
      });
      return;
    }

    if (!validatePhone(form.phone)) {
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
      await register({
        FirstName: form.firstName,
        LastName: form.lastName,
        email: form.email,
        phone: form.phone,
        profileImage,
        password: form.password,
      }).unwrap();

      // Navigate to OTP screen for verification
      // Navigate to OTP screen for verification
      router.push(
        `/OtpScreen?email=${encodeURIComponent(
          form.email
        )}&redirect=${encodeURIComponent(redirect)}`
      );
    } catch (error) {
      console.log("Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error?.data?.message || error.error,
        position: "top",
        visibilityTime: 7000,
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <FormContainer>
        {/* Logo & Slogan */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.slogan}>Unlock your world. Register now</Text>
        </View>


        <Text style={styles.title}>Register</Text>

        {/* First & Last Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            value={form.firstName}
            onChangeText={(v) => handleChange("firstName", v)}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            value={form.lastName}
            onChangeText={(v) => handleChange("lastName", v)}
          />
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
          />
        </View>

        {/* Phone */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone:</Text>
          <TextInput
            style={styles.input}
            placeholder="+251XXXXXXXXX"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => handleChange("phone", v)}
            maxLength={13}
          />
        </View>

        {/* Profile Image */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Image</Text>
          {profileImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: getImageUrl(profileImage) }}
                style={styles.productImage}
              />
              <Text style={styles.imageUrl}>{getImageUrl(profileImage)}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={uploadFileHandler}
          >
            <Text style={styles.uploadButtonText}>
              {loadingUpload ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                "Upload Image"
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password:</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter Password"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <FontAwesome6
                name={showPassword ? "eye-slash" : "eye"}
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password:</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={form.confirmPassword}
              onChangeText={(v) => handleChange("confirmPassword", v)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.passwordToggle}
            >
              <FontAwesome6
                name={showConfirmPassword ? "eye-slash" : "eye"}
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={submitHandler}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Already have an account?{" "}
            <Link
              href={{
                pathname: "/LoginScreen",
                params: redirect !== "/" ? { redirect } : {},
              }}
              style={styles.registerLink}
            >
              Login
            </Link>
          </Text>
        </View>
      </FormContainer>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;

// --- Styles remain the same ---
const styles = StyleSheet.create({
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 150, height: 150, resizeMode: "contain", marginBottom: 10 },
  slogan: {
    fontSize: 18,
    color: Colors.secondaryTextColor,
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: Colors.textColor,
  },
  formGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textColor,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: Colors.white,
    color: Colors.textColor,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: Colors.textColor,
  },
  passwordToggle: { padding: 10, position: "absolute", right: 5 },
  button: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "bold" },
  registerContainer: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  registerText: { fontSize: 14, color: Colors.secondaryTextColor },
  registerLink: {
    color: Colors.primary,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  imageContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  imageUrl: {
    fontSize: 12,
    color: Colors.secondaryTextColor,
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
