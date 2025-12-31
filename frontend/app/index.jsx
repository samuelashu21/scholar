import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Utils";
import { useEffect } from "react";

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 8500); // ⏱️ 2.5 seconds (AliExpress style)

    return () => clearTimeout(timer);
  }, []); 

  return ( 
    <SafeAreaView style={styles.container}>
      {/* 🔴 Banner */}
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.banner}
      />

      {/* Text */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to YourShop</Text>
        <Text style={styles.subtitle}>
          Discover trusted sellers. Shop smarter. Fast delivery.
        </Text>
      </View> 
    </SafeAreaView> 
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  banner: {
    width: "100%",
    height: "65%",
    resizeMode: "cover",
  },

  content: {
    flex: 1, 
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textColor,
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
