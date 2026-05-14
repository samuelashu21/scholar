import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Colors } from "../../constants/Utils";

const AuthEntryScreen = () => {
  const router = useRouter();
  const { redirect } = useLocalSearchParams();

  const handleSocialLogin = (platform) => {
    console.log(`Logging in with ${platform}`);
    // Logic for Google/FB/TikTok goes here
  };

  const navigateToRegister = () => {
    router.push({
      pathname: "/RegisterScreen",
      params: redirect ? { redirect } : {},
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        
        <Text style={styles.welcomeTitle}>Welcome to Sho</Text>
        <Text style={styles.subtitle}>Sign in to sync your wishlist, coupons, and orders across devices.</Text>
 
        {/* Social Options - AliExpress Style */}
        <View style={styles.socialGroup}>
          <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]} onPress={() => handleSocialLogin("Google")}>
            <FontAwesome6 name="google" size={20} color="#fff" />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, styles.facebookBtn]} onPress={() => handleSocialLogin("Facebook")}>
            <FontAwesome6 name="facebook" size={20} color="#fff" />
            <Text style={styles.socialBtnText}>Continue with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, styles.tiktokBtn]} onPress={() => handleSocialLogin("TikTok")}>
            <FontAwesome6 name="tiktok" size={20} color="#fff" />
            <Text style={styles.socialBtnText}>Continue with TikTok</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* The Email/Phone Option */}
        <TouchableOpacity style={styles.emailBtn} onPress={navigateToRegister}>
          <FontAwesome6 name="envelope" size={18} color={Colors.primary} />
          <Text style={styles.emailBtnText}>Register with Email or Phone</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthEntryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 30, alignItems: "center", justifyContent: "center" },
  logo: { width: 100, height: 100, marginBottom: 20, resizeMode: "contain" },
  welcomeTitle: { fontSize: 24, fontWeight: "bold", color: "#111", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 40, lineHeight: 20 },
  socialGroup: { width: "100%", gap: 12 },
  socialBtn: { flexDirection: "row", height: 55, borderRadius: 28, alignItems: "center", paddingHorizontal: 25, elevation: 2 },
  googleBtn: { backgroundColor: "#EA4335" },
  facebookBtn: { backgroundColor: "#1877F2" },
  tiktokBtn: { backgroundColor: "#000000" },
  socialBtnText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 15 },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: "#EEE" },
  dividerText: { marginHorizontal: 15, color: "#999", fontWeight: "bold" },
  emailBtn: { flexDirection: "row", height: 55, width: "100%", borderRadius: 28, borderWidth: 1.5, borderColor: Colors.primary, alignItems: "center", justifyContent: "center", gap: 10 },
  emailBtnText: { color: Colors.primary, fontSize: 16, fontWeight: "bold" },
  footer: { flexDirection: "row", marginTop: 40 },
  footerText: { color: "#666", fontSize: 15 },
  loginLink: { color: Colors.primary, fontWeight: "bold", fontSize: 15 },
}); 