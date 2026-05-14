import { StyleSheet, Text, View, Image } from "react-native";
import React from "react"; 
import { Colors } from "../constants/Utils";
import { BASE_URL } from "../constants/Urls";

const ProductImageCard = ({ imageUrl }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const fullUrl = `${BASE_URL}${imagePath}`;
    return fullUrl;
  };

  return (
    <View style={styles.imageCard}>
      <Image
        source={{ uri: getImageUrl(imageUrl) }}
        style={styles.productImage}
        resizeMode="contain"
        onError={(e) => {
          console.log("product image card error"), e.nativeEvent.error;
        }}
        onLoad={() => console.log("image loaded successfully")}
      />
    </View>
  );
};

export default ProductImageCard;

const styles = StyleSheet.create({
  imageCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});
