import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/Utils";
import { useRouter } from "expo-router";
import { BASE_URL } from "../constants/Urls";
import Ionicons from "@expo/vector-icons/Ionicons";

const ProductCard = ({ product, isWishlistItem = false, onRemove }) => {
  const router = useRouter();

  const getImageUrl = () => {   
    if (!product.image) return null;
    if (product.image.startsWith("http")) return product.image;
    return `${BASE_URL}${product.image}`;
  };

  return (
    <View style={styles.cardWrapper}>
      {/* ❌ Remove button only in wishlist */}
      {isWishlistItem && (
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(product._id)}>
          <Ionicons name="close-circle" size={24} color="red" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => router.push(`/ProductScreen?productId=${product._id}`)}
        style={styles.card}
      >
        <Image
          source={{ uri: getImageUrl() }}
          style={styles.image}
          resizeMode="contain"
        />

        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>

        <Text style={styles.price}>${product.price}</Text>

        <Text style={styles.sold}>Sold: {product.numReviews + 20}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  cardWrapper: {
    width: "48%",
    position: "relative",
    marginBottom: 15,
  },
  removeBtn: {
    position: "absolute",
    zIndex: 10,
    right: 5,
    top: 5,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 12,
  },
  name: {
    fontSize: 14,
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "bold",
    marginTop: 4,
  },
  sold: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 4,
  },
});
