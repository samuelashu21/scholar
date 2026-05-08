import React from "react";
import { StyleSheet, Text, View } from "react-native";

const OfflineBanner = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>You're offline — showing cached data</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF4E5",
    borderBottomColor: "#FD7E14",
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: "#7A4A00",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default OfflineBanner;
