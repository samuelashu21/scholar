import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TextInput,
  Image,
} from "react-native";
import React, { useState } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import {
  useGetMyProductsQuery,
  useDeleteProductMutation,
} from "../../../slices/productsApiSlice";
import { Colors } from "../../../constants/Utils";
import { BASE_URL } from "../../../constants/Urls";

const SellerProductListScreen = () => {
  const { pageNumber = "1" } = useLocalSearchParams();
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("-createdAt");

  const { data, isLoading, error, refetch, isFetching } = useGetMyProductsQuery({
    pageNumber: Number(pageNumber),
    keyword,
    sort: sortOrder, 
  });

  const [deleteProduct] = useDeleteProductMutation();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/100";
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  const deleteHandler = async (id) => {
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(id).unwrap();
            refetch();
          } catch (err) {
            Alert.alert("Error", err?.data?.message || err?.error || "Delete failed");
          }
        },
      },
    ]);
  };

  const createProductHandler = () => {
    router.push({ pathname: "/seller/SellerProductEditScreen", params: { id: "new" } });
  };

  const renderPaginationButtons = () => {
    if (!data?.pages || data.pages <= 1) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
          <TouchableOpacity
            key={page}
            style={[styles.pageButton, page === data.page && styles.activePageButton]}
            onPress={() => router.setParams({ pageNumber: page.toString() })}
          >
            <Text
              style={[
                styles.pageButtonText,
                page === data.page && styles.activePageButtonText,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>
          {error?.data?.message || error?.error || "Failed to load products"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/account")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Products</Text>
        <TouchableOpacity style={styles.addButton} onPress={createProductHandler}>
          <FontAwesome name="plus" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* SEARCH + SORT */}
      <View style={styles.filterContainer}>
        <View style={styles.searchSection}>
          <Ionicons name="search" size={18} color="#ADB5BD" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={keyword}
            onChangeText={setKeyword}
            clearButtonMode="while-editing"
          />
        </View>

        <View style={styles.sortWrapper}>
          <Picker
            selectedValue={sortOrder}
            style={styles.sortPicker}
            onValueChange={(itemValue) => setSortOrder(itemValue)}
          >
            <Picker.Item label="Newest" value="-createdAt" />
            <Picker.Item label="Price: Low" value="price" />
            <Picker.Item label="Price: High" value="-price" />
            <Picker.Item label="Name" value="name" />
          </Picker>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data?.products ?? []}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} color={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(screens)/ProductScreen", // if unmatched, use your exact product details route path
                  params: { productId: item._id },
                })
              }
            >
              <Image source={{ uri: getImageUrl(item.image) }} style={styles.productImage} />

              <View style={styles.infoWrap}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productCategory} numberOfLines={1}>
                  {item.category?.categoryname || "Uncategorized"}
                </Text>
                <Text style={styles.productPrice}>
                  ${Number(item.price || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({
                      pathname: "/seller/SellerProductEditScreen",
                      params: { id: item._id },
                    });
                  }}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteHandler(item._id);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={renderPaginationButtons}
          ListEmptyComponent={() => <Text style={styles.emptyText}>No products found.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

export default SellerProductListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  filterContainer: {
    padding: 16,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  searchSection: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 5 },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: "#495057" },
  sortWrapper: {
    flex: 1.2,
    backgroundColor: "#F1F3F5",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
  },
  sortPicker: { height: 40, width: "100%" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: "#EEF1F4",
    elevation: 2,
  },
  productImage: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#F1F3F5",
    marginRight: 12,
  },
  infoWrap: { flex: 1, paddingRight: 8 },
  productName: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  productCategory: { fontSize: 12, color: "#9CA3AF", marginTop: 3 },
  productPrice: { fontSize: 15, fontWeight: "800", color: Colors.primary, marginTop: 8 },

  actionGroup: { flexDirection: "row", alignItems: "center" },
  editBtn: {
    padding: 8,
    backgroundColor: "#EEF4FF",
    borderRadius: 10,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: "#FFF1F1",
    borderRadius: 10,
  },

  emptyText: { textAlign: "center", marginTop: 60, color: "#ADB5BD" },
  errorText: { color: "red", padding: 16 },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 25,
    gap: 8,
  },
  pageButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  activePageButton: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pageButtonText: { color: "#495057", fontWeight: "700" },
  activePageButtonText: { color: "#FFF" },
});