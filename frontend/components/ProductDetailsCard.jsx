import { StyleSheet, Text, View, TouchableOpacity, Alert, Share } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import Rating from "./Rating";
import { Colors } from "../constants/Utils"; 
import React from "react";
import { Link, useRouter } from "expo-router";
import { timeAgo } from "../utils/timeAgo";
import { useSelector } from "react-redux"; 

const ProductDetailsCard = ({ 
  product,
  qty,
  setQty,
  handleAddToCart,
  disableAddToCart,
  maxQty,
  hideButton, // <--- 1. NOW RECEIVING THE PROP
}) => { 
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  if (!product) return null;

  const seller = product?.user;
  const isMyProduct = userInfo?._id === seller?._id;

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
        productImage: product.image || (product.images && product.images[0]),
        productPrice: product.price.toString(),
      },
    });
  };
 
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.productName}>{product.name}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priceRatingRow}>
        <Text style={styles.price}>${product.price}</Text>
        <Rating value={product.rating} text={`${product.numReviews}`} />
      </View>

      <View style={styles.divider} />

      <Text style={styles.description}>{product.description}</Text>

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

        {!isMyProduct && product.countInStock > 0 && (
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.pickerHolder}>
              <Picker
                selectedValue={qty}
                onValueChange={setQty}
                style={styles.picker}
              >
                {[...Array(maxQty || product.countInStock).keys()].map((x) => (
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

      <View style={styles.sellerCard}>
        <Ionicons name="person-circle-outline" size={42} color={Colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sellerLabel}>Seller</Text>
          <View style={styles.sellerActionRow}>
            <Link
              href={{
                pathname: "/SellerProfile",
                params: { sellerId: seller?._id },
              }}
              asChild
            >
              <TouchableOpacity>
                <Text style={styles.sellerName}>
                  {isMyProduct 
                    ? "You (Owner)" 
                    : `${seller?.FirstName || ""} ${seller?.LastName || ""}`.trim()}
                </Text>
              </TouchableOpacity>
            </Link>

            {!isMyProduct && seller && (
              <TouchableOpacity onPress={handleChatPress} style={styles.chatIconBtn}>
                <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.postedTime}>{timeAgo(product?.createdAt)}</Text>
        </View>
      </View>

      {/* 2. LOGIC: ONLY RENDER IF HIDEBUTTON IS FALSE */}
      {!hideButton && (
        <TouchableOpacity 
          style={[
            styles.mainButton,
            (disableAddToCart || isMyProduct) && styles.disabledButton,
          ]}
          onPress={isMyProduct ? () => router.push("/account") : handleAddToCart}
          disabled={disableAddToCart && !isMyProduct}
        >
          <Ionicons 
            name={isMyProduct ? "settings-outline" : "cart-outline"} 
            size={22} 
            color={Colors.white} 
          />
          <Text style={styles.cartText}>
            {isMyProduct ? "Manage Listing" : "Add To Cart"}
          </Text>
        </TouchableOpacity>
      )}
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
    elevation: 3,
  },
  // Updated headerRow to align Share button
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  }, 
  productName: { 
    fontSize: 24, 
    fontWeight: "700", 
    flex: 1, 
    textAlign: "left",
    color: Colors.darkGray 
  },
  shareBtn: {
    flexDirection: "row", // Align icon and text horizontally
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: 5, // Space between icon and text
    marginLeft: 10,
  },
  shareText: { 
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  priceRatingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  price: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.lightGray, marginVertical: 16 },
  description: { fontSize: 15, lineHeight: 22, color: Colors.darkGray, marginBottom: 16 },
  section: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.lightGray },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  label: { fontSize: 16, fontWeight: "600" },
  statusText: { fontSize: 16, fontWeight: "600" },
  inStock: { color: Colors.success },
  outOfStock: { color: Colors.danger },
  pickerHolder: { width: 100, borderWidth: 1, borderColor: Colors.lightGray, borderRadius: 12, overflow: "hidden" },
  picker: { height: 50 },
  
  /* Seller Info */
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    padding: 12,
    borderRadius: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  sellerActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatIconBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  chatBtnText: { color: Colors.primary, fontWeight: "600", fontSize: 12 },
  sellerLabel: { fontSize: 12, color: Colors.darkGray },
  sellerName: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  postedTime: { fontSize: 13, color: Colors.darkGray, marginTop: 2 },

  /* Buttons */
  mainButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  cartText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  disabledButton: { backgroundColor: Colors.darkGray, opacity: 0.8 },
});
