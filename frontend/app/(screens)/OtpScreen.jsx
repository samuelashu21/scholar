import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  useVerifyOTPMutation,
  useResendOTPMutation,
} from "../../slices/userAPiSlice";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

export default function OTPScreen() {
  const { email, redirect } = useLocalSearchParams();
  const router = useRouter();

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // 5-minute countdown = 300 seconds
  const [counter, setCounter] = useState(300);

  const [verifyOTP, { isLoading: verifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: resending }] = useResendOTPMutation();

  // Countdown Timer
  useEffect(() => {
    if (counter <= 0) return;
    const timer = setTimeout(() => setCounter(counter - 1), 1000);
    return () => clearTimeout(timer);
  }, [counter]);

  const handleOTPChange = (value, index) => {
    if (!/^[0-9]$/.test(value) && value !== "") return;

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const otp = otpArray.join("");

    if (otp.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter all 6 digits",
      });
      return;
    }

    try {
      await verifyOTP({ email, otp }).unwrap();
      Toast.show({
        type: "success",
        text1: "Verified!",
        text2: "Your account has been verified",
      });
      router.replace(redirect || "/LoginScreen");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: err?.data?.message || err.error,
      });
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email }).unwrap();
      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "A new OTP has been sent to your email",
      });

      setOtpArray(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();

      setCounter(300); // Restart 5 min timer
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Resend Failed",
        text2: err?.data?.message || err.error,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>

      {/* OTP BOXES */}
      <View style={styles.otpContainer}>
        {otpArray.map((digit, index) => (
          <TextInput
            key={index}
            value={digit}
            onChangeText={(value) => handleOTPChange(value, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.otpBox}
            ref={(ref) => (inputRefs.current[index] = ref)}
          />
        ))}
      </View>

      {/* VERIFY BUTTON */}
      <TouchableOpacity
        onPress={handleVerify}
        style={[styles.button, verifying && styles.buttonDisabled]}
        disabled={verifying}
      >
        {verifying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      {/* RESEND SECTION */}
      <View style={{ marginTop: 25, alignItems: "center" }}>
        {counter > 0 ? (
          <Text style={styles.timerText}>
            Resend available in {Math.floor(counter / 60)}:
            {(counter % 60).toString().padStart(2, "0")}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            {resending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.resendText}>Resend OTP</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 30,
  },
  otpBox: {
    width: 50,
    height: 55,
    borderWidth: 1.5,
    borderColor: "#007bff",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  timerText: { color: "gray", fontSize: 16 },
  resendText: { color: "#007bff", fontWeight: "bold", fontSize: 16 },
});
 