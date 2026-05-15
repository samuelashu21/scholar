

import React, { useState } from "react";
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
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView, // Added
  Platform,             // Added
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useRegisterMutation,
  useUploadProfileImageMutation,
} from "../../slices/userAPiSlice";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { Colors, resolveImageUrl } from "../../constants/Utils";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const RegisterScreen = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+251",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [uploadProfileImage, { isLoading: loadingUpload }] = useUploadProfileImageMutation();
  const localSearchParams = useLocalSearchParams();
  const redirect = localSearchParams.redirect || "/";

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const getPasswordStrength = (password) => {
    if (!password) return { label: "", color: "#EEE", width: "0%" };
    let score = 0;
    if (password.length > 7) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1: return { label: "Weak", color: "#FF4D4F", width: "25%" };
      case 2: return { label: "Fair", color: "#FFA940", width: "50%" };
      case 3: return { label: "Good", color: "#FFC53D", width: "75%" };
      case 4: return { label: "Strong", color: "#52C41A", width: "100%" };
      default: return { label: "Too Short", color: "#FF4D4F", width: "10%" };
    }
  };

  const strength = getPasswordStrength(form.password);
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword !== "";

  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return Toast.show({ type: "error", text1: "Permission denied" });

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
        Toast.show({ type: "success", text1: "Image Uploaded" });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Upload failed" });
    }
  };

  const submitHandler = async () => {
    Keyboard.dismiss();
    if (form.password !== form.confirmPassword) {
      return Toast.show({ type: "error", text1: "Error", text2: "Passwords do not match" });
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
      router.push(`/OtpScreen?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirect)}`);
    } catch (error) {
      Toast.show({ type: "error", text1: "Registration Failed", text2: error?.data?.message });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled" // Allows clicking buttons while keyboard is up
          >
            <View style={styles.header}>
              <Text style={styles.title}>Join Us</Text>
              <Text style={styles.subtitle}>Create an account to start shopping</Text>
            </View>

            {/* Profile Image */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                {profileImage ? (
                  <Image source={{ uri: resolveImageUrl(profileImage) }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}><FontAwesome6 name="user-plus" size={24} color="#999" /></View>
                )}
                <View style={styles.cameraIconBadge}><FontAwesome6 name="camera" size={12} color="#fff" /></View>
              </TouchableOpacity>
              {loadingUpload && <ActivityIndicator style={styles.imageLoader} color={Colors.primary} />}
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <View style={styles.row}>
                  <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="First Name" placeholderTextColor="#BBB" value={form.firstName} onChangeText={(v) => handleChange("firstName", v)} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Last Name" placeholderTextColor="#BBB" value={form.lastName} onChangeText={(v) => handleChange("lastName", v)} />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput style={styles.input} placeholder="example@mail.com" placeholderTextColor="#BBB" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => handleChange("email", v)} />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput style={styles.input} placeholder="+251 XXX XXX XXX" placeholderTextColor="#BBB" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => handleChange("phone", v)} maxLength={13} />
              </View>

              <View style={styles.inputContainer}> 
                <Text style={styles.label}>Set Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput style={styles.passwordInput} placeholder="Min. 8 characters" placeholderTextColor="#BBB" secureTextEntry={!showPassword} autoCorrect={false} autoCapitalize="none" value={form.password} onChangeText={(v) => handleChange("password", v)} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}><FontAwesome6 name={showPassword ? "eye" : "eye-slash"} size={18} color="#666" /></TouchableOpacity>
                </View>
                {form.password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarBackground}><View style={[styles.strengthBarActive, { width: strength.width, backgroundColor: strength.color }]} /></View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.passwordWrapper, form.confirmPassword.length > 0 && { borderColor: passwordsMatch ? "#52C41A" : "#FF4D4F" }]}>
                  <TextInput style={styles.passwordInput} placeholder="Repeat password" placeholderTextColor="#BBB" secureTextEntry={!showConfirmPassword} autoCorrect={false} autoCapitalize="none" value={form.confirmPassword} onChangeText={(v) => handleChange("confirmPassword", v)} />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}><FontAwesome6 name={showConfirmPassword ? "eye" : "eye-slash"} size={18} color="#666" /></TouchableOpacity>
                </View>
                {form.confirmPassword.length > 0 && (
                  <Text style={[styles.matchText, { color: passwordsMatch ? "#52C41A" : "#FF4D4F" }]}>
                     {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={[styles.registerButton, (isLoading || (form.confirmPassword.length > 0 && !passwordsMatch)) && styles.buttonDisabled]} onPress={submitHandler} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Register</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/LoginScreen")}><Text style={styles.loginLink}>Sign In</Text></TouchableOpacity>
            </View>

            <Text style={styles.termsText}>By creating an account, you agree to our Terms of Use and Privacy Policy.</Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  scrollContainer: { paddingHorizontal: 25, paddingBottom: 40 },
  header: { marginTop: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 14, color: "#777", marginTop: 5 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatarWrapper: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#EEE" },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  cameraIconBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#FF4734", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFF" },
  imageLoader: { position: "absolute", top: 35 },
  formCard: { gap: 15 },
  inputContainer: { width: "100%" },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 },
  row: { flexDirection: "row" },
  input: { height: 50, backgroundColor: "#FAFAFA", borderRadius: 12, paddingHorizontal: 16, fontSize: 15, borderWidth: 1, borderColor: "#F0F0F0", color: "#333" },
  passwordWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FAFAFA", borderRadius: 12, borderWidth: 1, borderColor: "#F0F0F0" },
  passwordInput: { flex: 1, height: 50, paddingHorizontal: 16, fontSize: 15, color: "#333" },
  eyeIcon: { paddingHorizontal: 15 },
  strengthContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  strengthBarBackground: { flex: 1, height: 4, backgroundColor: "#F0F0F0", borderRadius: 2, overflow: "hidden" },
  strengthBarActive: { height: "100%", borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "600", marginLeft: 10, width: 65, textAlign: "right" },
  matchText: { fontSize: 11, marginTop: 5, fontWeight: "500", marginLeft: 2 },
  registerButton: { backgroundColor: "#FF4734", height: 55, borderRadius: 28, justifyContent: "center", alignItems: "center", marginTop: 30, elevation: 5 },
  registerButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  buttonDisabled: { backgroundColor: "#FFA399" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#666", fontSize: 15 },
  loginLink: { color: "#FF4734", fontSize: 15, fontWeight: "bold" },
  termsText: { textAlign: "center", color: "#AAA", fontSize: 11, marginTop: 25 },
});

export default RegisterScreen;
