import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useAddViewMutation,
  useGetProductsQuery,
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
import { ProductDetailSkeleton } from "../../components/SkeletonLoader";
import ProductCard from "../../components/ProductCard";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

const ProductScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { productId } = useLocalSearchParams();
  const { userInfo } = useSelector((state) => state.auth);

  const [qty, setQty] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null); // {variantName, option}

  const viewAddedRef = useRef(false);

  const [addView] = useAddViewMutation();
  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId, {
    skip: !productId || productId === "undefined",
  });

  // Related products (same category, exclude current)
  const { data: relatedData } = useGetProductsQuery(
    {
      category: product?.category?._id,
      exclude: productId,
      pageNumber: 1,
    },
    { skip: !product?.category?._id }
  );

  /* ---------------- ADD VIEW (ONCE) ---------------- */
  useEffect(() => {
    if (!product?._id || product._id === "undefined" || viewAddedRef.current) return;

    const incrementView = async () => {
      try {
        await addView({
          productId: product._id,
          deviceId: "mobile_user",
        }).unwrap();
        viewAddedRef.current = true;
      } catch (err) {
        console.log("View error detail:", err);
      }
    };

    incrementView();
  }, [product, addView]);

  // Reset variant selection when product changes
  useEffect(() => {
    setSelectedVariant(null);
  }, [productId]);

  /* ---------------- GUARDS ---------------- */
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ProductDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Message variant={error ? "error" : "info"}>
          {error?.data?.message || "Product not found"}
        </Message>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorBackBtn}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ---------------- VARIANT HELPERS ---------------- */
  const hasVariants = product.variants && product.variants.length > 0;

  // Determine the effective price considering selected variant
  const effectivePrice =
    selectedVariant?.option?.price > 0
      ? selectedVariant.option.price
      : product.price;

  /* ---------------- HANDLERS ---------------- */
  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      Toast.show({
        type: "error",
        text1: "Select a variant",
        text2: "Please select a product option before adding to cart.",
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(
      addToCart({
        ...product,
        price: effectivePrice,
        qty,
        selectedVariant: selectedVariant || null,
      })
    );
    Toast.show({
      type: "success",
      text1: t("product.addToCart"),
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

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* TOP NAVIGATION */}
        <View style={styles.topNavigation}>
          <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
            <Ionicons name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>
          <View style={{ width: 45 }} /> 
        </View>

        {/* IMAGE SECTION */}
        <View style={styles.imageWrapper}>
          <ProductImageCard imageUrl={product.image || ""} />
        </View>

        {/* CONTENT SECTION */}
        <View style={styles.detailsWrapper}>
          <ProductDetailsCard
            product={product}
            qty={qty}
            setQty={setQty}
            handleAddToCart={handleAddToCart}
            disableAddToCart={product.countInStock === 0}
            hideButton={true} 
          />

          {/* ─── VARIANT SELECTOR ────────────────────────────────────── */}
          {hasVariants && (
            <View style={styles.variantSection}>
              {product.variants.map((variant) => (
                <View key={variant.name} style={styles.variantGroup}>
                  <Text style={styles.variantGroupLabel}>
                    {t("product.selectVariant")}: <Text style={styles.variantGroupName}>{variant.name}</Text>
                  </Text>
                  <View style={styles.variantOptions}>
                    {variant.options.map((option) => {
                      const isSelected =
                        selectedVariant?.variantName === variant.name &&
                        selectedVariant?.option?.label === option.label;
                      return (
                        <TouchableOpacity
                          key={option.label}
                          style={[
                            styles.variantChip,
                            isSelected && styles.variantChipSelected,
                            option.stock === 0 && styles.variantChipOutOfStock,
                          ]}
                          onPress={() => {
                            if (option.stock === 0) return;
                            Haptics.selectionAsync();
                            setSelectedVariant(
                              isSelected ? null : { variantName: variant.name, option }
                            );
                          }}
                          disabled={option.stock === 0}
                        >
                          <Text
                            style={[
                              styles.variantChipText,
                              isSelected && styles.variantChipTextSelected,
                              option.stock === 0 && styles.variantChipTextOutOfStock,
                            ]}
                          >
                            {option.label}
                          </Text>
                          {option.price > 0 && option.price !== product.price && (
                            <Text style={[styles.variantChipPrice, isSelected && styles.variantChipTextSelected]}>
                              {" "}+{(option.price - product.price).toFixed(0)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <ProductReviewSection
            reviews={product.reviews || []}
            userInfo={userInfo}
            onAddReviewPress={() => setIsReviewModalOpen(true)}
          />

          {/* ─── RELATED PRODUCTS ────────────────────────────────────── */}
          {relatedData?.products?.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>{t("product.moreFromCategory")}</Text>
              <FlatList
                data={relatedData.products.slice(0, 6)}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.relatedCard}
                    onPress={() =>
                      router.push({ pathname: "(screens)/ProductScreen", params: { productId: item._id } })
                    }
                  >
                    <ProductCard product={item} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ gap: 10 }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* STICKY BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>{t("product.totalPrice")}</Text>
          <Text style={styles.totalPrice}>
            ${(effectivePrice * qty).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.mainBtn,
            product.countInStock === 0 && styles.disabledBtn,
          ]}
          onPress={handleAddToCart}
          disabled={product.countInStock === 0}
        >
          <Ionicons name="bag-add-outline" size={22} color="#FFF" />
          <Text style={styles.mainBtnText}>
            {product.countInStock === 0 ? t("product.outOfStock") : t("product.addToCart")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* REVIEW MODAL */}
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
    backgroundColor: "#FFF",
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 10,
    paddingBottom: 10,
    backgroundColor: "#F9F9F9",
  },
  roundBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  imageWrapper: {
    backgroundColor: "#F9F9F9",
    height: 350,
    justifyContent: 'center',
    marginTop: -10,
  },
  detailsWrapper: {
    paddingHorizontal: 20,
    marginTop: -35,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 30,
    minHeight: 400,
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginVertical: 25,
  },
  // ─── Variant Selector ───────────────────────────────────────────────
  variantSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  variantGroup: {
    marginBottom: 14,
  },
  variantGroupLabel: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  variantGroupName: {
    color: Colors.primary,
  },
  variantOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantChip: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  variantChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "15",
  },
  variantChipOutOfStock: {
    opacity: 0.4,
    borderColor: "#E0E0E0",
  },
  variantChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  variantChipTextSelected: {
    color: Colors.primary,
  },
  variantChipTextOutOfStock: {
    color: "#999",
  },
  variantChipPrice: {
    fontSize: 11,
    color: "#666",
  },
  // ─── Related Products ────────────────────────────────────────────────
  relatedSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  relatedCard: {
    width: 150,
  },
  // ─── Bottom Bar ──────────────────────────────────────────────────────
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 35 : 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    alignItems: "center",
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.primary,
  },
  mainBtn: {
    flex: 1.8,
    backgroundColor: Colors.primary,
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  mainBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledBtn: {
    backgroundColor: "#E0E0E0",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  errorBackBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  backText: {
    color: "#FFF",
    fontWeight: "600",
  },
});