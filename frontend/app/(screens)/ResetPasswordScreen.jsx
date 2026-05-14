import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  useResetPasswordMutation,
  useResendResetPasswordOTPMutation,
} from "../../slices/userAPiSlice";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const email = params.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timer, setTimer] = useState(300);
  const inputRefs = useRef([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [resendOTP, { isLoading: resending }] = useResendResetPasswordOTPMutation();

  // Password Strength Logic
  const getPasswordStrength = (password) => {
    if (!password) return { label: "", color: "#EEE", width: "0%" };
    let score = 0;
    if (password.length >= 8) score++;
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

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formattedTime = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;

  const handleOtpChange = (value, index) => {
    const char = value.slice(-1);
    if (/^\d?$/.test(char)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = char;
      setOtp(updatedOtp);
      if (char && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleReset = async () => {
    Keyboard.dismiss();
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      return Toast.show({ type: "error", text1: "Invalid Code", text2: "Please enter the 6-digit OTP" });
    }
    if (newPassword.length < 6) {
      return Toast.show({ type: "error", text1: "Weak Password", text2: "Password must be at least 6 characters" });
    }
    if (newPassword !== confirmPassword) {
      return Toast.show({ type: "error", text1: "Mismatch", text2: "Passwords do not match" });
    }

    try {
      await resetPassword({ email, otp: finalOtp, newPassword }).unwrap();
      Toast.show({ type: "success", text1: "Success", text2: "Password reset successfully" });
      router.replace("/LoginScreen");
    } catch (err) {
      Toast.show({ type: "error", text1: "Reset Failed", text2: err?.data?.message || "Something went wrong" });
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email }).unwrap();
      Toast.show({ type: "success", text1: "OTP Sent", text2: "Check your email for a new code" });
      setTimer(300);
    } catch (err) {
      Toast.show({ type: "error", text1: "Resend Failed", text2: err?.data?.message });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome6 name="key" size={30} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Secure Reset</Text>
            <Text style={styles.subtitle}>Enter the code sent to {email} and your new password.</Text>
          </View>

          {/* OTP Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Verification Code</Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    focusedIndex === index && styles.otpBoxFocused,
                    digit !== "" && styles.otpBoxFilled
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onFocus={() => setFocusedIndex(index)}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>

            {timer > 0 ? (
              <Text style={styles.timerText}>Resend available in <Text style={{fontWeight: '700'}}>{formattedTime}</Text></Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.resendText}>Resend New Code</Text>}
              </TouchableOpacity>
            )}
          </View>

          {/* Password Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder="Min. 8 chars, mix numbers & symbols"
                  placeholderTextColor="#BBB"
                  secureTextEntry={!showPass}
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                  <FontAwesome6 name={showPass ? "eye" : "eye-slash"} size={16} color="#999" />
                </TouchableOpacity>
              </View>

              {/* Strength Meter */}
              {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBackground}>
                    <View style={[styles.strengthBarActive, { width: strength.width, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={[styles.passwordWrapper, confirmPassword && { borderColor: newPassword === confirmPassword ? "#52C41A" : "#FF4D4F" }]}>
                <TextInput
                  placeholder="Repeat new password"
                  placeholderTextColor="#BBB"
                  secureTextEntry={!showConfirm}
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                  <FontAwesome6 name={showConfirm ? "eye" : "eye-slash"} size={16} color="#999" />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && (
                 <Text style={[styles.matchText, { color: newPassword === confirmPassword ? "#52C41A" : "#FF4D4F" }]}>
                   {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                 </Text>
              )}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleReset} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { padding: 25, paddingTop: 40 },
  header: { alignItems: "center", marginBottom: 35 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#777", textAlign: "center", marginTop: 8, paddingHorizontal: 20 },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#444", textTransform: "uppercase", textAlign: "center", marginBottom: 15 },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: "#EEE",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    backgroundColor: "#F9F9F9",
  },
  otpBoxFocused: { borderColor: Colors.primary, backgroundColor: "#FFF", elevation: 2 },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: "#FFF" },
  timerText: { textAlign: "center", color: "#999", fontSize: 13 },
  resendText: { textAlign: "center", color: Colors.primary, fontWeight: "bold", fontSize: 14 },
  formSection: { gap: 20 },
  inputGroup: { width: "100%" },
  label: { fontSize: 13, fontWeight: "700", color: "#444", marginBottom: 8 },
  passwordWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9F9F9", borderRadius: 12, borderWidth: 1, borderColor: "#EEE" },
  input: { flex: 1, height: 52, paddingHorizontal: 15, color: "#333", fontSize: 15 },
  eyeIcon: { paddingHorizontal: 15 },
  // Strength Meter Styles
  strengthContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  strengthBarBackground: { flex: 1, height: 5, backgroundColor: "#F0F0F0", borderRadius: 3, overflow: "hidden" },
  strengthBarActive: { height: "100%", borderRadius: 3 },
  strengthLabel: { fontSize: 12, fontWeight: "700", marginLeft: 10, width: 60, textAlign: "right" },
  matchText: { fontSize: 12, marginTop: 5, fontWeight: "600" },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: { color: "#FFF", fontSize: 17, fontWeight: "bold" },
});