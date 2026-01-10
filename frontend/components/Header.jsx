// import {
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
// } from "react-native";

// import React, { useState, useCallback } from "react";

// import Ionicons from "@expo/vector-icons/Ionicons";
// import { Colors } from "../constants/Utils";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { useSelector } from "react-redux";

// const Header = () => {
//   const [searchText, setSearchText] = useState("");

//   const { cartItems } = useSelector((state) => state.cart);
//   const { userInfo } = useSelector((state) => state.auth);

//   const router = useRouter();

//   const { keyword = "" } = useLocalSearchParams();

//   const handleSearch = useCallback(() => {
//     if (searchText.trim().length >= 2 || searchText.trim().length === 0) {
//       router.setParams({
//         keyword: searchText.trim(),
//         pageNumber: "1",
//       });
//     }
//   }, [searchText, router]);

//   const clearSearch = () => {
//     setSearchText("");
//     router.setParams({
//       keyword: "",
//       pageNumber: "1",
//     });
//   };

//   const showAllProducts = () => {
//     setSearchText("");
//     router.setParams({
//       keyword: "",
//       pageNumber: "1",
//     });
//   };

//   const images = [
//   "https://previews.123rf.com/images/eyesee10/eyesee101104/eyesee10110400087/9320010-laptops.jpg",
//   "https://previews.123rf.com/images/alfazetchronicles/alfazetchronicles2307/alfazetchronicles230724314/232592669-rows-of-wigs-on-mannequin-heads-various-styles-created-with-generative-ai.jpg",
//   "https://previews.123rf.com/images/9george/9george1402/9george140200136/25908425-folded-old-blue-jeans-isolated-on-a-white-clipping-path-included.jpg",
// ];
// const imageLinks = [
//   "/screens/Product/123",
//   "/screens/Offers",
//   "/screens/Category/Electronics",
// ];
// const [currentIndex, setCurrentIndex] = useState(0);
// React.useEffect(() => {
//   const interval = setInterval(() => {
//     setCurrentIndex((prev) =>
//       prev === images.length - 1 ? 0 : prev + 1
//     );
//   }, 3000); // changes every 3 seconds

//   return () => clearInterval(interval);
// }, []);

// const horizontalCards = [
//   {
//     title: "Electronics",
//     image: "https://previews.123rf.com/images/elenabsl/elenabsl2302/elenabsl230200083/199296404-electronics-text-and-assorted-floating-devices-technology-and-innovation-concept.jpg",
//     link: "/screens/Category/Electronics",
//   },
//   {
//     title: "Fashion",
//     image: "https://previews.123rf.com/images/zeber/zeber1112/zeber111200055/11439780-silhouette-of-women-with-abstract-background.jpg",
//     link: "/screens/Category/Fashion",
//   },
//   {
//     title: "Beauty and cosmetics",
//     image: "https://previews.123rf.com/images/nastya22/nastya221110/nastya22111000363/11047700-lipsticks-rose-eye-shadows-pencils-nail-polishers-lip-gloss.jpg",
//     link: "/screens/Category/Home",
//   },
// ];

//   return (
//     <View style={styles.headerContainer}>
//       <View style={styles.topRow}>
//         <Image
//           source={require("../assets/images/logo.png")}
//           style={styles.logo}
//         />
//         <TouchableOpacity
//           onPress={() => router.push("(screens)/Cart")}
//           style={styles.cartIconContainer}
//         >
//           <Ionicons name="cart" size={35} color={Colors.primary} />
//           {cartItems.length > 0 && (
//             <View style={styles.cartBadge}>
//               <Text style={styles.cartBadgeText}>
//                 {cartItems.reduce((acc, item) => acc + item.qty, 0)}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       <View style={styles.searchRow}>
//         <View style={styles.searchContainer}>
//           <Ionicons
//             name="search"
//             size={20}
//             color={Colors.primary}
//             style={styles.searchIcon}
//           />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search Products..."
//             value={searchText}
//             onChangeText={setSearchText}
//             placeholderTextColor={Colors.lightGray}
//             returnKeyType="search"
//             onSubmitEditing={handleSearch}
//           />

//           {searchText ? (
//             <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
//               <Ionicons name="close-circle" size={20} color={Colors.primary} />
//             </TouchableOpacity>
//           ) : null}
//         </View>

//         {searchText.length > 0 && (
//           <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//             <Text style={styles.searchButtonText}>Search</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//       {keyword && (
//         <View style={styles.activeFilterRow}>
//           <Text style={styles.filterText}>
//             Showing result for : "{keyword}"
//           </Text>
//           <TouchableOpacity
//             style={styles.showAllButton}
//             onPress={showAllProducts}
//           >
//             <Text style={styles.showAllButtonText}>Show All Products</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <View style={styles.bottomRow}>
//         <Text style={styles.welcomeText}>
//           {userInfo && `Welcome ${userInfo.name.split(" ")[0]} 👋`}
//         </Text>
//       </View>

//           {/* Special Offer Card */}
// <View style={styles.cardContainer}>
//   <Text style={styles.cardTitle}>Special Offers 🎁</Text>
//   <Text style={styles.cardSubtitle}>
//     Check out the latest deals tailored for you!
//   </Text>

//   <TouchableOpacity style={styles.cardButton}>
//     <Text style={styles.cardButtonText}>Explore</Text>
//   </TouchableOpacity>
// </View>

// {/* Sliding Image Carousel Card */}
// <View style={styles.carouselCard}>
//   <TouchableOpacity onPress={() => router.push(imageLinks[currentIndex])}>
//     <Image
//       source={{ uri: images[currentIndex] }}
//       style={styles.carouselImage}
//     />
//   </TouchableOpacity>

//   <View style={styles.carouselDots}>
//     {images.map((_, index) => (
//       <View
//         key={index}
//         style={[
//           styles.dot,
//           currentIndex === index && styles.activeDot,
//         ]}
//       />
//     ))}
//   </View>
// </View>

// {/* Horizontal Swipe Card List */}
// <View style={styles.horizontalCardSection}>
//   <Text style={styles.sectionTitle}>Recommended for You ⭐</Text>

//   <ScrollView
//     horizontal
//     showsHorizontalScrollIndicator={false}
//     style={styles.horizontalScroll}
//   >
//     {horizontalCards.map((card, index) => (
//       <TouchableOpacity
//         key={index}
//         style={styles.horizontalCard}
//         onPress={() => router.push(card.link)}
//       >
//         <Image source={{ uri: card.image }} style={styles.horizontalCardImage} />
//         <Text style={styles.horizontalCardTitle}>{card.title}</Text>
//       </TouchableOpacity>
//     ))}

//     {/* More Button */}
//     <TouchableOpacity
//       onPress={() => router.push("/screens/MoreOffers")}
//       style={styles.moreCard}
//     >
//       <Text style={styles.moreText}>More →</Text>
//     </TouchableOpacity>
//   </ScrollView>
// </View>

//     </View>
//   );
// };

// export default Header;

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: "column",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     backgroundColor: Colors.offWhite,
//     paddingBottom: 10,
//   },
//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   searchRow: {
//     marginBottom: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   logo: {
//     width: 100,
//     height: 60,
//     resizeMode: "contain",
//   },
//   searchContainer: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     height: 40,
//     borderWidth: 1,
//     borderColor: Colors.primary,
//   },
//   searchButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     height: 40,
//     justifyContent: "center",
//   },
//   searchButtonText: {
//     color: Colors.white,
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   searchIcon: {
//     marginRight: 5,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: Colors.black,
//     height: "100%",
//   },
//   clearButton: {
//     padding: 5,
//   },
//   bottomRow: {
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     alignItems: "center",
//   },
//   cartIconContainer: {
//     position: "relative",
//   },
//   cartBadge: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     backgroundColor: Colors.textRed,
//     borderRadius: 20,
//     width: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cartBadgeText: {
//     color: Colors.white,
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   welcomeText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: Colors.primary,
//   },
//   activeFilterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 10,
//     paddingHorizontal: 5,
//   },
//   filterText: {
//     color: Colors.primary,
//     fontSize: 14,
//     fontStyle: "italic",
//   },
//   showAllButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//   },
//   showAllButtonText: {
//     color: Colors.white,
//     fontSize: 12,
//     fontWeight: "600",
//   },

//  cardContainer: {
//   marginTop: 12,
//   backgroundColor: Colors.white,
//   padding: 15,
//   borderRadius: 15,
//   shadowColor: "#000",
//   shadowOffset: { width: 0, height: 2 },
//   shadowOpacity: 0.1,
//   shadowRadius: 4,
//   elevation: 3,
// },
// cardTitle: {
//   fontSize: 16,
//   fontWeight: "bold",
//   color: Colors.primary,
//   marginBottom: 5,
// },
// cardSubtitle: {
//   fontSize: 13,
//   color: Colors.darkGray,
//   marginBottom: 10,
// },
// cardButton: {
//   backgroundColor: Colors.primary,
//   paddingVertical: 8,
//   borderRadius: 10,
//   alignItems: "center",
// },
// cardButtonText: {
//   color: Colors.white,
//   fontSize: 14,
//   fontWeight: "600",
// },

// carouselCard: {
//   marginTop: 15,
//   backgroundColor: Colors.white,
//   borderRadius: 15,
//   overflow: "hidden",
//   elevation: 3,
//   shadowColor: "#000",
//   shadowOpacity: 0.1,
//   shadowRadius: 4,
//   shadowOffset: { width: 0, height: 2 },
// },

// carouselImage: {
//   width: "100%",
//   height: 150,
//   resizeMode: "cover",
// },

// carouselDots: {
//   flexDirection: "row",
//   justifyContent: "center",
//   paddingVertical: 8,
//   backgroundColor: "rgba(0,0,0,0.05)",
// },

// dot: {
//   width: 8,
//   height: 8,
//   borderRadius: 4,
//   backgroundColor: Colors.lightGray,
//   marginHorizontal: 4,
// },

// activeDot: {
//   backgroundColor: Colors.primary,
//   width: 10,
//   height: 10,
// },

// horizontalCardSection: {
//   marginTop: 20,
// },

// sectionTitle: {
//   fontSize: 16,
//   fontWeight: "bold",
//   color: Colors.primary,
//   marginBottom: 10,
// },

// horizontalScroll: {
//   paddingLeft: 5,
// },

// horizontalCard: {
//   width: 130,
//   backgroundColor: Colors.white,
//   borderRadius: 15,
//   marginRight: 12,
//   paddingBottom: 10,
//   overflow: "hidden",
//   elevation: 3,
//   shadowColor: "#000",
//   shadowOpacity: 0.1,
//   shadowRadius: 4,
//   shadowOffset: { width: 0, height: 2 },
// },

// horizontalCardImage: {
//   width: "100%",
//   height: 90,
//   resizeMode: "cover",
// },

// horizontalCardTitle: {
//   textAlign: "center",
//   paddingTop: 8,
//   fontSize: 13,
//   fontWeight: "600",
//   color: Colors.darkGray,
// },

// moreCard: {
//   justifyContent: "center",
//   alignItems: "center",
//   paddingHorizontal: 20,
//   backgroundColor: Colors.primary,
//   borderRadius: 15,
// },

// moreText: {
//   color: Colors.white,
//   fontSize: 15,
//   fontWeight: "700",
// },

// });

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../constants/Utils";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { BASE_URL } from "../constants/Urls";

// Import the category API slice
import { useGetCategoriesQuery } from "../slices/categoryApiSlice";

const Header = () => {
  const router = useRouter();
  const { keyword = "", category: activeCategoryId = "" } =
    useLocalSearchParams();

  const [searchText, setSearchText] = useState("");
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch categories dynamically from database
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  // Helper to handle both full URLs and local server paths
  const getCategoryImage = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };   
 
  // Search Logic
  const handleSearch = useCallback(() => {
    if (searchText.trim().length >= 2 || searchText.trim().length === 0) {
      router.setParams({
        keyword: searchText.trim(),
        category: "", // Clear category filter when searching keywords
        pageNumber: "1",
      });
    }
  }, [searchText, router]);

  // Category Filter Logic
  const handleCategoryPress = (categoryId) => {
    setSearchText(""); // Clear search bar
    router.setParams({
      category: categoryId,
      keyword: "", // Clear keyword when selecting category
      pageNumber: "1",
    });
  };

  const clearSearch = () => {
    setSearchText("");
    router.setParams({ keyword: "", pageNumber: "1" });
  };

  const showAllProducts = () => {
    setSearchText("");
    router.setParams({
      keyword: "",
      category: "",
      pageNumber: "1",
    });
  };

  // --- Static Carousel Data ---
  const images = [
    "https://previews.123rf.com/images/eyesee10/eyesee101104/eyesee10110400087/9320010-laptops.jpg",
    "https://previews.123rf.com/images/alfazetchronicles/alfazetchronicles2307/alfazetchronicles230724314/232592669-rows-of-wigs-on-mannequin-heads-various-styles-created-with-generative-ai.jpg",
    "https://previews.123rf.com/images/9george/9george1402/9george140200136/25908425-folded-old-blue-jeans-isolated-on-a-white-clipping-path-included.jpg",
  ];
  const imageLinks = [
    "/(screens)/Product/123",
    "/(screens)/Offers",
    "/(screens)/Category/Electronics",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  

  // Find active category name for display
  const activeCategoryName = categories?.find(
    (c) => c._id === activeCategoryId
  )?.categoryname;

  return (
    <View style={styles.headerContainer}>
      {/* Top Row: Logo & Cart */}
      <View style={styles.topRow}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => router.push("(screens)/Cart")}
          style={styles.cartIconContainer}
        >
          <Ionicons name="cart" size={35} color={Colors.primary} />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.primary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Products..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={Colors.lightGray}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchText ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
        {searchText.length > 0 && (
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Filter Badge */}
      {(keyword || activeCategoryId) && (
        <View style={styles.activeFilterRow}>
          <Text style={styles.filterText}>
            Showing: {keyword ? `"${keyword}"` : activeCategoryName}
          </Text>
          <TouchableOpacity
            style={styles.showAllButton}
            onPress={showAllProducts}
          >
            <Text style={styles.showAllButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomRow}>
        <Text style={styles.welcomeText}>
  {userInfo
    ? `Welcome ${
        (userInfo.FirstName || userInfo.name || "User").split(" ")[0]
      } 👋`
    : "Welcome 👋"}
</Text>

      </View>

      {/* Carousel */}
      <View style={styles.carouselCard}>
        <TouchableOpacity onPress={() => router.push(imageLinks[currentIndex])}>
          <Image
            source={{ uri: images[currentIndex] }}
            style={styles.carouselImage}
          />
        </TouchableOpacity>
        <View style={styles.carouselDots}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      {/* Dynamic Category Section */}
      <View style={styles.horizontalCardSection}>
        <Text style={styles.sectionTitle}>Shop by Category ⭐</Text>
        {categoriesLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {categories?.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.horizontalCard,
                  activeCategoryId === cat._id && {
                    borderColor: Colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleCategoryPress(cat._id)}
              >
                {/* Applied the dynamic image helper here */}
                <Image 
                  source={{ uri: getCategoryImage(cat.image) }} 
                  style={styles.horizontalCardImage} 
                />
                <Text style={styles.horizontalCardTitle} numberOfLines={1}>
                  {cat.categoryname} 
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => router.push("/screens/MoreOffers")}
              style={styles.moreCard}
            >
              <Text style={styles.moreText}>More →</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default Header;

// ... (Styles remain the same as your original code)
const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.offWhite,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  searchRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: { width: 100, height: 60, resizeMode: "contain" },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
  },
  searchButtonText: { color: Colors.white, fontWeight: "600" },
  searchInput: { flex: 1, fontSize: 14, color: Colors.black },
  bottomRow: { flexDirection: "row", marginBottom: 5 },
  cartIconContainer: { position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.textRed,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: "bold" },
  welcomeText: { fontSize: 16, fontWeight: "bold", color: Colors.primary },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  filterText: { color: Colors.primary, fontSize: 14, fontStyle: "italic" },
  showAllButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  showAllButtonText: { color: Colors.white, fontSize: 12 },
  carouselCard: {
    marginTop: 10,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
  },
  carouselImage: { width: "100%", height: 150, resizeMode: "cover" },
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: Colors.primary, width: 10, height: 10 },
  horizontalCardSection: { marginTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
  },
 
  moreCard: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    height: 110,
  },
  moreText: { color: Colors.white, fontWeight: "700" },

  activeCardBorder: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  horizontalCard: {
    width: 110,
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginRight: 12,
    paddingBottom: 10,
    overflow: "hidden",
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent', // Default transparent border to prevent jumping
  },
 horizontalCardImage: {
  width: 110, // Explicit width matching the card
  height: 80, // Explicit height
  backgroundColor: '#f0f0f0', // Add a temporary bg color to see if the box is there
  resizeMode: "cover",
},
  horizontalCardTitle: {
    textAlign: "center",
    paddingTop: 5,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.darkGray,
  },
});
