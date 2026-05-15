import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { Colors, Radius, Shadows, Spacing, Typography } from "../constants/Utils";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../constants/Urls";
import { useGetCategoriesQuery } from "../slices/categoryApiSlice";
import { useGetBannerProductsQuery } from "../slices/productsApiSlice";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - Spacing.screen * 2;

const Header = () => {
  const router = useRouter();
  const { category: activeCategoryId = "" } = useLocalSearchParams();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: bannerProducts = [], isLoading: bannerLoading } = useGetBannerProductsQuery(6);

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const getImage = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const openSearchPage = () => router.push("/(screens)/SearchPage");

  const handleCategoryPress = (categoryId) => {
    router.setParams({ category: categoryId, keyword: "", pageNumber: "1" });
  };

  const images = useMemo(
    () => (bannerProducts || []).map((p) => getImage(p.image)).filter(Boolean),
    [bannerProducts]
  );

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
      if (carouselRef.current && images.length > 0) {
        carouselRef.current.scrollTo({ x: 0, animated: false });
      }
    }
  }, [images.length, currentIndex]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev === images.length - 1 ? 0 : prev + 1;
        if (carouselRef.current) {
          carouselRef.current.scrollTo({ x: next * BANNER_WIDTH, animated: true });
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [images.length]);

  const currentBannerProduct = bannerProducts?.[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={() => router.push("(screens)/Cart")} style={styles.cartBtn}>
          <Ionicons name="cart-outline" size={24} color={Colors.darkGray} />
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchBar} activeOpacity={0.9} onPress={openSearchPage}>
        <View style={styles.searchLeft}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <Text style={styles.searchText}>Search products, brands, categories...</Text>
        </View>
        <Feather name="camera" size={18} color={Colors.gray} />
      </TouchableOpacity>

      <View style={styles.promoCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.promoTitle}>
            {userInfo?.name ? `Welcome back, ${userInfo.name.split(" ")[0]} 👋` : "Premium picks for you"}
          </Text>
          <Text style={styles.promoSub} numberOfLines={2}>
            {currentBannerProduct?.name
              ? `${currentBannerProduct.name} • Limited stock`
              : "Trending deals updated every day"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.promoBtn}
          onPress={() => {
            if (currentBannerProduct?._id) {
              router.push({
                pathname: "/(screens)/ProductScreen",
                params: { productId: currentBannerProduct._id },
              });
              return;
            }
            openSearchPage();
          }}
        >
          <Text style={styles.promoBtnText}>Shop Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carouselContainer}>
        {bannerLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 52 }} />
        ) : images.length === 0 ? (
          <View style={styles.emptyBannerWrap}>
            <Text style={styles.emptyBannerText}>No promotional items right now</Text>
          </View>
        ) : (
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
              setCurrentIndex(i);
            }}
          >
            {images.map((uri, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                style={styles.bannerItem}
                onPress={() => {
                  const item = bannerProducts[i];
                  if (!item?._id) return;
                  router.push({
                    pathname: "/(screens)/ProductScreen",
                    params: { productId: item._id },
                  });
                }}
              >
                <Image source={{ uri }} style={styles.carouselImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {images.length > 0 && (
          <View style={styles.dotContainer}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured categories</Text>
      </View>

      {categoriesLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.md }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
          <TouchableOpacity
            onPress={() => handleCategoryPress("")}
            style={[styles.categoryChip, !activeCategoryId && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryText, !activeCategoryId && styles.categoryTextActive]}>All</Text>
          </TouchableOpacity>

          {categories?.map((cat) => {
            const isActive = activeCategoryId === cat._id;
            return (
              <TouchableOpacity
                key={cat._id}
                onPress={() => handleCategoryPress(cat._id)}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]} numberOfLines={1}>
                  {cat.categoryname}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.offWhite,
    paddingBottom: Spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
  },
  logo: { width: 104, height: 34 },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.sm,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 3,
    backgroundColor: Colors.primary,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: Typography.weight.bold,
  },
  searchBar: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.pill,
    height: 46,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.sm,
  },
  searchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  searchText: {
    color: Colors.secondaryTextColor,
    fontSize: Typography.size.sm,
  },
  promoCard: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.md,
    backgroundColor: "#1F2937",
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  promoTitle: {
    color: Colors.white,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  promoSub: {
    marginTop: Spacing.xs,
    color: "#E3E8F2",
    fontSize: Typography.size.sm,
  },
  promoBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  promoBtnText: {
    color: Colors.white,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.sm,
  },
  carouselContainer: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    overflow: "hidden",
    height: 176,
    backgroundColor: Colors.surfaceMuted,
    ...Shadows.sm,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: 176,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  emptyBannerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBannerText: {
    color: Colors.secondaryTextColor,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  dotContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: {
    width: 18,
    backgroundColor: Colors.white,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.screen,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.darkGray,
  },
  categoryRail: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.sm,
  },
  categoryChip: {
    backgroundColor: Colors.white,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.darkGray,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  categoryTextActive: {
    color: Colors.white,
  },
});

export default Header;
