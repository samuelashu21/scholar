import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNetworkStatus } from "../utils/useNetworkStatus";

/**
 * OfflineBanner — shows a sticky banner at the top of the screen
 * whenever the device has no internet connection.
 *
 * Usage: place <OfflineBanner /> near the top of any screen layout.
 */
const OfflineBanner = ({ onReconnect }) => {
  const { isConnected, isInternetReachable } = useNetworkStatus(onReconnect);
  const offline = !isConnected || !isInternetReachable;

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#FFF" />
      <Text style={styles.text}>
        You're offline — showing cached data
      </Text>
    </View>
  );
};

export default OfflineBanner;

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#E03131",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 999,
  },
  text: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
