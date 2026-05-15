import { StyleSheet, Text, View, TouchableOpacity, Alert, Share } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import Rating from "./Rating";
import { Colors, Radius, Shadows, Spacing, Typography } from "../constants/Utils";
import React from "react";
import { Link, useRouter } from "expo-router";
import { timeAgo } from "../utils/timeAgo";
import { useSelector } from "react-redux";
 
const ProductDetailsCard = ({ product, qty, setQty, handleAddToCart, disableAddToCart, hideButton }) => {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  if (!product) return null;

  const seller = product?.user;
  const isMyProduct = userInfo?._id === seller?._id;
  const originalPrice = Number((product.price * 1.12).toFixed(2));
  const discountPercent = Math.max(0, Math.round(((originalPrice - product.price) / originalPrice) * 100));

  const handleShare = async () => {
    try {
      const shareUrl = `frontend://product/${product._id}`;
      await Share.share({
        message: `Check out ${product.name} on our app!\n\nOpen link: ${shareUrl}`,
        url: shareUrl,
        title: `Share ${product.name}`,
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleChatPress = () => {
    if (!userInfo) {
      router.push("/LoginScreen");
      return;
    }
    if (isMyProduct) {
      Alert.alert("Notice", "You cannot chat with yourself about your own product.");
      return;
    }
    router.push({
      pathname: "/ChatScreen",
      params: {
        receiverId: seller._id,
        receiverName: `${seller.FirstName || ""} ${seller.LastName || ""}`.trim(),
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        productPrice: product.price.toString(),
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Rating value={product.rating} text={`${product.numReviews} reviews`} />
          </View>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priceWrap}>
        <Text style={styles.price}>${product.price}</Text>
        {discountPercent > 0 && (
          <>
            <Text style={styles.originalPrice}>${originalPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          </>
        )}
      </View>

      <Text style={styles.description}>{product.description}</Text>

      <View style={styles.stockRow}>
        <Text style={styles.label}>Availability</Text>
        <Text style={[styles.stockText, product.countInStock > 0 ? styles.inStock : styles.outOfStock]}>
          {product.countInStock > 0 ? "In stock" : "Out of stock"}
        </Text>
      </View>

      {!isMyProduct && product.countInStock > 0 && (
        <View style={styles.stockRow}>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.pickerHolder}>
            <Picker selectedValue={qty} onValueChange={setQty} style={styles.picker}>
              {[...Array(product.countInStock).keys()].map((x) => (
                <Picker.Item key={x} label={`${x + 1}`} value={x + 1} color={Colors.darkGray} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      <View style={styles.deliveryRow}>
        <View style={styles.deliveryCard}>
          <Ionicons name="car-outline" size={18} color={Colors.primary} />
          <Text style={styles.deliveryTitle}>Fast delivery</Text>
          <Text style={styles.deliverySub}>2-5 business days</Text>
        </View>
        <View style={styles.deliveryCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
          <Text style={styles.deliveryTitle}>Buyer protection</Text>
          <Text style={styles.deliverySub}>Secure checkout</Text>
        </View>
      </View>

      <View style={styles.sellerCard}>
        <Ionicons name="person-circle-outline" size={42} color={Colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sellerLabel}>Seller</Text>
          <View style={styles.sellerActionRow}>
            <Link href={{ pathname: "/SellerProfile", params: { sellerId: seller?._id } }} asChild>
              <TouchableOpacity>
                <Text style={styles.sellerName}>
                  {isMyProduct ? "You (Owner)" : `${seller?.FirstName || ""} ${seller?.LastName || ""}`.trim()}
                </Text>
              </TouchableOpacity>
            </Link>

            {!isMyProduct && seller && (
              <TouchableOpacity onPress={handleChatPress} style={styles.chatIconBtn}>
                <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.postedTime}>{timeAgo(product?.createdAt)}</Text>
        </View>
      </View>

      {!hideButton && (
        <TouchableOpacity
          style={[styles.mainButton, (disableAddToCart || isMyProduct) && styles.disabledButton]}
          onPress={isMyProduct ? () => router.push("/account") : handleAddToCart}
          disabled={disableAddToCart && !isMyProduct}
        >
          <Ionicons name={isMyProduct ? "settings-outline" : "cart-outline"} size={22} color={Colors.white} />
          <Text style={styles.cartText}>{isMyProduct ? "Manage Listing" : "Add To Cart"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProductDetailsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  productName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.darkGray,
  },
  ratingRow: {
    marginTop: 4,
  },
  shareBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  shareText: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  priceWrap: {
    marginTop: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 28,
    color: Colors.primary,
    fontWeight: Typography.weight.heavy,
  },
  originalPrice: {
    fontSize: Typography.size.md,
    color: Colors.gray,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: Colors.error,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: Colors.danger,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  description: {
    marginTop: Spacing.sm,
    color: Colors.secondaryTextColor,
    fontSize: Typography.size.md,
    lineHeight: 22,
  },
  stockRow: {
    marginTop: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: Colors.darkGray,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  stockText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  inStock: {
    color: Colors.inStock,
  },
  outOfStock: {
    color: Colors.danger,
  },
  pickerHolder: {
    width: 100,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  picker: { height: 50 },
  deliveryRow: {
    marginTop: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  deliveryCard: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  deliveryTitle: {
    marginTop: 6,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.darkGray,
  },
  deliverySub: {
    marginTop: 2,
    fontSize: Typography.size.xs,
    color: Colors.secondaryTextColor,
  },
  sellerCard: {
    marginTop: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  sellerLabel: {
    fontSize: Typography.size.xs,
    color: Colors.secondaryTextColor,
  },
  sellerActionRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sellerName: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.darkGray,
  },
  chatIconBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.white,
  },
  chatBtnText: {
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.xs,
  },
  postedTime: {
    marginTop: 2,
    fontSize: Typography.size.xs,
    color: Colors.secondaryTextColor,
  },
  mainButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.gray,
    opacity: 0.85,
  },
  cartText: {
    color: Colors.white,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
});