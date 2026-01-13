
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native"; 
import React, { useEffect } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import Product from "../../components/Product";
import Message from "../../components/Message";
import Header from "../../components/Header";

import { Colors } from "../../constants/Utils";
import { useGetProductsQuery } from "../../slices/productsApiSlice";

const Home = () => {
  // 1. Destructure 'category' from search params
  const { keyword = "", pageNumber = "1", category = "" } = useLocalSearchParams();

  const router = useRouter(); 

  // 2. Pass 'category' into the RTK Query hook
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword,
    pageNumber: Number(pageNumber),
    category, // This matches your backend controller's req.query.category
  });

  // 3. Ensure refetch happens when category changes
  useEffect(() => {
    refetch();
  }, [keyword, pageNumber, category, refetch]);

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
            onPress={() => {
              router.setParams({
                pageNumber: page.toString(),
                ...(keyword ? { keyword } : {}),
                ...(category ? { category } : {}), // Persist category during pagination
              });
            }}
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
 
  const ListHeader = () => (
    <>
      <Header />
      {error && (
        <Message variant="error" style={styles.errorMessage}>
          {error?.data?.message || error?.error || "Failed to fetch products"}
        </Message>
      )}
    </>
  );

  const ListFooter = () => renderPaginationButtons();

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
          ListFooterComponent={ListFooter}
          ListEmptyComponent={
            !error && (
              <Message variant="info" style={styles.emptyMessage}>
                No products available in this category
              </Message>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Home;
 
// ... styles remain the same

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  emptyMessage: {
    marginTop: 20,
    alignSelf: "center",
  },
  list: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 15,
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
    borderColor: Colors.primary,
    minWidth: 40,
    alignItems: "center",
  },
  activePageButton: {
    backgroundColor: Colors.primary,
  },
  pageButtonText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  activePageButtonText: {
    color: Colors.white,
  },
});
 