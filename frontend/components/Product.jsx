import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import Rating from "./Rating";
import { Colors } from "../constants/Utils";
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

import {
  useToggleLikeMutation,
  useAddViewMutation,
} from "../slices/productsApiSlice";

function Product({ product }) {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  /* ---------------- Wishlist ---------------- */
  const { data: wishlist } = useGetWishlistQuery();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isWishlisted = wishlist?.some((item) => item._id === product._id);

/* ---------------- Views Logic ---------------- */
  // Helper to determine the count regardless of if backend sends an array or a number
  const getInitialViews = (data) => {
    if (Array.isArray(data)) return data.length;
    return typeof data === "number" ? data : 0;
  }; 

  const [views, setViews] = useState(product.views || 0); // <-- local state

  const [addView] = useAddViewMutation();


// Sync state when product prop updates (e.g., after an API re-fetch)
  useEffect(() => {
    setViews(getInitialViews(product?.views)); 
  }, [product?.views]); 
   
  /* ---------------- Like State (LOCAL) ---------------- */
  const [liked, setLiked] = useState(product.isLiked || false);
  const [likesCount, setLikesCount] = useState(product.likesCount || 0);

  const [toggleLike, { isLoading }] = useToggleLikeMutation();

  /* Keep UI in sync if product changes */
  useEffect(() => {
    setLiked(product?.isLiked || false);
    setLikesCount(product?.likesCount || 0);
  }, [product?.isLiked, product?.likesCount]);
 

  /* ---------------- Handlers ---------------- */
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
  // Safety check
  if (!product?._id) {
    console.error("❌ Product ID is missing");
    return;
  } 
  try {
    const deviceId = await getDeviceId();
    // Call backend
    const response = await addView({
      productId: product._id,
      deviceId,
    }).unwrap();
 
    if (response?.views !== undefined) {
      setViews(response.views); // ✅ backend truth
    }
  } catch (err) {
    console.log("Add view error:", err);
  }
  // ✅ KEEP NAVIGATION (unchanged)
  router.push({
    pathname: "/ProductScreen",
    params: { productId: product._id },
  });
};


  const getImageUrl = () => {
    if (!product.image) return null;
    if (product.image.startsWith("http")) return product.image;
    return `${BASE_URL}${product.image}`;
  };

  /* ---------------- UI ---------------- */
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={handlePress}
    >
      {/* IMAGE */}
      <Image
        source={{ uri: getImageUrl() }}
        style={styles.image}
        resizeMode="contain"
      />

      {/* INFO */}
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {product.name}
        </Text>

        <Text style={styles.price}>${product.price}</Text>

        <Rating value={product.rating} text={`${product.numReviews} reviews`} />
      </View>

      {/* SOCIAL BAR */}
     {/* SOCIAL BAR */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleLike}
            disabled={isLoading}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "red" : Colors.darkGray}
            />
          </TouchableOpacity>

          <Text style={styles.likeCount}>{likesCount}</Text>

          <View style={styles.views}>
            <Ionicons name="eye-outline" size={18} color={Colors.gray} />
            <Text style={styles.viewsText}>{views}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={toggleWishlist}>
          <Ionicons
            name={isWishlisted ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isWishlisted ? Colors.primary : Colors.darkGray}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.time}>{timeAgo(product.createdAt)}</Text>
    </TouchableOpacity>
  );
}

export default Product;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 10,
  },
  info: {
    marginTop: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 2,
  },
  actionBar: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: Colors.lightGray,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    padding: 2,
  },
  views: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsText: {
    fontSize: 12,
    color: Colors.gray,
  },
  likeCount: {
    fontSize: 12,
    color: Colors.gray,
  },
  time: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.gray,
    textAlign: "right",
  },
});
