import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Utils";

const Message = ({ variant = "error", children }) => {
  const variantStyles = {
    success: {
      backgroundColor: Colors.successLight,
      color: Colors.success,
      borderColor: Colors.successBorder,
    }, 
    error: {
      backgroundColor: Colors.error,
      color: Colors.textRed,
      borderColor: Colors.errorBorder,
    },
    info: {
      backgroundColor: Colors.infoLight,
      color: Colors.info,
      borderColor: Colors.infoBorder,
    },
  };

  const selectedStyle = variantStyles[variant] || variantStyles.error;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: selectedStyle.backgroundColor,
          borderLeftColor: selectedStyle.borderColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: selectedStyle.color }]}>
        {children}
      </Text>
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderLeftWidth: 4,
    borderRadius: 4,
    marginVertical: 8,
    width: "100%",
    alignItems: "center", 
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
});
