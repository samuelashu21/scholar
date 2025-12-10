import { StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { Colors } from "../constants/Utils";

const Rating = ({ value, text }) => {
  return (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.star}>
          {value >= i ? (
            <FontAwesome name="star" size={12} color={Colors.starGold} />
          ) : value >= i - 0.5 ? (
            <FontAwesome name="star-half-o" size={12} color={Colors.starGold} />
          ) : (
            <FontAwesome name="star-o" size={12} color={Colors.starGold} />
          )}
        </View>
      ))}
      {text && <Text style={styles.ratingText}>{text}</Text>}
    </View>
  );
};

export default Rating;

const styles = StyleSheet.create({
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  star: {
    marginRight: 2, 
  },
  ratingText: {
    fontSize: 13,
    color: Colors.secondaryTextColor,
    marginLeft: 8,
  },
});
