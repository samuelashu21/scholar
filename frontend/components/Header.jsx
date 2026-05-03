// import React, { useState, useEffect, useMemo, useRef } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Platform,
//   Dimensions,
// } from "react-native";
// import { useSelector } from "react-redux";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import Feather from "@expo/vector-icons/Feather";
// import { Colors } from "../constants/Utils";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { BASE_URL } from "../constants/Urls";
// import { useGetCategoriesQuery } from "../slices/categoryApiSlice";
// import { useGetBannerProductsQuery } from "../slices/productsApiSlice";

// const { width } = Dimensions.get("window");
// const BANNER_WIDTH = width - 30; // 15 + 15 horizontal margin

// const Header = () => {
//   const router = useRouter();
//   const { category: activeCategoryId = "" } = useLocalSearchParams();
//   const { cartItems } = useSelector((state) => state.cart);
//   const { userInfo } = useSelector((state) => state.auth);

//   const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();
//   const { data: bannerProducts = [], isLoading: bannerLoading } = useGetBannerProductsQuery(6);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const carouselRef = useRef(null);

//   const getCategoryImage = (imagePath) => {
//     if (!imagePath) return null;
//     if (imagePath.startsWith("http")) return imagePath;
//     return `${BASE_URL}${imagePath}`;
//   };

//   const getProductImage = (imagePath) => {
//     if (!imagePath) return null;
//     if (imagePath.startsWith("http")) return imagePath;
//     return `${BASE_URL}${imagePath}`;
//   };

//   const openSearchPage = () => {
//     router.push("/(screens)/SearchPage");
//   };

//   const handleCategoryPress = (categoryId) => {
//     router.setParams({ category: categoryId, keyword: "", pageNumber: "1" });
//   };

//   // No static fallback
//   const images = useMemo(() => {
//     return (bannerProducts || [])
//       .map((p) => getProductImage(p.image))
//       .filter(Boolean);
//   }, [bannerProducts]);

//   // Keep index in bounds if list changes
//   useEffect(() => {
//     if (currentIndex >= images.length) {
//       setCurrentIndex(0);
//       if (carouselRef.current && images.length > 0) {
//         carouselRef.current.scrollTo({ x: 0, animated: false });
//       }
//     }
//   }, [images.length, currentIndex]);

//   // Auto-slide + horizontal paging sync
//   useEffect(() => {
//     if (images.length <= 1) return;
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => {
//         const next = prev === images.length - 1 ? 0 : prev + 1;
//         if (carouselRef.current) {
//           carouselRef.current.scrollTo({ x: next * BANNER_WIDTH, animated: true });
//         }
//         return next;
//       });
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [images.length]);

//   const currentBannerProduct = bannerProducts?.[currentIndex];

//   return (
//     <View style={styles.headerContainer}>
//       <View style={styles.topActionRow}>
//         <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
//         <TouchableOpacity onPress={() => router.push("(screens)/Cart")} style={styles.cartBtn}>
//           <Ionicons name="cart-outline" size={30} color="#333" />
//           {cartItems.length > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>{cartItems.length}</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       <View style={styles.searchSection}>
//         <TouchableOpacity style={styles.searchBarWrapper} activeOpacity={0.9} onPress={openSearchPage}>
//           <View style={styles.searchInner}>
//             <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
//             <Text style={styles.placeholderText}>I'm shopping for...</Text>
//           </View>
//           <View style={styles.searchRightActions}>
//             <Feather name="camera" size={20} color="#666" style={{ marginRight: 15 }} />
//             <TouchableOpacity style={styles.searchSubmitBtn} onPress={openSearchPage}>
//               <Text style={styles.searchSubmitText}>Search</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.textNavSection}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           <TouchableOpacity onPress={() => handleCategoryPress("")} style={styles.textNavItem}>
//             <Text style={[styles.navText, !activeCategoryId && styles.activeNavText]}>Featured</Text>
//             {!activeCategoryId && <View style={styles.activeLine} />}
//           </TouchableOpacity>
//           {categories?.map((cat) => (
//             <TouchableOpacity key={cat._id} onPress={() => handleCategoryPress(cat._id)} style={styles.textNavItem}>
//               <Text style={[styles.navText, activeCategoryId === cat._id && styles.activeNavText]}>
//                 {cat.categoryname}
//               </Text>
//               {activeCategoryId === cat._id && <View style={styles.activeLine} />}
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       <View style={styles.promoSection}>
//         <View style={styles.specialCard}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.specialTitle}>
//               {userInfo?.name ? `Hi ${userInfo.name.split(" ")[0]} 👋` : "Exclusive Deals 🎁"}
//             </Text>
//             <Text style={styles.specialSub}>
//               {currentBannerProduct?.name
//                 ? `${currentBannerProduct.name} • Limited offer`
//                 : "No boosted products right now"}
//             </Text>
//           </View>
//           <TouchableOpacity
//             style={styles.exploreBtn}
//             onPress={() => {
//               if (currentBannerProduct?._id) {
//                 router.push({ pathname: "/(screens)/ProductScreen", params: { productId: currentBannerProduct._id } });
//               } else {
//                 router.push("/(screens)/SearchPage");
//               }
//             }}
//           >
//             <Text style={styles.exploreBtnText}>Shop Now</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.carouselContainer}>
//         {bannerLoading ? (
//           <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
//         ) : images.length === 0 ? (
//           <View style={styles.emptyBannerWrap}>
//             <Text style={styles.emptyBannerText}>No boosted products available</Text>
//           </View>
//         ) : (
//           <ScrollView
//             ref={carouselRef}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             onMomentumScrollEnd={(e) => {
//               const i = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
//               setCurrentIndex(i);
//             }}
//           >
//             {images.map((uri, i) => (
//               <TouchableOpacity
//                 key={i}
//                 activeOpacity={0.9}
//                 style={{ width: BANNER_WIDTH, height: 160 }}
//                 onPress={() => {
//                   const item = bannerProducts[i];
//                   if (item?._id) {
//                     router.push({
//                       pathname: "/(screens)/ProductScreen",
//                       params: { productId: item._id },
//                     });
//                   }
//                 }}
//               >
//                 <Image source={{ uri }} style={styles.carouselImage} />
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         )}

//         {images.length > 0 && (
//           <View style={styles.dotContainer}>
//             {images.map((_, i) => (
//               <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
//             ))}
//           </View>
//         )}
//       </View>

//       <View style={styles.categorySection}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>Shop by Category</Text>
//           <TouchableOpacity onPress={() => router.push("/screens/MoreOffers")}>
//             <Text style={styles.seeAll}>See All</Text>
//           </TouchableOpacity>
//         </View>

//         {categoriesLoading ? (
//           <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} />
//         ) : (
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 15 }}>
//             {categories?.map((cat) => (
//               <TouchableOpacity key={cat._id} style={styles.catCard} onPress={() => handleCategoryPress(cat._id)}>
//                 <View style={[styles.imgWrapper, activeCategoryId === cat._id && styles.activeImgWrapper]}>
//                   <Image source={{ uri: getCategoryImage(cat.image) }} style={styles.catImg} />
//                 </View>
//                 <Text style={styles.catLabel} numberOfLines={1}>{cat.categoryname}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   headerContainer: { backgroundColor: "#fff", paddingBottom: 15, paddingTop: Platform.OS === "ios" ? 10 : 5 },
//   topActionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingTop: 20, marginBottom: 5 },
//   logo: { width: 110, height: 40 },
//   cartBtn: { padding: 5 },
//   badge: { position: "absolute", right: -2, top: -2, backgroundColor: "#FF4747", borderRadius: 10, width: 18, height: 18, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#fff" },
//   badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
//   searchSection: { paddingHorizontal: 15, marginVertical: 10 },
//   searchBarWrapper: { flexDirection: "row", backgroundColor: "#fff", height: 44, borderRadius: 22, alignItems: "center", borderWidth: 2, borderColor: "#FF4747", overflow: "hidden" },
//   searchInner: { flexDirection: "row", alignItems: "center", flex: 1, paddingLeft: 15 },
//   searchIcon: { marginRight: 10 },
//   placeholderText: { fontSize: 14, color: "#999" },
//   searchRightActions: { flexDirection: "row", alignItems: "center", height: "100%" },
//   searchSubmitBtn: { backgroundColor: "#FF4747", height: "100%", paddingHorizontal: 20, justifyContent: "center" },
//   searchSubmitText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
//   textNavSection: { borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
//   textNavItem: { paddingHorizontal: 15, paddingVertical: 12, alignItems: "center" },
//   navText: { fontSize: 14, color: "#777", fontWeight: "500" },
//   activeNavText: { color: "#FF4747", fontWeight: "bold" },
//   activeLine: { height: 3, width: 22, backgroundColor: "#FF4747", marginTop: 4, borderRadius: 2 },
//   promoSection: { paddingHorizontal: 15, marginTop: 15 },
//   specialCard: { backgroundColor: "#FFF8F8", padding: 15, borderRadius: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#FFE0E0" },
//   specialTitle: { fontSize: 16, fontWeight: "bold", color: "#E60000" },
//   specialSub: { fontSize: 12, color: "#666", marginTop: 2 },
//   exploreBtn: { backgroundColor: "#FF4747", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
//   exploreBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
//   carouselContainer: { marginHorizontal: 15, marginTop: 20, borderRadius: 15, overflow: "hidden", height: 160, elevation: 3, backgroundColor: "#fafafa" },
//   carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
//   emptyBannerWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
//   emptyBannerText: { color: "#999", fontWeight: "600" },
//   dotContainer: { position: "absolute", bottom: 10, alignSelf: "center", flexDirection: "row" },
//   dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)", marginHorizontal: 3 },
//   activeDot: { backgroundColor: "#fff", width: 16 },
//   categorySection: { marginTop: 25 },
//   sectionHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, marginBottom: 15 },
//   sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
//   seeAll: { color: "#FF4747", fontWeight: "600" },
//   catCard: { marginRight: 15, alignItems: "center", width: 75 },
//   imgWrapper: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: "#F9F9F9", padding: 10, marginBottom: 8, borderWidth: 1, borderColor: "#F0F0F0" },
//   activeImgWrapper: { borderColor: "#FF4747", backgroundColor: "#FFF0F0" },
//   catImg: { width: "100%", height: "100%", resizeMode: "contain" },
//   catLabel: { fontSize: 12, color: "#444", fontWeight: "500", textAlign: "center" },
// });

// export default Header;


import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "../constants/Utils";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../constants/Urls";
import { useGetCategoriesQuery } from "../slices/categoryApiSlice";
import { useGetBannerProductsQuery } from "../slices/productsApiSlice";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width; // ✅ full screen width

const Header = () => {
  const router = useRouter();
  const { category: activeCategoryId = "" } = useLocalSearchParams();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: bannerProducts = [], isLoading: bannerLoading } = useGetBannerProductsQuery(6);

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const getCategoryImage = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  const getProductImage = (imagePath) => {
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

  const images = useMemo(() => {
    return (bannerProducts || [])
      .map((p) => getProductImage(p.image))
      .filter(Boolean);
  }, [bannerProducts]);

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
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const currentBannerProduct = bannerProducts?.[currentIndex];

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topActionRow}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={() => router.push("(screens)/Cart")} style={styles.cartBtn}>
          <Ionicons name="cart-outline" size={30} color="#333" />
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <TouchableOpacity style={styles.searchBarWrapper} activeOpacity={0.9} onPress={openSearchPage}>
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

      <View style={styles.textNavSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => handleCategoryPress("")} style={styles.textNavItem}>
            <Text style={[styles.navText, !activeCategoryId && styles.activeNavText]}>Featured</Text>
            {!activeCategoryId && <View style={styles.activeLine} />}
          </TouchableOpacity>
          {categories?.map((cat) => (
            <TouchableOpacity key={cat._id} onPress={() => handleCategoryPress(cat._id)} style={styles.textNavItem}>
              <Text style={[styles.navText, activeCategoryId === cat._id && styles.activeNavText]}>
                {cat.categoryname}
              </Text>
              {activeCategoryId === cat._id && <View style={styles.activeLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.promoSection}>
        <View style={styles.specialCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.specialTitle}>
              {userInfo?.name ? `Hi ${userInfo.name.split(" ")[0]} 👋` : "Exclusive Deals 🎁"}
            </Text>
            <Text style={styles.specialSub}>
              {currentBannerProduct?.name
                ? `${currentBannerProduct.name} • Limited offer`
                : "No boosted products right now"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => {
              if (currentBannerProduct?._id) {
                router.push({
                  pathname: "/(screens)/ProductScreen",
                  params: { productId: currentBannerProduct._id },
                });
              } else {
                router.push("/(screens)/SearchPage");
              }
            }}
          >
            <Text style={styles.exploreBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.carouselContainer}>
        {bannerLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : images.length === 0 ? (
          <View style={styles.emptyBannerWrap}>
            <Text style={styles.emptyBannerText}>No boosted products available</Text>
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
                style={{ width: BANNER_WIDTH, height: 160 }}
                onPress={() => {
                  const item = bannerProducts[i];
                  if (item?._id) {
                    router.push({
                      pathname: "/(screens)/ProductScreen",
                      params: { productId: item._id },
                    });
                  }
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
              <TouchableOpacity key={cat._id} style={styles.catCard} onPress={() => handleCategoryPress(cat._id)}>
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
  headerContainer: { backgroundColor: "#fff", paddingBottom: 15, paddingTop: Platform.OS === "ios" ? 10 : 5 },
  topActionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingTop: 20, marginBottom: 5 },
  logo: { width: 110, height: 40 },
  cartBtn: { padding: 5 },
  badge: { position: "absolute", right: -2, top: -2, backgroundColor: "#FF4747", borderRadius: 10, width: 18, height: 18, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#fff" },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  searchSection: { paddingHorizontal: 15, marginVertical: 10 },
  searchBarWrapper: { flexDirection: "row", backgroundColor: "#fff", height: 44, borderRadius: 22, alignItems: "center", borderWidth: 2, borderColor: "#FF4747", overflow: "hidden" },
  searchInner: { flexDirection: "row", alignItems: "center", flex: 1, paddingLeft: 15 },
  searchIcon: { marginRight: 10 },
  placeholderText: { fontSize: 14, color: "#999" },
  searchRightActions: { flexDirection: "row", alignItems: "center", height: "100%" },
  searchSubmitBtn: { backgroundColor: "#FF4747", height: "100%", paddingHorizontal: 20, justifyContent: "center" },
  searchSubmitText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  textNavSection: { borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  textNavItem: { paddingHorizontal: 15, paddingVertical: 12, alignItems: "center" },
  navText: { fontSize: 14, color: "#777", fontWeight: "500" },
  activeNavText: { color: "#FF4747", fontWeight: "bold" },
  activeLine: { height: 3, width: 22, backgroundColor: "#FF4747", marginTop: 4, borderRadius: 2 },
  promoSection: { paddingHorizontal: 15, marginTop: 15 },
  specialCard: { backgroundColor: "#FFF8F8", padding: 15, borderRadius: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#FFE0E0" },
  specialTitle: { fontSize: 16, fontWeight: "bold", color: "#E60000" },
  specialSub: { fontSize: 12, color: "#666", marginTop: 2 },
  exploreBtn: { backgroundColor: "#FF4747", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  exploreBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  carouselContainer: {
    marginHorizontal: 0, // ✅ full width
    marginTop: 20,
    borderRadius: 0,     // optional full-bleed
    overflow: "hidden",
    height: 160,
    elevation: 3,
    backgroundColor: "#fafafa",
  },
  carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
  emptyBannerWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyBannerText: { color: "#999", fontWeight: "600" },
  dotContainer: { position: "absolute", bottom: 10, alignSelf: "center", flexDirection: "row" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)", marginHorizontal: 3 },
  activeDot: { backgroundColor: "#fff", width: 16 },

  categorySection: { marginTop: 25 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
  seeAll: { color: "#FF4747", fontWeight: "600" },
  catCard: { marginRight: 15, alignItems: "center", width: 75 },
  imgWrapper: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: "#F9F9F9", padding: 10, marginBottom: 8, borderWidth: 1, borderColor: "#F0F0F0" },
  activeImgWrapper: { borderColor: "#FF4747", backgroundColor: "#FFF0F0" },
  catImg: { width: "100%", height: "100%", resizeMode: "contain" },
  catLabel: { fontSize: 12, color: "#444", fontWeight: "500", textAlign: "center" },
});

export default Header;