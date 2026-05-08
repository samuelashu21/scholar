// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   Dimensions,
//   StatusBar,
//   Platform,
// } from "react-native";
// import { Ionicons, Feather } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// const { width } = Dimensions.get("window");

// const CategoryScreen = () => {
//   const router = useRouter();
//   const [selectedCategory, setSelectedCategory] = useState(1);

//   // --- DATA SOURCE ---
//   const mainCategories = [
//     { id: 1, name: "Women's Fashion" },
//     { id: 2, name: "Men's Fashion" },
//     { id: 3, name: "Phones & Telecom" },
//     { id: 4, name: "Electronics" },
//     { id: 5, name: "Home & Pet" },
//     { id: 6, name: "Bags & Shoes" },
//     { id: 7, name: "Jewelry" },
//     { id: 8, name: "Outdoor Fun" },
//   ];

//   const categoryData = {
//     1: [
//       { id: 101, name: "Dresses", img: "https://picsum.photos/200?random=1" },
//       { id: 102, name: "T-Shirts", img: "https://picsum.photos/200?random=2" },
//       { id: 103, name: "Skirts", img: "https://picsum.photos/200?random=3" },
//       { id: 104, name: "Hoodies", img: "https://picsum.photos/200?random=4" },
//     ],
//     2: [
//       { id: 201, name: "Suits", img: "https://picsum.photos/200?random=5" },
//       { id: 202, name: "Jackets", img: "https://picsum.photos/200?random=6" },
//       { id: 203, name: "Jeans", img: "https://picsum.photos/200?random=7" },
//     ],
//     3: [
//       { id: 301, name: "iPhone", img: "https://picsum.photos/200?random=8" },
//       { id: 302, name: "Android", img: "https://picsum.photos/200?random=9" },
//       { id: 303, name: "Cases", img: "https://picsum.photos/200?random=10" },
//     ],
//   };

//   const currentProducts = categoryData[selectedCategory] || [];

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* --- ALIEXPRESS STYLE HEADER --- */}
//       <View style={styles.headerContainer}>
//         {/* LOGO ADDED HERE */} 
//         <View style={styles.logoContainer}>
//            <Image 
//              source={require("../../assets/images/logo.png")} 
//              style={styles.logo} 
//              resizeMode="contain"
//            />
//         </View>
//         <TouchableOpacity 
//           style={styles.searchBarWrapper} 
//           activeOpacity={0.9}
//           onPress={() => router.push("/SearchPage")}
//         >
//           <View style={styles.searchInner}>
//             <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
//             <Text style={styles.searchText}>I'm shopping for...</Text>
//           </View>
          
//           <View style={styles.rightIcons}>
//             <View style={styles.cameraBtn}>
//                <Feather name="camera" size={20} color="#666" />
//             </View>
//             <TouchableOpacity 
//               style={styles.searchActionBtn}
//               onPress={() => router.push("/SearchPage")}
//             >
//               <Text style={styles.searchActionText}>Search</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.content}>
//         {/* --- LEFT: SIDEBAR --- */}
//         <View style={styles.sidebar}>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             {mainCategories.map((cat) => (
//               <TouchableOpacity
//                 key={cat.id}
//                 onPress={() => setSelectedCategory(cat.id)}
//                 style={[
//                   styles.sideItem,
//                   selectedCategory === cat.id && styles.activeSideItem,
//                 ]}
//               >
//                 {selectedCategory === cat.id && <View style={styles.activeIndicator} />}
//                 <Text
//                   style={[
//                     styles.sideText,
//                     selectedCategory === cat.id && styles.activeSideText,
//                   ]}
//                 >
//                   {cat.name}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* --- RIGHT: DYNAMIC CONTENT --- */}
//         <View style={styles.mainContent}>
//           <ScrollView 
//             key={selectedCategory} 
//             showsVerticalScrollIndicator={false} 
//             contentContainerStyle={styles.rightPadding}
//           >
//             <View style={styles.promoBanner}>
//               <Text style={styles.promoTitle}>
//                 {mainCategories.find(c => c.id === selectedCategory)?.name}
//               </Text>
//               <Text style={styles.promoSubtitle}>Discover the latest trends</Text>
//             </View>

//             <Text style={styles.gridTitle}>Top Categories</Text>
            
//             <View style={styles.productGrid}>
//               {currentProducts.length > 0 ? (
//                 currentProducts.map((item) => (
//                   <TouchableOpacity key={item.id} style={styles.productItem}>
//                     <View style={styles.imgWrapper}>
//                       <Image source={{ uri: item.img }} style={styles.img} />
//                     </View>
//                     <Text style={styles.productLabel} numberOfLines={1}>
//                       {item.name}
//                     </Text>
//                   </TouchableOpacity>
//                 ))
//               ) : (
//                 <Text style={styles.emptyText}>Items coming soon...</Text>
//               )}
//             </View>
//           </ScrollView>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };
 
// export default CategoryScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//   },
//   headerContainer: {
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: '#FFF',
//   },
//   logoContainer: {
//     alignItems: 'center', 
//     justifyContent: 'center',
//     marginVertical: 10, // Adjust spacing above/below logo
//   },
//   logo: {
//     width: 120, // Adjust width based on your logo design
//     height: 40,  // Adjust height based on your logo design
//   },
//   searchBarWrapper: {
//     flexDirection: "row",
//     backgroundColor: "#FFF",
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: 'space-between',
//     borderWidth: 1.5,
//     borderColor: "#FF4747",
//     paddingLeft: 12,
//     overflow: 'hidden'
//   },
//   searchInner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchText: {
//     color: "#999",
//     fontSize: 13,
//   },
//   rightIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: '100%',
//   },
//   cameraBtn: {
//     paddingHorizontal: 10,
//   },
//   searchActionBtn: {
//     backgroundColor: '#FF4747',
//     height: '100%',
//     paddingHorizontal: 18,
//     justifyContent: 'center',
//   },
//   searchActionText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   content: {
//     flex: 1,
//     flexDirection: "row",
//     borderTopWidth: 1,
//     borderTopColor: "#F5F5F5",
//   },
//   sidebar: {
//     width: width * 0.28,
//     backgroundColor: "#F8F8F8",
//   },
//   sideItem: {
//     height: 65,
//     justifyContent: "center",
//     paddingHorizontal: 10,
//   },
//   activeSideItem: {
//     backgroundColor: "#FFF",
//   },
//   activeIndicator: {
//     position: "absolute",
//     left: 0,
//     width: 3,
//     height: 25,
//     backgroundColor: "#FF4747",
//     borderTopRightRadius: 4,
//     borderBottomRightRadius: 4,
//   },
//   sideText: {
//     fontSize: 12,
//     color: "#666",
//     textAlign: "center",
//   },
//   activeSideText: {
//     color: "#000",
//     fontWeight: "bold",
//   },
//   mainContent: {
//     flex: 1,
//   },
//   rightPadding: {
//     padding: 15,
//   },
//   promoBanner: {
//     width: "100%",
//     height: 90,
//     backgroundColor: "#333",
//     borderRadius: 10,
//     justifyContent: "center",
//     paddingHorizontal: 15,
//     marginBottom: 20,
//   },
//   promoTitle: {
//     color: "#FFF",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   promoSubtitle: {
//     color: "#CCC",
//     fontSize: 12,
//   },
//   gridTitle: {
//     fontWeight: "700",
//     fontSize: 14,
//     marginBottom: 15,
//     color: "#333",
//   },
//   productGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   productItem: {
//     width: "33.3%",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   imgWrapper: {
//     width: 70,
//     height: 70,
//     backgroundColor: "#F2F2F2",
//     borderRadius: 35,
//     marginBottom: 5,
//     overflow: 'hidden'
//   },
//   img: {
//     width: "100%",
//     height: "100%",
//   },
//   productLabel: {
//     fontSize: 10,
//     color: "#444",
//   },
//   emptyText: {
//     color: "#999",
//     marginTop: 20,
//     width: "100%",
//     textAlign: "center",
//   },
// });  


 import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons"; 
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

// --- API & Utils Imports ---
import { Colors } from "../../constants/Utils"; // Adjust path if needed
import { BASE_URL } from "../../constants/Urls"; // Adjust path if needed
import { useGetCategoriesQuery } from "../../slices/categoryApiSlice.js";
import { useGetSubcategoriesQuery } from "../../slices/subcategoryApiSlice.js";
import { cacheCatalogData } from "../../slices/catalogCacheSlice.js";

const { width } = Dimensions.get("window");

const CategoryScreen = () => { 
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isConnected } = useSelector((state) => state.network);
  const { categories: cachedCategories, subcategories: cachedSubcategories } = useSelector(
    (state) => state.catalogCache
  );

  // --- Fetch Data ---
  const { data: categories, isLoading: catLoading } = useGetCategoriesQuery();
  const { data: subcategories, isLoading: subLoading } = useGetSubcategoriesQuery();
  const categorySource = categories?.length ? categories : cachedCategories;
  const subcategorySource = subcategories?.length ? subcategories : cachedSubcategories;

  // Set initial category once data loads
  useEffect(() => {
    if (categorySource && categorySource.length > 0 && !selectedCategory) {
      setSelectedCategory(categorySource[0]._id);
    }
  }, [categorySource, selectedCategory]);

  useEffect(() => {
    if (categories?.length || subcategories?.length) {
      dispatch(
        cacheCatalogData({
          categories,
          subcategories,
        })
      );
    }
  }, [categories, subcategories, dispatch]);

  // --- Filter Logic ---
  // We filter subcategories that belong to the selected parent category
  const currentSubcategories = subcategorySource?.filter(
    (sub) => (sub.parentCategory?._id || sub.parentCategory) === selectedCategory
  ) || [];

  const activeCategoryName = categorySource?.find(c => c._id === selectedCategory)?.categoryname;

  const getImageUri = (img) => (img?.startsWith("http") ? img : `${BASE_URL}${img}`);

  if ((catLoading || subLoading) && !cachedCategories?.length) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF4747" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
           <Image 
             source={require("../../assets/images/logo.png")} 
             style={styles.logo} 
             resizeMode="contain"
           />
        </View>
        <TouchableOpacity 
          style={styles.searchBarWrapper} 
          activeOpacity={0.9}
          onPress={() => router.push("/SearchPage")}
        >
          <View style={styles.searchInner}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <Text style={styles.searchText}>I'm shopping for...</Text>
          </View>
          
          <View style={styles.rightIcons}>
            <View style={styles.cameraBtn}>
               <Feather name="camera" size={20} color="#666" />
            </View>
            <TouchableOpacity 
              style={styles.searchActionBtn}
              onPress={() => router.push("/SearchPage")}
            >
              <Text style={styles.searchActionText}>Search</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* --- LEFT: SIDEBAR (Dynamic Categories) --- */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categorySource?.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() => setSelectedCategory(cat._id)}
                style={[
                  styles.sideItem,
                  selectedCategory === cat._id && styles.activeSideItem,
                ]}
              >
                {selectedCategory === cat._id && <View style={styles.activeIndicator} />}
                <Text
                  style={[
                    styles.sideText,
                    selectedCategory === cat._id && styles.activeSideText,
                  ]}
                  numberOfLines={2}
                >
                  {cat.categoryname}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- RIGHT: CONTENT (Dynamic Subcategories) --- */}
        <View style={styles.mainContent}>
          <ScrollView 
            key={selectedCategory} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.rightPadding}
          >
            {/* Promo Banner with Category Image */}
            <View style={styles.promoBanner}>
              <Text style={styles.promoTitle}>{activeCategoryName}</Text>
              <Text style={styles.promoSubtitle}>
                {isConnected ? "Discover the latest trends" : "Offline mode: showing cached data"}
              </Text>
            </View>

            <Text style={styles.gridTitle}>Popular in {activeCategoryName}</Text>
            
            <View style={styles.productGrid}>
              {currentSubcategories.length > 0 ? (
                currentSubcategories.map((item) => (
                  <TouchableOpacity 
                    key={item._id} 
                    style={styles.productItem}
                    onPress={() => router.push({
                        pathname: "/CategoryProducts",
                        params: { subId: item._id, title: item.subcategoryName }
                    })}
                  >
                    <View style={styles.imgWrapper}>
                      <Image 
                        source={{ uri: getImageUri(item.image) }} 
                        style={styles.img} 
                      />
                    </View>
                    <Text style={styles.productLabel} numberOfLines={1}>
                      {item.subcategoryName}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="bag-handle-outline" size={40} color="#eee" />
                    <Text style={styles.emptyText}>No subcategories found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  logoContainer: {
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 35,
  },
  searchBarWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: "#FF4747",
    paddingLeft: 12,
    overflow: 'hidden'
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    color: "#999",
    fontSize: 13,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  cameraBtn: {
    paddingHorizontal: 10,
  },
  searchActionBtn: {
    backgroundColor: '#FF4747',
    height: '100%',
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  sidebar: {
    width: width * 0.28,
    backgroundColor: "#F8F8F8",
  },
  sideItem: {
    height: 65,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  activeSideItem: {
    backgroundColor: "#FFF",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    width: 4,
    height: 20,
    backgroundColor: "#FF4747",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sideText: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  activeSideText: {
    color: "#000",
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
  },
  rightPadding: {
    padding: 15,
  },
  promoBanner: {
    width: "100%",
    height: 90,
    backgroundColor: "#333",
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  promoTitle: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  promoSubtitle: {
    color: "#CCC",
    fontSize: 12,
  },
  gridTitle: {
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 15,
    color: "#333",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  productItem: {
    width: "33.3%",
    alignItems: "center",
    marginBottom: 15,
  },
  imgWrapper: {
    width: 65,
    height: 65,
    backgroundColor: "#F2F2F2",
    borderRadius: 33,
    marginBottom: 5,
    overflow: 'hidden'
  },
  img: {
    width: "100%",
    height: "100%",
  },
  productLabel: {
    fontSize: 10,
    color: "#444",
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 10,
  },
}); 
