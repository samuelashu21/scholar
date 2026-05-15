import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors, Radius, Spacing, Typography } from "../../constants/Utils";

const EmptyState = ({
  icon = "bag-handle-outline",
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}
      {!!actionLabel && !!onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginVertical: Spacing.lg,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.infoLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.darkGray,
    textAlign: "center",
  },
  description: {
    marginTop: Spacing.xs,
    fontSize: Typography.size.md,
    color: Colors.secondaryTextColor,
    textAlign: "center",
  },
  button: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.md,
  },
});

export default EmptyState;
