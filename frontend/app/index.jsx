import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Utils";

export default function WelcomeScreen() {
  const router = useRouter();
  
  // 🎭 Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Parallel animations for a smooth entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 3000); // Slightly longer to let the user breathe

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <Animated.View 
        style={[
          styles.content, 
          { opacity: fadeAnim, transform: [{ translateY: slideUp }] }
        ]}
      >
        {/* 🔵 Logo Section */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
        </View>

        {/* 📝 Text Content Section */}
        <View style={styles.textWrapper}>
          <Text style={styles.brandTag}>WELCOME TO</Text>
          <Text style={styles.title}>
            Ethiopia’s Realest{"\n"}E-Commerce App
          </Text>

          <Text style={styles.subtitle}>
            Buy from trusted sellers or start your own journey. Sell with ease, grow with trust.
          </Text>
          
          <View style={styles.badgeContainer}>
             <Text style={styles.highlight}>🚀 Verified Sellers</Text>
             <View style={styles.dot} />
             <Text style={styles.highlight}>Fast Growth</Text>
             <View style={styles.dot} />
             <Text style={styles.highlight}>Local Trust</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Optional: Add a subtle version number or footer */}
      <Text style={styles.footerText}>v1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: "space-between", // Pushes content apart nicely
    paddingVertical: 60,
  },
  logoWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  textWrapper: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  brandTag: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1A1A1A", // Darker for better contrast
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: "#666", // Softer secondary color
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  highlight: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CCC",
    marginHorizontal: 8,
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    fontSize: 12,
    color: '#AAA',
  }
});