import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  useResetPasswordMutation,
  useResendResetPasswordOTPMutation,
} from "../../slices/userAPiSlice";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const email = params.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(300); // 5 minutes countdown
  const inputRefs = useRef([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [resendOTP, { isLoading: resending }] =
    useResendResetPasswordOTPMutation();

  // TIMER COUNTDOWN
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formattedTime = `${Math.floor(timer / 60)}:${String(
    timer % 60
  ).padStart(2, "0")}`;

  // HANDLE OTP INPUT
  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      // Move to next field automatically
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleReset = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      Toast.show({ type: "error", text1: "Invalid OTP" });
      return;
    }

    if (!newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    try {
      await resetPassword({
        email,
        otp: finalOtp,
        newPassword,
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password reset successfully",
      });

      router.replace("/LoginScreen");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: err?.data?.message || err.error,
      });
    }
  };

  const handleResend = async () => {
    if (timer > 0) return; // prevent spam

    try {
      await resendOTP({ email }).unwrap();
      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "A new reset password OTP has been sent",
      });

      setTimer(300); // restart timer
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
      <Text style={styles.label}>Enter 6-digit OTP</Text>

      {/* Modern OTP Input Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
          />
        ))}
      </View>

      {/* Timer + Resend */}
      {timer > 0 ? (
        <Text style={styles.timerText}>Resend OTP in {formattedTime}</Text>
      ) : (
        <TouchableOpacity onPress={handleResend} disabled={resending}>
          {resending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.resendText}>Resend OTP</Text>
          )}
        </TouchableOpacity>
      )}

      {/* NEW PASSWORD */}
      <View style={styles.passwordWrapper}>
        <TextInput
          placeholder="New Password"
          secureTextEntry={!showPass}
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPass(!showPass)}
          style={styles.eyeIcon}
        >
          <Ionicons name={showPass ? "eye" : "eye-off"} size={22} />
        </TouchableOpacity>
      </View>

      {/* CONFIRM PASSWORD */}
      <View style={styles.passwordWrapper}>
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={!showConfirm}
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirm(!showConfirm)}
          style={styles.eyeIcon}
        >
          <Ionicons name={showConfirm ? "eye" : "eye-off"} size={22} />
        </TouchableOpacity>
      </View>

      {/* RESET BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleReset}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },

  label: { fontSize: 16, fontWeight: "600", marginBottom: 10 },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  otpBox: {
    width: 50,
    height: 55,
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: "#007bff",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },

  timerText: {
    textAlign: "center",
    marginBottom: 20,
    color: "gray",
  },

  resendText: {
    textAlign: "center",
    color: "#007bff",
    fontWeight: "bold",
    marginBottom: 20,
  },

  passwordWrapper: {
    position: "relative",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
  },

  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 14,
  },

  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
 