 import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { useRequestPasswordResetMutation  } from "../../slices/userAPiSlice";
import { useRouter } from "expo-router";  

export default function RequestResetScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
 
  const handleSubmit = async () => {
    if (!email) {
      Toast.show({ type: "error", text1: "Enter email", text2: "Please enter your email" });
      return;
    }
    try { 
      await requestReset({ email }).unwrap();
      Toast.show({ type: "success", text1: "OTP Sent", text2: "Check your email for OTP" });
         //  router.push(`/OtpScreen?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirect)}`);
      router.push({ pathname: "/ResetPasswordScreen", params: { email } });
    } catch (err) { 
      Toast.show({ type: "error", text1: "Failed", text2: err?.data?.message || err.error });
    }
  }; 

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 20 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
 