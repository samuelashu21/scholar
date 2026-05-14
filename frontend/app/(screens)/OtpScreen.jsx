import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Keyboard,
} from "react-native";
import {
  useVerifyOTPMutation,
  useResendOTPMutation,
} from "../../slices/userAPiSlice";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { Colors } from "../../constants/Utils";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../slices/authSlice";

export default function OTPScreen() {
  const { email, redirect } = useLocalSearchParams();
  const router = useRouter();

  const dispatch = useDispatch(); // Added dispatch

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  const [counter, setCounter] = useState(300);
  const [verifyOTP, { isLoading: verifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: resending }] = useResendOTPMutation();

  useEffect(() => {
    if (counter <= 0) return;
    const timer = setTimeout(() => setCounter(counter - 1), 1000);
    return () => clearTimeout(timer);
  }, [counter]);

  const handleOTPChange = (value, index) => {
    const newOtp = [...otpArray];
    // Take only the last character (prevents double entry)
    const char = value.slice(-1);
    
    if (char && !/^[0-9]$/.test(char)) return;

    newOtp[index] = char;
    setOtpArray(newOtp);

    // Move to next box if value is entered
    if (char && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Move to previous box on backspace if current box is empty
    if (e.nativeEvent.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const otp = otpArray.join("");

    if (otp.length !== 6) {
      Toast.show({ type: "error", text1: "Invalid Code", text2: "Please enter all 6 digits" });
      return;
    }

    try {
      // 1. Verify OTP and get user data back from API
      const res = await verifyOTP({ email, otp }).unwrap();
      
      // 2. Automatically log the user in by saving credentials to Redux
      dispatch(setCredentials({ ...res }));

      Toast.show({ 
        type: "success", 
        text1: "Verified!", 
        text2: "Account created and logged in" 
      });

      // 3. Redirect to destination (Home or Account)
      router.replace(redirect || "/"); 
    } catch (err) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: err?.data?.message || "Invalid Code" 
      });
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email }).unwrap();
      Toast.show({ type: "success", text1: "Sent!", text2: "Check your email for the new code" });
      setOtpArray(["", "", "", "", "", ""]);
      setCounter(300);
      inputRefs.current[0].focus();
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed", text2: err?.data?.message });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <FontAwesome6 name="shield-halved" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{"\n"}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otpArray.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpBox,
                focusedIndex === index && styles.otpBoxFocused,
                digit !== "" && styles.otpBoxFilled
              ]}
              ref={(ref) => (inputRefs.current[index] = ref)}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          style={[styles.button, verifying && styles.buttonDisabled]}
          disabled={verifying}
        >
          {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Code</Text>}
        </TouchableOpacity>

        <View style={styles.resendSection}>
          {counter > 0 ? (
            <View style={styles.timerRow}>
              <FontAwesome6 name="clock" size={14} color="#999" style={{ marginRight: 6 }} />
              <Text style={styles.timerText}>
                Resend in {Math.floor(counter / 60)}:{(counter % 60).toString().padStart(2, "0")}
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
              <Text style={styles.resendText}>Didn't get a code? <Text style={{fontWeight: '800'}}>Resend</Text></Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 25, alignItems: "center", paddingTop: 60 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#1A1A1A", marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#666", textAlign: "center", lineHeight: 22, marginBottom: 40 },
  emailText: { color: "#1A1A1A", fontWeight: "700" },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#EEE",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    backgroundColor: "#F9F9F9",
    color: "#1A1A1A",
  },
  otpBoxFocused: { borderColor: Colors.primary, backgroundColor: "#FFF", elevation: 2 },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: "#FFF" },
  button: {
    backgroundColor: Colors.primary,
    width: "100%",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: Colors.primary, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonDisabled: { opacity: 0.7, elevation: 0 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  resendSection: { marginTop: 35 },
  timerRow: { flexDirection: "row", alignItems: "center" },
  timerText: { color: "#999", fontSize: 14, fontWeight: "600" },
  resendBtn: { padding: 10 },
  resendText: { color: Colors.primary, fontSize: 15 },
});