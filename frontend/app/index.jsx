import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Utils";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  
  // 🎭 Professional Animation Setup
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(40)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance: Logo first, then text content
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 🔵 Logo Section - Centered with a subtle glow effect background */}
      <View style={styles.heroSection}>
        <Animated.View style={{ 
          opacity: logoOpacity, 
          transform: [{ scale: logoScale }] 
        }}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
        </Animated.View>
      </View>

      {/* 📝 Brand Identity Section */}
      <Animated.View 
        style={[
          styles.footerSection, 
          { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }
        ]}
      >
        <Text style={styles.tagline}>TRADING WITH TRUST</Text>
        <Text style={styles.headline}>
          Ethiopia’s Premier{"\n"}
          <Text style={{ color: Colors.primary }}>Marketplace</Text>
        </Text>
        
        <Text style={styles.description}>
          Join thousands of buyers and sellers in the most reliable local e-commerce community.
        </Text>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.activeDot]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>
      </Animated.View>

      <Text style={styles.version}>VERSION 1.0.2</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroSection: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 180,
    height: 180,
    backgroundColor: '#F8F9FA',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow for a "Premium" feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  footerSection: {
    flex: 2,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 4,
    marginBottom: 10,
  },
  headline: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 40,
  },
  description: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    marginTop: 40,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#D1D1D1',
    letterSpacing: 1,
  }
});