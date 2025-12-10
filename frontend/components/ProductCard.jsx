import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/Utils";
import { useRouter } from "expo-router";

const ProductCard = ({ product }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/ProductScreen?productId=${product._id}`)}
      style={styles.card}
    >
      <Image source={{ uri: product.image }} style={styles.image} />

      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>

      <Text style={styles.price}>${product.price}</Text>

      <Text style={styles.sold}>Sold: {product.numReviews + 20}</Text>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
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
 