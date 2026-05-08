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
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useAddViewMutation,
  useGetProductsQuery,
  useGetPopularProductsQuery,
  useGetRecentlyViewedProductsQuery,
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
import ProductCard from "../../components/ProductCard";

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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);

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
  const { data: moreFromCategory } = useGetProductsQuery(
    {
      category: product?.category?._id || product?.category,
      exclude: product?._id,
      limit: 6,
    },
    { skip: !product?._id || !(product?.category?._id || product?.category) }
  );
  const { data: popularProducts } = useGetPopularProductsQuery(10);
  const { data: recentlyViewedProducts } = useGetRecentlyViewedProductsQuery(recentlyViewedIds, {
    skip: !recentlyViewedIds.length,
  });

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

  useEffect(() => {
    if (!product?.variants?.length) return;
    const firstVariant = product.variants[0];
    const firstOption = firstVariant?.options?.[0];
    if (firstOption) {
      setSelectedVariant({
        name: firstVariant.name,
        label: firstOption.label,
        sku: firstOption.sku,
        stock: firstOption.stock,
        price: firstOption.price,
      });
    }
  }, [product?.variants]);

  useEffect(() => {
    const availableStock = selectedVariant?.stock ?? product?.countInStock ?? 0;
    if (qty > availableStock && availableStock > 0) {
      setQty(1);
    }
  }, [selectedVariant, product?.countInStock, qty]);

  useEffect(() => {
    const persistRecent = async () => {
      if (!product?._id) return;
      const raw = await AsyncStorage.getItem("recentlyViewedProductIds");
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [product._id, ...existing.filter((id) => id !== product._id)].slice(0, 15);
      await AsyncStorage.setItem("recentlyViewedProductIds", JSON.stringify(updated));
      setRecentlyViewedIds(updated);
    };

    persistRecent();
  }, [product?._id]);

  /* ---------------- GUARDS ---------------- */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
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

  /* ---------------- HANDLERS ---------------- */
  const handleAddToCart = () => {
    const variantPrice = selectedVariant?.price ? Number(selectedVariant.price) : null;
    const resolvedUnitPrice = variantPrice && variantPrice > 0 ? variantPrice : product.price;
    dispatch(
      addToCart({
        ...product,
        price: resolvedUnitPrice,
        selectedVariant,
        qty,
      })
    );
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

  /* ---------------- UI ---------------- */
  const availableStock = selectedVariant?.stock ?? product.countInStock;
  const resolvedUnitPrice =
    selectedVariant?.price && selectedVariant.price > 0 ? selectedVariant.price : product.price;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* NON-STICKY TOP NAVIGATION (Moves with scroll) */}
        <View style={styles.topNavigation}>
          <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
            <Ionicons name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>
          {/* Add a placeholder or other icons here if needed */}
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
            disableAddToCart={availableStock === 0}
            maxQty={availableStock}
            hideButton={true} 
          />

          <View style={styles.divider} />

          {product.variants?.length ? (
            <View style={styles.variantSection}>
              <Text style={styles.variantTitle}>Select Variant</Text>
              {product.variants.map((variant) => (
                <View key={variant.name} style={styles.variantGroup}>
                  <Text style={styles.variantGroupTitle}>{variant.name}</Text>
                  <View style={styles.variantOptionsRow}>
                    {(variant.options || []).map((option) => {
                      const selected =
                        selectedVariant?.name === variant.name &&
                        selectedVariant?.label === option.label;
                      return (
                        <TouchableOpacity
                          key={`${variant.name}-${option.label}`}
                          style={[styles.variantOption, selected && styles.variantOptionSelected]}
                          onPress={() =>
                            setSelectedVariant({
                              name: variant.name,
                              label: option.label,
                              sku: option.sku,
                              stock: option.stock,
                              price: option.price,
                            })
                          }
                        >
                          <Text style={[styles.variantOptionText, selected && styles.variantOptionTextSelected]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.divider} />

          <ProductReviewSection
            reviews={product.reviews || []}
            userInfo={userInfo}
            onAddReviewPress={() => setIsReviewModalOpen(true)}
          />

          {moreFromCategory?.products?.length ? (
            <View style={styles.recoSection}>
              <Text style={styles.recoTitle}>More from this category</Text>
              {moreFromCategory.products.slice(0, 6).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </View>
          ) : null}

          {popularProducts?.length ? (
            <View style={styles.recoSection}>
              <Text style={styles.recoTitle}>Popular picks</Text>
              {popularProducts.slice(0, 4).map((item) => (
                <ProductCard key={`popular-${item._id}`} product={item} />
              ))}
            </View>
          ) : null}

          {recentlyViewedProducts?.length ? (
            <View style={styles.recoSection}>
              <Text style={styles.recoTitle}>Recently viewed</Text>
              {recentlyViewedProducts
                .filter((item) => item._id !== product._id)
                .slice(0, 4)
                .map((item) => (
                  <ProductCard key={`recent-${item._id}`} product={item} />
                ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* STICKY BOTTOM ACTION BAR (Stays fixed) */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            ${(resolvedUnitPrice * qty).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.mainBtn,
            availableStock === 0 && styles.disabledBtn,
          ]}
          onPress={handleAddToCart}
          disabled={availableStock === 0}
        >
          <Ionicons name="bag-add-outline" size={22} color="#FFF" />
          <Text style={styles.mainBtnText}>
            {availableStock === 0 ? "Out of Stock" : "Add to Cart"}
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
    // Note: No absolute positioning here so it scrolls away
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 10,
    paddingBottom: 10,
    backgroundColor: "#F9F9F9", // Match image background
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
    paddingBottom: 120, // Space for bottom bar
  },
  imageWrapper: {
    backgroundColor: "#F9F9F9",
    height: 350,
    justifyContent: 'center',
    marginTop: -10, // Slight overlap for design
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
  variantSection: {
    marginBottom: 20,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 12,
  },
  variantGroup: {
    marginBottom: 10,
  },
  variantGroupTitle: {
    fontSize: 13,
    color: "#6C757D",
    marginBottom: 8,
  },
  variantOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantOption: {
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFF",
  },
  variantOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#F0F4FF",
  },
  variantOptionText: {
    color: "#495057",
    fontSize: 12,
    fontWeight: "600",
  },
  variantOptionTextSelected: {
    color: Colors.primary,
  },
  recoSection: {
    marginTop: 10,
  },
  recoTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1A1A1A",
  },
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
