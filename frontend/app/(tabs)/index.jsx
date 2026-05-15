import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Image,
} from "react-native";
import React, { useEffect, useMemo } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import Product from "../../components/Product";
import Header from "../../components/Header";

import { Colors, Radius, Shadows, Spacing, Typography } from "../../constants/Utils";
import { useGetProductsQuery } from "../../slices/productsApiSlice";
import { BASE_URL } from "../../constants/Urls";
import EmptyState from "../../components/ui/EmptyState";
import Message from "../../components/Message";
import SkeletonBlock from "../../components/ui/SkeletonBlock";

const Home = () => {
  const { keyword = "", pageNumber = "1", category = "" } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword,
    pageNumber: Number(pageNumber),
    category,
  });

  useEffect(() => {
    refetch();
  }, [keyword, pageNumber, category, refetch]);

  const products = data?.products || [];

  const trendingProducts = useMemo(
    () => [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8),
    [products]
  );

  const recommendedProducts = useMemo(
    () => [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8),
    [products]
  );

  const getImage = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const renderPaginationButtons = () => {
    if (!data?.pages || data.pages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
          <TouchableOpacity
            key={page}
            style={[styles.pageButton, page === data.page && styles.activePageButton]}
            onPress={() => {
              router.setParams({
                pageNumber: page.toString(),
                ...(keyword ? { keyword } : {}),
                ...(category ? { category } : {}),
              });
            }}
          >
            <Text style={[styles.pageButtonText, page === data.page && styles.activePageButtonText]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const HorizontalRail = ({ title, items }) => {
    if (!items?.length) return null;

    return (
      <View style={styles.railWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={items}
          horizontal
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.railList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.railCard}
              onPress={() => router.push({ pathname: "/(screens)/ProductScreen", params: { productId: item._id } })}
              activeOpacity={0.9}
            >
              <Image source={{ uri: getImage(item.image) }} style={styles.railImage} />
              <Text numberOfLines={2} style={styles.railName}>{item.name}</Text>
              <Text style={styles.railPrice}>${item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const ListHeader = () => (
    <>
      <Header />

      {isLoading && (
        <View style={styles.skeletonWrap}>
          <SkeletonBlock height={100} style={styles.skeletonCard} />
          <SkeletonBlock height={100} style={styles.skeletonCard} />
        </View>
      )}

      {!isLoading && !error && (
        <>
          <HorizontalRail title="Trending now" items={trendingProducts} />
          <HorizontalRail title="Recommended for you" items={recommendedProducts} />

          <View style={styles.gridHeaderWrap}>
            <Text style={styles.sectionTitle}>All products</Text>
          </View>
        </>
      )}

      {error && (
        <Message variant="error">
          {error?.data?.message || error?.error || "Failed to fetch products"}
        </Message>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={isLoading ? [] : products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Product product={item} />}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={renderPaginationButtons}
        ListEmptyComponent={
          !isLoading &&
          !error && (
            <EmptyState
              title="No products found"
              description="Try another category or search keyword."
              actionLabel="Clear filters"
              onAction={() => router.setParams({ category: "", keyword: "", pageNumber: "1" })}
            />
          )
        }
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  list: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.screen,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  skeletonWrap: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  skeletonCard: {
    borderRadius: Radius.lg,
  },
  railWrap: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.darkGray,
  },
  railList: {
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  railCard: {
    width: 148,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  railImage: {
    width: "100%",
    height: 94,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
  },
  railName: {
    marginTop: Spacing.sm,
    minHeight: 34,
    color: Colors.darkGray,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.sm,
  },
  railPrice: {
    marginTop: 2,
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
  },
  gridHeaderWrap: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl,
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  activePageButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pageButtonText: {
    color: Colors.darkGray,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.sm,
  },
  activePageButtonText: {
    color: Colors.white,
  },
}); 