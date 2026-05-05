import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * A single shimmer skeleton block.
 * Use `width`, `height`, `borderRadius`, and `style` to customize.
 */
const SkeletonBlock = ({ width = "100%", height = 16, borderRadius = 8, style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

/**
 * Skeleton for a single product card (used in 2-column grid).
 */
export const ProductCardSkeleton = () => (
  <View style={styles.card}>
    <SkeletonBlock height={160} borderRadius={12} style={styles.cardImage} />
    <View style={styles.cardBody}>
      <SkeletonBlock height={14} width="80%" />
      <SkeletonBlock height={12} width="50%" style={{ marginTop: 6 }} />
      <SkeletonBlock height={18} width="40%" style={{ marginTop: 8 }} />
    </View>
  </View>
);

/**
 * A row of product card skeletons for the home screen grid.
 */
export const ProductGridSkeleton = ({ count = 6 }) => (
  <View style={styles.grid}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </View>
);

/**
 * Skeleton for a category pill row.
 */
export const CategoryRowSkeleton = ({ count = 5 }) => (
  <View style={styles.categoryRow}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonBlock
        key={i}
        width={70}
        height={32}
        borderRadius={16}
        style={styles.categoryPill}
      />
    ))}
  </View>
);

/**
 * Skeleton for the product detail screen.
 */
export const ProductDetailSkeleton = () => (
  <View style={styles.detailContainer}>
    <SkeletonBlock height={300} borderRadius={0} />
    <View style={styles.detailBody}>
      <SkeletonBlock height={22} width="70%" />
      <SkeletonBlock height={16} width="40%" style={{ marginTop: 8 }} />
      <SkeletonBlock height={14} width="100%" style={{ marginTop: 16 }} />
      <SkeletonBlock height={14} width="90%" style={{ marginTop: 6 }} />
      <SkeletonBlock height={14} width="80%" style={{ marginTop: 6 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#E0E0E0",
  },
  card: {
    width: (SCREEN_WIDTH - 30) / 2,
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
  },
  cardImage: {
    width: "100%",
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  categoryRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  categoryPill: {
    marginRight: 4,
  },
  detailContainer: {
    flex: 1,
  },
  detailBody: {
    padding: 20,
    gap: 8,
  },
});

export default SkeletonBlock;
