import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import Rating from "./Rating";
import { Colors, Radius, Shadows, Spacing, Typography } from "../constants/Utils";
import { BASE_URL } from "../constants/Urls";
import { Ionicons } from "@expo/vector-icons";
import { timeAgo } from "../utils/timeAgo";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { getDeviceId } from "../utils/deviceId";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from "../slices/wishlistApiSlice";
import { useToggleLikeMutation, useAddViewMutation } from "../slices/productsApiSlice";

const PRIORITY_THEMES = {
  3: { label: "Diamond", color: "#06B6D4", icon: "diamond" },
  2: { label: "Gold", color: "#EAB308", icon: "medal" },
  1: { label: "Silver", color: "#94A3B8", icon: "checkmark-circle" },
  0: { label: null, color: null, icon: null },
};

function Product({ product }) {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  const priorityLevel = product.effectivePriority || product.user?.sellerRequest?.subscriptionLevel || 0;
  const theme = PRIORITY_THEMES[priorityLevel];

  const { data: wishlist } = useGetWishlistQuery();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const isWishlisted = wishlist?.some((item) => item._id === product._id);

  const getInitialViews = (data) => (Array.isArray(data) ? data.length : typeof data === "number" ? data : 0);
  const [views, setViews] = useState(product.views || 0);
  const [addView] = useAddViewMutation();

  useEffect(() => {
    setViews(getInitialViews(product?.views));
  }, [product?.views]);

  const [liked, setLiked] = useState(product.isLiked || false);
  const [likesCount, setLikesCount] = useState(product.likesCount || 0);
  const [toggleLike, { isLoading }] = useToggleLikeMutation();

  useEffect(() => {
    setLiked(product?.isLiked || false);
    setLikesCount(product?.likesCount || 0);
  }, [product?.isLiked, product?.likesCount]);

  const toggleWishlist = async () => {
    if (!userInfo) {
      router.push({ pathname: "(screens)/LoginScreen" });
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id).unwrap();
      } else {
        await addToWishlist(product._id).unwrap();
      }
    } catch (err) {
      console.log("Wishlist error:", err);
    }
  };

  const handleLike = async (e) => {
    e?.stopPropagation?.();
    if (!userInfo) {
      router.push({ pathname: "(screens)/LoginScreen" });
      return;
    }
    if (isLoading) return;

    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      await toggleLike(product._id).unwrap();
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handlePress = async () => {
    if (!product?._id) return;
    try {
      const deviceId = await getDeviceId();
      const response = await addView({ productId: product._id, deviceId }).unwrap();
      if (response?.views !== undefined) {
        setViews(response.views);
      }
    } catch (err) {
      console.log("Add view error:", err);
    }
    router.push({ pathname: "/ProductScreen", params: { productId: product._id } });
  };

  const getImageUrl = () => {
    if (!product.image) return null;
    return product.image.startsWith("http") ? product.image : `${BASE_URL}${product.image}`;
  };

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handlePress}>
      {theme.label && (
        <View style={[styles.priorityBadge, { backgroundColor: theme.color }]}> 
          <Ionicons name={theme.icon} size={10} color={Colors.white} />
          <Text style={styles.badgeText}>{theme.label}</Text>
        </View>
      )}

      <Image source={{ uri: getImageUrl() }} style={styles.image} resizeMode="cover" />

      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>
        <Rating value={product.rating} text={`${product.numReviews} reviews`} />
      </View>

      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleLike} disabled={isLoading}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? Colors.primary : Colors.gray} />
          </TouchableOpacity>
          <Text style={styles.metaText}>{likesCount}</Text>
          <Ionicons name="eye-outline" size={16} color={Colors.gray} />
          <Text style={styles.metaText}>{views}</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={toggleWishlist}>
          <Ionicons
            name={isWishlisted ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isWishlisted ? Colors.primary : Colors.gray}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.time}>{timeAgo(product.createdAt)}</Text>
    </TouchableOpacity>
  );
}

export default Product;

const styles = StyleSheet.create({
  card: {
    width: "48.5%",
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  priorityBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: Typography.weight.bold,
    textTransform: "uppercase",
  },
  image: {
    width: "100%",
    height: 132,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
  },
  info: {
    marginTop: Spacing.sm,
    gap: 2,
  },
  name: {
    minHeight: 34,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textColor,
  },
  price: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  actionBar: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderColor: Colors.lightGray,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    padding: 2,
  },
  metaText: {
    fontSize: Typography.size.xs,
    color: Colors.gray,
    marginRight: 6,
  },
  time: {
    marginTop: 4,
    fontSize: Typography.size.xs,
    color: Colors.gray,
    textAlign: "right",
  },
}); 