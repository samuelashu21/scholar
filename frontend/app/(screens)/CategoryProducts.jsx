
import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

// --- Components & Utils ---
import Product from "../../components/Product";
import Message from "../../components/Message";
import { useGetProductsQuery } from "../../slices/productsApiSlice";

const CategoryProducts = () => {
  const { subId = "", title = "Products", keyword = "", pageNumber = "1" } = useLocalSearchParams();
  const router = useRouter();

  // --- States ---
  const [sort, setSort] = useState("-createdAt"); 
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sortOptions = [
    { label: "Newest Arrivals", value: "-createdAt" },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "-price" },
    { label: "Top Rated", value: "-rating" },
  ];

  // --- API Hook ---
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword,
    pageNumber: Number(pageNumber),
    subcategory: subId,
    sort, // This ensures the filter is dynamic
  });

  // --- Actions ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    refetch();
  }, [keyword, pageNumber, subId, sort]);

  const handleSortSelect = (value) => {
    setSort(value);
    setShowSortModal(false);
  };

  const renderPaginationButtons = () => {
    if (!data?.pages || data.pages <= 1) return null;
    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
          <TouchableOpacity
            key={page}
            style={[styles.pageButton, page === data.page && styles.activePageButton]}
            onPress={() => router.setParams({ pageNumber: page.toString() })}
          >
            <Text style={[styles.pageButtonText, page === data.page && styles.activePageButtonText]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerWrapper}>
      {/* 1. BRANDING ROW */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/cart")}>
          <Ionicons name="cart-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 2. ALIEXPRESS PILL SEARCH BAR */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.aliSearchWrapper}
          activeOpacity={0.8}
          onPress={() => router.push("/SearchPage")}
        >
          <View style={styles.searchInner}>
            <Ionicons name="search-outline" size={18} color="#999" style={styles.searchIcon} />
            <Text style={styles.searchText} numberOfLines={1}>
              {title}
            </Text>
          </View>
          
          <View style={styles.rightActions}>
            <Feather name="camera" size={18} color="#999" style={styles.cameraIcon} />
            <View style={styles.aliSearchBtn}>
              <Text style={styles.aliSearchBtnText}>Search</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. DYNAMIC INFO BAR */}
      <View style={styles.infoBar}>
         <Text style={styles.resultsText}>{data?.total || 0} Results for "{title}"</Text>
         <TouchableOpacity style={styles.filterBtn} onPress={() => setShowSortModal(true)}>
            <Text style={styles.filterText}>
                {sortOptions.find(o => o.value === sort)?.label.split(':')[0]}
            </Text>
            <Ionicons name="options-outline" size={14} color="#FF4747" />
         </TouchableOpacity>
      </View>

      {error && (
        <Message variant="error" style={styles.errorMessage}>
          {error?.data?.message || "Could not load products"}
        </Message>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {isLoading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF4747" />
        </View>
      ) : (
        <FlatList
          data={data?.products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <Product product={item} />}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={renderPaginationButtons}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF4747"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={80} color="#ddd" />
              <Text style={styles.emptyText}>No products found here.</Text>
            </View>
          }
        />
      )}

      {/* --- SORTING MODAL --- */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {sortOptions.map((option) => (
              <TouchableOpacity 
                key={option.value} 
                style={styles.sortOption} 
                onPress={() => handleSortSelect(option.value)}
              >
                <Text style={[styles.sortOptionText, sort === option.value && styles.activeSortText]}>
                  {option.label}
                </Text>
                {sort === option.value && <Ionicons name="checkmark-circle" size={22} color="#FF4747" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default CategoryProducts;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
headerWrapper: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingBottom: 12,
    // Add significant padding top to push the logo/cart down
    paddingTop: Platform.OS === "ios" ? 10 : 15, 
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 3 }
    })
  }, 
navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // Increased height to allow for better centering
    height: 60, 
    // Added margin top to push it away from the status bar
    marginTop: Platform.OS === "android" ? 10 : 0, 
  },
 logoContainer: { 
    flex: 1, 
    height: 38, // Slightly larger logo container
    alignItems: 'center',
    justifyContent: 'center' 
  },
  iconBtn: {  
    width: 44, 
    height: 44, // Larger touch target
    alignItems: 'center', 
    justifyContent: 'center', // Centers the icon inside the button
  },
  logo: { width: "100%", height: "100%" },
 
  searchContainer: { marginTop: 10 },
  aliSearchWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    paddingLeft: 15,
    borderWidth: 1.5,
    borderColor: "#FF4747",
    overflow: "hidden",
  },
  searchInner: { flex: 1, flexDirection: "row", alignItems: "center" },
  searchIcon: { marginRight: 8 },
  searchText: { color: "#333", fontSize: 14, fontWeight: "500" },
  rightActions: { flexDirection: "row", alignItems: "center" },
  cameraIcon: { marginHorizontal: 12 },
  aliSearchBtn: {
    backgroundColor: "#FF4747",
    height: "100%",
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  aliSearchBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 13 },

  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  resultsText: { fontSize: 12, color: "#999" },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  filterText: { fontSize: 12, color: '#FF4747', marginRight: 5, fontWeight: "600" },

  list: { paddingBottom: 30 },
  columnWrapper: { justifyContent: "space-between", paddingHorizontal: 10, marginTop: 10 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    paddingBottom: 40 
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  sortOption: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#F0F0F0' 
  },
  sortOptionText: { fontSize: 16, color: '#444' },
  activeSortText: { color: '#FF4747', fontWeight: 'bold' },

  // Pagination
  paginationContainer: { flexDirection: "row", justifyContent: "center", paddingVertical: 25, gap: 10 },
  pageButton: { width: 35, height: 35, borderRadius: 18, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#EEE" },
  activePageButton: { backgroundColor: "#FF4747", borderColor: "#FF4747" },
  pageButtonText: { color: "#666", fontSize: 13 },
  activePageButtonText: { color: "#FFF", fontWeight: "bold" },
});