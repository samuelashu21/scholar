import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather"; // Added for the camera icon
import { Colors } from "../constants/Utils";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../constants/Urls";
import { useGetCategoriesQuery } from "../slices/categoryApiSlice";

const { width } = Dimensions.get("window");

const Header = () => {
  const router = useRouter();
  const { category: activeCategoryId = "" } = useLocalSearchParams();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const getCategoryImage = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  const openSearchPage = () => {
    router.push("/(screens)/SearchPage");
  };

  const handleCategoryPress = (categoryId) => {
    router.setParams({ category: categoryId, keyword: "", pageNumber: "1" });
  };

  // --- Carousel Logic ---
  const images = [
    "https://previews.123rf.com/images/eyesee10/eyesee101104/eyesee10110400087/9320010-laptops.jpg",
    "https://previews.123rf.com/images/alfazetchronicles/alfazetchronicles2307/alfazetchronicles230724314/232592669-rows-of-wigs-on-mannequin-heads-various-styles-created-with-generative-ai.jpg",
    "https://previews.123rf.com/images/9george/9george1402/9george140200136/25908425-folded-old-blue-jeans-isolated-on-a-white-clipping-path-included.jpg",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.headerContainer}>
      
      {/* 1. ALIEXPRESS TOP BAR: LOGO & CART */}
      <View style={styles.topActionRow}>
        <Image 
          source={require("../assets/images/logo.png")} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        
        <TouchableOpacity 
          onPress={() => router.push("(screens)/Cart")} 
          style={styles.cartBtn}
        >
          <Ionicons name="cart-outline" size={30} color="#333" />
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 2. ALIEXPRESS SEARCH BAR UI */}
      <View style={styles.searchSection}>
        <TouchableOpacity 
          style={styles.searchBarWrapper} 
          activeOpacity={0.9} 
          onPress={openSearchPage}
        >
          <View style={styles.searchInner}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <Text style={styles.placeholderText}>I'm shopping for...</Text>
          </View>
          
          <View style={styles.searchRightActions}>
            <Feather name="camera" size={20} color="#666" style={{ marginRight: 15 }} />
            <TouchableOpacity style={styles.searchSubmitBtn} onPress={openSearchPage}>
              <Text style={styles.searchSubmitText}>Search</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. QUICK NAV (TEXT CATEGORIES) */}
      <View style={styles.textNavSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => handleCategoryPress("")} style={styles.textNavItem}>
            <Text style={[styles.navText, !activeCategoryId && styles.activeNavText]}>Featured</Text>
            {!activeCategoryId && <View style={styles.activeLine} />}
          </TouchableOpacity>
          {categories?.map((cat) => (
            <TouchableOpacity 
              key={cat._id} 
              onPress={() => handleCategoryPress(cat._id)} 
              style={styles.textNavItem}
            >
              <Text style={[styles.navText, activeCategoryId === cat._id && styles.activeNavText]}>
                {cat.categoryname}
              </Text>
              {activeCategoryId === cat._id && <View style={styles.activeLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. USER GREETING & PROMO */}
      <View style={styles.promoSection}>
        {/* <View style={styles.welcomeInfo}>
          <Text style={styles.welcomeText}>
            {userInfo ? `Hi, ${userInfo.FirstName || userInfo.name || "User"} 👋` : "Welcome 👋"}
          </Text>
          <Text style={styles.subWelcome}>Find your style today</Text>
        </View> */}

        <View style={styles.specialCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.specialTitle}>Exclusive Deals 🎁</Text>
            <Text style={styles.specialSub}>Up to 50% off on your first order</Text>
          </View>
          <TouchableOpacity style={styles.exploreBtn}>
            <Text style={styles.exploreBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. CAROUSEL */} 
      <View style={styles.carouselContainer}>
        <Image source={{ uri: images[currentIndex] }} style={styles.carouselImage} />
        <View style={styles.dotContainer}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
          ))}
        </View>
      </View>

      {/* 6. VISUAL CATEGORY CARDS */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => router.push("/screens/MoreOffers")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {categoriesLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 15 }}>
            {categories?.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={styles.catCard}
                onPress={() => handleCategoryPress(cat._id)}
              >
                <View style={[styles.imgWrapper, activeCategoryId === cat._id && styles.activeImgWrapper]}>
                  <Image source={{ uri: getCategoryImage(cat.image) }} style={styles.catImg} />
                </View>
                <Text style={styles.catLabel} numberOfLines={1}>{cat.categoryname}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: { 
    backgroundColor: "#fff", 
    paddingBottom: 15,
    // Added padding at the top of the whole container to lower everything
    paddingTop: Platform.OS === 'ios' ? 10 : 5, 
  },
  // Top Action Row
  topActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 20,
    marginBottom: 5,
  },
  logo: { width: 110, height: 40 },
  cartBtn: { padding: 5 },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#FF4747",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

  // Search Bar Section
  searchSection: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  searchBarWrapper: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF4747",
    overflow: "hidden",
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingLeft: 15,
  },
  searchIcon: { marginRight: 10 },
  placeholderText: { fontSize: 14, color: "#999" },
  searchRightActions: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  searchSubmitBtn: {
    backgroundColor: "#FF4747",
    height: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  searchSubmitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Text Nav
  textNavSection: { borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  textNavItem: { paddingHorizontal: 15, paddingVertical: 12, alignItems: "center" },
  navText: { fontSize: 14, color: "#777", fontWeight: "500" },
  activeNavText: { color: "#FF4747", fontWeight: "bold" },
  activeLine: { height: 3, width: 22, backgroundColor: "#FF4747", marginTop: 4, borderRadius: 2 },

  // Promo & Welcome
  promoSection: { paddingHorizontal: 15, marginTop: 15 },
  welcomeInfo: { marginBottom: 15 },
  welcomeText: { fontSize: 15, fontWeight: "800", color: "#1a1a1a" },
  subWelcome: { fontSize: 13, color: "#888" },
  specialCard: {
    backgroundColor: "#FFF8F8",
    padding: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  specialTitle: { fontSize: 16, fontWeight: "bold", color: "#E60000" },
  specialSub: { fontSize: 12, color: "#666", marginTop: 2 },
  exploreBtn: { backgroundColor: "#FF4747", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  exploreBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  // Carousel
  carouselContainer: { marginHorizontal: 15, marginTop: 20, borderRadius: 15, overflow: "hidden", height: 160, elevation: 3 },
  carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
  dotContainer: { position: "absolute", bottom: 10, alignSelf: "center", flexDirection: "row" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)", marginHorizontal: 3 },
  activeDot: { backgroundColor: "#fff", width: 16 },

  // Category visual section
  categorySection: { marginTop: 25 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
  seeAll: { color: "#FF4747", fontWeight: "600" },
  catCard: { marginRight: 15, alignItems: "center", width: 75 },
  imgWrapper: { 
    width: 65, 
    height: 65, 
    borderRadius: 32.5, 
    backgroundColor: "#F9F9F9", 
    padding: 10, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0"
  },
  activeImgWrapper: { borderColor: "#FF4747", backgroundColor: "#FFF0F0" },
  catImg: { width: "100%", height: "100%", resizeMode: "contain" }, 
  catLabel: { fontSize: 12, color: "#444", fontWeight: "500", textAlign: "center" },
});

export default Header; 