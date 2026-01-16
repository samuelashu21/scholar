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
} from "react-native";
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Message from "../../../components/Message";

import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
} from "../../../slices/productsApiSlice";
import { useGetCategoriesQuery } from "../../../slices/categoryApiSlice";
import { useGetSubcategoriesQuery } from "../../../slices/subcategoryApiSlice"; // Import Subcategory Slice
import { Colors } from "../../../constants/Utils";
import Ionicons from "@expo/vector-icons/Ionicons";

const ProductListScreen = () => {
  const { pageNumber = "1" } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    pageNumber: Number(pageNumber),
  });

  // Fetch categories and subcategories to get default IDs for new products
  const { data: categories } = useGetCategoriesQuery();
  const { data: subcategories } = useGetSubcategoriesQuery();

  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();

  // Delete handler
  const deleteHandler = async (id) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(id).unwrap();
              refetch();
            } catch (err) {
              Alert.alert("Error", err?.data?.message || err.error);
            }
          },
        },
      ]
    );
  };

  // Create handler
  const createProductHandler = async () => {
    Alert.alert(
      "Create Product",
      "Are you sure you want to create a new product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: async () => {
            try {
              // 1. Try to get default Category ID
              const defaultCategoryId =
                data?.products?.[0]?.category?._id || 
                categories?.[0]?._id || 
                "";

              // 2. Try to get default Subcategory ID 
              // (Filters for subcategories belonging to the default category)
              const defaultSubcategoryId =
                data?.products?.[0]?.subcategory?._id ||
                subcategories?.find(s => s.category === defaultCategoryId)?._id ||
                subcategories?.[0]?._id ||
                "";

              // Create product with both IDs
              const createdProduct = await createProduct({
                categoryId: defaultCategoryId,
                subcategoryId: defaultSubcategoryId, // FIXED: Now sending subcategoryId
              }).unwrap();

              // Redirect to edit screen
              router.push({
                pathname: "/admin/ProductEditScreen",
                params: { id: createdProduct._id },
              });
            } catch (err) {
              Alert.alert("Error", err?.data?.message || err.error);
            }
          },
        },
      ]
    );
  };

  // Pagination buttons
  const renderPaginationButtons = () => {
    if (!data?.pages || data.pages <= 1) return null;
    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
          <TouchableOpacity
            key={page}
            style={[
              styles.pageButton,
              page === data.page && styles.activePageButton,
            ]}
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
      <View style={styles.container}>
        <Message variant="error">{error?.data?.message || error.error}</Message>
      </View>
    );
  }

  if (isLoading || loadingDelete) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("../../account")}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Products</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={createProductHandler}
            disabled={loadingCreate}
          >
            {loadingCreate ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <FontAwesome name="plus" size={16} color={Colors.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Price</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Actions</Text>
        </View>

        <FlatList
          data={data?.products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item: product }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={[styles.cell, { flex: 1 }]} numberOfLines={1}>
                ${product.price}
              </Text>

              <View style={[styles.actionsCell, { flex: 1.5 }]}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/admin/ProductEditScreen",
                      params: { id: product._id },
                    })
                  }
                >
                  <FontAwesome name="edit" color={Colors.primary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginLeft: 5 }}
                  onPress={() => deleteHandler(product._id)}
                >
                  <FontAwesome name="trash" size={20} color={Colors.textRed} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={renderPaginationButtons}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProductListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  container: { flex: 1, padding: 16, backgroundColor: Colors.offWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "600", color: Colors.primary },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: { color: Colors.white, marginLeft: 8, fontWeight: "600" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    color: Colors.secondaryTextColor,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  cell: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.textColor,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsCell: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    minWidth: 40,
    alignItems: "center",
  },
  activePageButton: { backgroundColor: Colors.primary },
  pageButtonText: { color: Colors.primary, fontWeight: "600" },
  activePageButtonText: { color: Colors.white },
});
