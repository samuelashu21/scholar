import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image, 
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { Colors } from "../../constants/Utils";
import { useGetSellerByIdQuery } from "../../slices/userAPiSlice";
import { useGetProductsQuery } from "../../slices/productsApiSlice";
import Rating from "../../components/Rating";
import { timeAgo } from "../../utils/timeAgo";
  
const SellerProfile = () => {
  const { sellerId } = useLocalSearchParams(); 
  const router = useRouter();

  // Fetch seller info
  const {
    data: seller,
    isLoading: sellerLoading,
    error: sellerError,
  } = useGetSellerByIdQuery(sellerId);

  // Fetch all products
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery({
      keyword: "",
      pageNumber: 1,
    });

  // Ensure products is always an array
  const productsArray = Array.isArray(productsData?.products)
    ? productsData.products
    : Array.isArray(productsData)
    ? productsData
    : [];

  // Filter products for this seller
  const sellerProducts = productsArray.filter((p) => p.user?._id === sellerId);

  if (sellerLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (sellerError || !seller) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {sellerError?.data?.message || "Seller not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: seller.profileImage || "https://via.placeholder.com/120",
          }}
          style={styles.profileImage}
        />
        <Text
          style={styles.name}
        >{`${seller.FirstName} ${seller.LastName}`}</Text>

        {seller.isSeller && (
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>
              {seller.sellerProfile?.storeName || "Store"}
            </Text>
            {seller.sellerProfile?.storeLogo && (
              <Image
                source={{
                  uri:
                    seller.sellerProfile.storeLogo ||
                    "https://via.placeholder.com/80",
                }}
                style={styles.storeLogo}
              />
            )}
            <Rating
              value={seller.sellerProfile?.rating || 0}
              text={`${seller.sellerProfile?.totalSales || 0} sales`}
            />
          </View>
        )}

        <Text style={styles.joined}>Joined {timeAgo(seller.createdAt)}</Text>
      </View>

      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>Products by {seller.FirstName}</Text>

        {productsLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : sellerProducts.length > 0 ? (
          <FlatList
            data={sellerProducts}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            renderItem={({ item }) => (
              <Link
                href={{
                  pathname: "/ProductScreen",
                  params: { productId: item._id },
                }}
                asChild
              >
                <TouchableOpacity style={styles.productCard}>
                  <Image
                    source={{
                      uri: item.image || "https://via.placeholder.com/140",
                    }}
                    style={styles.productImage}
                  />
                  <Text numberOfLines={1} style={styles.productName}>
                    {item.name}
                  </Text>
                  <Text style={styles.productPrice}>${item.price}</Text>
                </TouchableOpacity>
              </Link>
            )}
          />
        ) : (
          <Text style={styles.noProducts}>
            This seller has no products yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default SellerProfile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: { color: Colors.white, fontWeight: "600" },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "700" },
  storeInfo: { marginTop: 10, alignItems: "center" },
  storeName: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  storeLogo: { width: 80, height: 80, borderRadius: 10, marginBottom: 5 },
  joined: { fontSize: 14, color: Colors.darkGray, marginTop: 5 },
  productsSection: { paddingVertical: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  productCard: {
    width: 140,
    marginRight: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  productName: { fontSize: 14, fontWeight: "600" },
  productPrice: { fontSize: 14, fontWeight: "bold", color: Colors.primary },
  noProducts: {
    textAlign: "center",
    fontSize: 14,
    color: Colors.darkGray,
    paddingHorizontal: 15,
  },
});
