import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useAddViewMutation,
} from "../../slices/productsApiSlice";

import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Shadows, Spacing, Typography } from "../../constants/Utils";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../slices/cartSlice";
import ProductImageCard from "../../components/ProductImageCard";
import ProductDetailsCard from "../../components/ProductDetailsCard";
import ProductReviewSection from "../../components/ProductReviewSection";
import AddReviewModal from "../../components/AddReviewModal";
import EmptyState from "../../components/ui/EmptyState";
import ScreenLoader from "../../components/ui/ScreenLoader";

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
  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId, {
    skip: !productId || productId === "undefined",
  });

  useEffect(() => {
    if (!product?._id || viewAddedRef.current) return;

    const incrementView = async () => {
      try {
        await addView({ productId: product._id, deviceId: "mobile_user" }).unwrap();
        viewAddedRef.current = true;
      } catch (err) {
        console.log("View error detail:", err);
      }
    };

    incrementView();
  }, [product, addView]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    Toast.show({
      type: "success",
      text1: "Added to cart",
      text2: `${product.name} has been added.`,
    });
    router.push("(screens)/Cart");
  };

  const submitReviewHandler = async () => {
    try {
      if (!rating || !comment.trim()) {
        Toast.show({ type: "error", text1: "Error", text2: "Fill all fields" });
        return;
      }

      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      setRating(0);
      setComment("");
      setIsReviewModalOpen(false);
      Toast.show({ type: "success", text1: "Review added" });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.data?.message || "Something went wrong",
      });
    }
  };

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.errorSafeArea}>
        <EmptyState
          icon="alert-circle-outline"
          title="We couldn't load this product"
          description={error?.data?.message || "Please try again in a moment."}
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const totalPrice = Number(product.price) * qty;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.offWhite} />

      <View style={styles.topNavigation}>
        <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Product details</Text>
        <TouchableOpacity onPress={() => router.push("/(screens)/Cart")} style={styles.roundBtn}>
          <Ionicons name="bag-handle-outline" size={20} color={Colors.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <ProductImageCard imageUrl={product.image || ""} images={product.images || []} />

        <ProductDetailsCard
          product={product}
          qty={qty}
          setQty={setQty}
          handleAddToCart={handleAddToCart}
          disableAddToCart={product.countInStock === 0}
          hideButton
        />

        <View style={styles.sectionGap} />

        <ProductReviewSection
          reviews={product.reviews || []}
          userInfo={userInfo}
          onAddReviewPress={() => setIsReviewModalOpen(true)}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.mainBtn, product.countInStock === 0 && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={product.countInStock === 0}
        >
          <Ionicons name="bag-add-outline" size={20} color={Colors.white} />
          <Text style={styles.mainBtnText}>
            {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  errorSafeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    justifyContent: "center",
    padding: Spacing.screen,
  },
  topNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.offWhite,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.sm,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: Spacing.md,
    textAlign: "center",
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.darkGray,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: 120,
  },
  sectionGap: {
    height: Spacing.md,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    alignItems: "center",
    gap: Spacing.md,
    ...Shadows.lg,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: Typography.size.xs,
    color: Colors.secondaryTextColor,
    fontWeight: Typography.weight.semibold,
    textTransform: "uppercase",
  },
  totalPrice: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.heavy,
    color: Colors.primary,
  },
  mainBtn: {
    flex: 1.7,
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  mainBtnText: {
    color: Colors.white,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  disabledBtn: {
    backgroundColor: Colors.gray,
  },
});
