import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import Rating from "./Rating";
import { Colors } from "../constants/Utils";
import React from "react";
import { Link } from "expo-router";
import { timeAgo } from "../utils/timeAgo";

const ProductDetailsCard = ({
  product,
  qty,
  setQty,
  handleAddToCart,
  disableAddToCart,
}) => {
  if (!product) return null;

  const user = product?.user;

  return (
    <View style={styles.card}>
      {/* Product Name */}
      <Text style={styles.productName}>{product.name}</Text>

      {/* Price + Rating */}
      <View style={styles.priceRatingRow}>
        <Text style={styles.price}>${product.price}</Text>
        <Rating value={product.rating} text={`${product.numReviews}`} />
      </View>

      <View style={styles.divider} />

      {/* Description */}
      <Text style={styles.description}>{product.description}</Text>

      {/* Status + Quantity */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[
              styles.statusText,
              product.countInStock > 0 ? styles.inStock : styles.outOfStock,
            ]}
          >
            {product.countInStock > 0 ? "In stock" : "Out of stock"}
          </Text>
        </View>

        {product.countInStock > 0 && (
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Quantity</Text>

            <View style={styles.pickerHolder}>
              <Picker
                selectedValue={qty}
                onValueChange={setQty}
                style={styles.picker}
              >
                {[...Array(product.countInStock).keys()].map((x) => (
                  <Picker.Item
                    key={x}
                    label={`${x + 1}`}
                    value={x + 1}
                    color={Colors.darkGray}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </View>

      {/* Seller Info */}
      <View style={styles.sellerCard}>
        <Ionicons name="person-circle-outline" size={42} color={Colors.primary} />

        <View style={{ flex: 1 }}>
          <Text style={styles.sellerLabel}>Seller</Text>

          {user ? (
            <Link
              href={{
                pathname: "/SellerProfile",
                params: { sellerId: user._id },
              }}
              asChild
            > 
              <TouchableOpacity>
                <Text style={styles.sellerName}>
                  {`${user.FirstName || ""} ${user.LastName || ""}`.trim()}
                </Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <Text style={styles.sellerName}>Unknown</Text>
          )}

          <Text style={styles.postedTime}>{timeAgo(product?.createdAt)}</Text>
        </View>
      </View>

      {/* Add To Cart */}
      <TouchableOpacity
        style={[
          styles.addToCartButton,
          disableAddToCart && styles.disabledButton,
        ]}
        onPress={handleAddToCart}
        disabled={disableAddToCart}
      >
        <Ionicons name="cart-outline" size={22} color={Colors.white} />
        <Text style={styles.cartText}>Add To Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductDetailsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  productName: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  priceRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  price: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 16,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.darkGray,
    marginBottom: 16,
  },

  section: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
  },

  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  inStock: { color: Colors.success },
  outOfStock: { color: Colors.danger },

  pickerHolder: {
    width: 120,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },

  picker: { height: 50 },

  /* Seller Card */

  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    padding: 12,
    borderRadius: 14,
    marginVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },

  sellerLabel: {
    fontSize: 12,
    color: Colors.darkGray,
    marginBottom: 2,
  },

  sellerName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  postedTime: {
    fontSize: 13,
    color: Colors.darkGray,
    marginTop: 2,
  },

  /* Add to Cart */

  addToCartButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 3,
  },

  cartText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  disabledButton: {
    backgroundColor: Colors.lightGray,
    opacity: 0.7,
  },
});
