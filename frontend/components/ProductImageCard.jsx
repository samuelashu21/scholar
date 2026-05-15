import { StyleSheet, View, Image, FlatList } from "react-native";
import React, { useMemo, useState } from "react";
import { Colors, Radius, Shadows, Spacing } from "../constants/Utils";
import { BASE_URL } from "../constants/Urls";
 
const ProductImageCard = ({ imageUrl, images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const imageList = useMemo(() => {
    const fromArray = Array.isArray(images) ? images : [];
    const merged = [imageUrl, ...fromArray].filter(Boolean);
    return [...new Set(merged)];
  }, [imageUrl, images]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  return (
    <View style={styles.imageCard}>
      <FlatList
        data={imageList}
        horizontal
        pagingEnabled
        keyExtractor={(item, index) => `${item}-${index}`}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: getImageUrl(item) }} style={styles.productImage} resizeMode="contain" />
          </View>
        )}
      />

      {imageList.length > 1 && (
        <View style={styles.dotWrap}>
          {imageList.map((_, index) => (
            <View key={index} style={[styles.dot, activeIndex === index && styles.activeDot]} />
          ))}
        </View>
      )}
    </View>
  );
};

export default ProductImageCard;

const styles = StyleSheet.create({
  imageCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Shadows.md,
  },
  slide: {
    width: "100%",
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
  },
  productImage: {
    width: "92%",
    height: "92%",
  },
  dotWrap: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  activeDot: {
    width: 18,
    backgroundColor: Colors.primary,
  },
});