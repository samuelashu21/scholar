import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message"; // Switched to Toast for cross-platform support
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "../../slices/wishlistApiSlice";
import ProductCard from "../../components/ProductCard";
import { Colors } from "../../constants/Utils";

const WishlistScreen = () => {
  const router = useRouter();
  const { data: wishlist, isLoading, refetch } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId).unwrap();
      Toast.show({
        type: "success",
        text1: "Removed",
        text2: "Item removed from your wishlist",
        position: "bottom",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not remove item",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // EMPTY STATE
  if (!wishlist || wishlist.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={60} color={Colors.lightGray} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any product to save it for later.
          </Text>
          <TouchableOpacity 
            style={styles.shopBtn} 
            onPress={() => router.push("/")}
          >
            <Text style={styles.shopBtnText}>Go Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{wishlist.length}</Text>
        </View>
      </View>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              product={item}
              isWishlistItem
              onRemove={() => handleRemove(item._id)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  listContent: { padding: 10 },
  row: { justifyContent: "space-between" },
  cardWrapper: {
    flex: 0.5,
    margin: 5,
  },
  // EMPTY STATE STYLES
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 10 },
  emptySubtitle: { fontSize: 14, color: "#6C757D", textAlign: "center", marginBottom: 30, lineHeight: 20 },
  shopBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 15,
  },
  shopBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});