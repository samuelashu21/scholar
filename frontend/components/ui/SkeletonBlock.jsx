import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Radius } from "../../constants/Utils";

const SkeletonBlock = ({ height = 12, width = "100%", style }) => {
  return <View style={[styles.base, { height, width }, style]} />;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.lightGray,
    borderRadius: Radius.md,
  },
});

export default SkeletonBlock;
