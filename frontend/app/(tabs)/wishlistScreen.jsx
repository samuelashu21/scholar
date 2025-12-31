import React from "react";
import { View, Text, FlatList, ToastAndroid } from "react-native";
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "../../slices/wishlistApiSlice";
import ProductCard from "../../components/ProductCard";

const WishlistScreen = () => {
  const { data: wishlist, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId).unwrap();
      ToastAndroid.show("Removed from Wishlist", ToastAndroid.SHORT);
    } catch (e) {
      console.log(e);
    }
  };

  if (isLoading) return <Text>Loading...</Text>;

  if (!wishlist || wishlist.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, textAlign: "center" }}>
          Your wishlist is empty 😔
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 10 }}>
        My Wishlist ❤️ ({wishlist.length})
      </Text>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isWishlistItem
            onRemove={handleRemove}
          />
        )}
      />
    </View>
  );
};

export default WishlistScreen;
 