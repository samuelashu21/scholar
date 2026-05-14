import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import { useRequestPasswordResetMutation } from "../../slices/userAPiSlice";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";

export default function RequestResetScreen() {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  // Ref to handle manual focusing
  const emailInputRef = useRef(null);
  
  const router = useRouter();
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();

  const handleSubmit = async () => {
    Keyboard.dismiss();
    
    // Basic validation
    if (!email || !email.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
      });
      return;
    }

    try {
      await requestReset({ email }).unwrap();
      Toast.show({
        type: "success",
        text1: "Email Sent",
        text2: "Check your inbox for the reset code",
      });
      router.push({ pathname: "/ResetPasswordScreen", params: { email } });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: err?.data?.message || "Could not find an account with that email",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <FontAwesome6 name="arrow-left" size={20} color="#333" />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <FontAwesome6 name="lock-open" size={30} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                No worries! Enter your email below and we'll send you a 6-digit 
                code to reset your password.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                
                {/* Touchable wrapper ensures the whole box is "hittable" */}
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={() => emailInputRef.current?.focus()}
                  style={[
                    styles.inputWrapper, 
                    isFocused && styles.inputWrapperFocused
                  ]}
                >
                  <FontAwesome6 
                    name="envelope" 
                    size={16} 
                    color={isFocused ? Colors.primary : "#999"} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    ref={emailInputRef}
                    placeholder="example@mail.com"
                    placeholderTextColor="#BBB"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                  
                  {/* Optional: Clear text button */}
                  {email.length > 0 && (
                    <TouchableOpacity onPress={() => setEmail("")}>
                      <FontAwesome6 name="circle-xmark" size={16} color="#CCC" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleSubmit} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Send Reset Code</Text>
                    <FontAwesome6 name="paper-plane" size={16} color="#fff" style={{marginLeft: 10}} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push("/LoginScreen")} 
                style={styles.loginLink}
              >
                <Text style={styles.loginLinkText}>
                  Remember password? <Text style={styles.loginLinkBold}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFF" 
  },
  content: { 
    flex: 1, 
    padding: 25 
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 0 : 10,
  },
  header: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderWidth: 1.5,
    borderColor: "#EEE",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 58, // Slightly taller for better hit area
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    height: "100%", // Ensures input takes full height of wrapper
  },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 25,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 15,
    color: "#666",
  },
  loginLinkBold: {
    color: Colors.primary,
    fontWeight: "800",
  },
});