import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useAddViewMutation,
} from "../../slices/productsApiSlice";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../slices/cartSlice";
import Message from "../../components/Message";
import ProductImageCard from "../../components/ProductImageCard";
import ProductDetailsCard from "../../components/ProductDetailsCard";
import ProductReviewSection from "../../components/ProductReviewSection";
import AddReviewModal from "../../components/AddReviewModal";

import { useRouter, useLocalSearchParams } from "expo-router";

const ProductScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const { userInfo } = useSelector((state) => state.auth);

  const [qty, setQty] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const viewAddedRef = useRef(false);

  const [addView] = useAddViewMutation();
  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  /* ---------------- ADD VIEW (ONCE) ---------------- */
  useEffect(() => {
    if (!product || viewAddedRef.current) return;

    const incrementView = async () => {
      try {
        if (product._id) {
          await addView(product._id).unwrap();
          viewAddedRef.current = true;
        }
      } catch (err) {
        console.log("View error:", err);
      }
    };

    incrementView();
  }, [product]);

  /* ---------------- GUARDS ---------------- */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    const errorMessage = error?.data?.message || error.error;
    return (
      <View style={styles.center}>
        <Message variant="error">{errorMessage}</Message>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Message variant="info">No product data available</Message>
      </View>
    );
  }

  /* ---------------- HANDLERS ---------------- */
  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    router.push("(screens)/Cart");
  };

  const submitReviewHandler = async () => {
    try {
      if (!rating) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a rating",
        });
        return;
      }

      if (!comment.trim()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please write a comment",
        });
        return;
      }

      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();

      refetch();
      setRating(0);
      setComment("");
      setIsReviewModalOpen(false);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Review added",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.data?.message || err.error || "Something went wrong",
      });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back-circle"
            size={40}
            color={Colors.primary}
          />
        </TouchableOpacity>

        {/* IMAGE CARD */}
        <ProductImageCard imageUrl={product.image || ""} />

        {/* DETAILS CARD */}
        <ProductDetailsCard
          product={product}
          qty={qty}
          setQty={setQty}
          handleAddToCart={handleAddToCart}
          disableAddToCart={product.countInStock === 0}
        />

        {/* REVIEW SECTION */}
        <ProductReviewSection
          reviews={product.reviews || []} // <-- safe default
          userInfo={userInfo}
          onAddReviewPress={() => setIsReviewModalOpen(true)}
        />
      </ScrollView>

      {/* ADD REVIEW MODAL */}
      <AddReviewModal
        isVisible={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        onSubmit={submitReviewHandler}
        isLoading={loadingProductReview}
      />
    </SafeAreaView>
  );
};

export default ProductScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  container: {
    padding: 18,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    padding: 20,
  },
  backButton: {
    marginVertical: 10,
    alignSelf: "flex-start",
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  backText: {
    color: Colors.white,
    fontWeight: "600",
  },
});
