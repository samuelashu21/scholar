import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Linking, 
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { Colors } from "../../constants/Utils";
import { useGetSellerByIdQuery } from "../../slices/userAPiSlice";
import { useGetProductsQuery } from "../../slices/productsApiSlice";
import Rating from "../../components/Rating";
import { timeAgo } from "../../utils/timeAgo";
import { BASE_URL } from "../../constants/Urls";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux"; // Added
import { isSellerUser } from "../../constants/roles";

const { width } = Dimensions.get("window");
const columnWidth = (width - 48) / 2;

const SellerProfile = () => {
  const { sellerId } = useLocalSearchParams();
  const router = useRouter();

  // 1. Get logged-in user info
  const { userInfo } = useSelector((state) => state.auth);

  // 2. Check if this is the user's own profile
  const isMyProfile = userInfo?._id?.toString() === sellerId?.toString();

  // API Hooks
  const {
    data: seller,
    isLoading: sellerLoading,
    error: sellerError,
  } = useGetSellerByIdQuery(sellerId);
  const { data: productsData } = useGetProductsQuery({
    keyword: "",
    pageNumber: 1,
  });

  // Image URL Helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  // Filter products for this specific seller
  const sellerProducts = Array.isArray(productsData?.products)
    ? productsData.products.filter(
        (p) => p.user?._id === sellerId || p.user === sellerId,
      )
    : [];

  // Interaction Handlers
  const handleChat = () => {
    if (isMyProfile) return; // Guard clause
    router.push({
      pathname: "/ChatScreen",
      params: {
        receiverId: sellerId,
        receiverName: `${seller?.FirstName} ${seller?.LastName}`,
      },
    });
  };

  const handleCall = () => {
    if (seller?.phone) Linking.openURL(`tel:${seller.phone}`);
  };

  const handleEmail = () => {
    if (seller?.email) Linking.openURL(`mailto:${seller.email}`);
  };

  // Component for the Profile Header
  const ListHeader = () => (
    <View style={styles.headerContainer}>
      {/* Cover Backdrop */}
      <View style={styles.coverPhoto}>
        <Image
          source={{
            uri: getImageUrl(
              seller?.sellerProfile?.storeLogo || seller?.profileImage,
            ),
          }}
          blurRadius={15}
          style={styles.coverImage}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContent}>
        {/* Profile Image & Verified Badge */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: getImageUrl(seller?.profileImage) }}
            style={styles.profileImage}
          />
          {/* Green dot for online status - ideally powered by your socket state */}
          <View style={styles.onlineIndicator} />
          {isSellerUser(seller) && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={24}
                color={Colors.primary}
              />
            </View>
          )}
        </View>

        <Text style={styles.name}>
          {isMyProfile
            ? "You (Your Store)"
            : `${seller?.FirstName} ${seller?.LastName}`}
        </Text>
        <Text style={styles.storeNameText}>
          {seller?.sellerProfile?.storeName || "Premium Seller"}
        </Text>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {seller?.sellerProfile?.totalSales || 0}
            </Text>
            <Text style={styles.statLabel}>Sales</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Rating value={seller?.sellerProfile?.rating || 0} />
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {seller?.createdAt
                ? timeAgo(seller.createdAt).split(" ")[0]
                : "..."}
            </Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>

        {/* Bio/Description */}
        {seller?.sellerProfile?.storeDescription && (
          <Text style={styles.bioText} numberOfLines={3}>
            {seller.sellerProfile.storeDescription}
          </Text>
        )}

        {/* Action Buttons: HIDDEN IF VIEWING OWN PROFILE */}
        {!isMyProfile && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.chatAction} onPress={handleChat}>
              <Ionicons name="chatbubble-ellipses" size={20} color="white" />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconAction} onPress={handleCall}>
              <Ionicons name="call" size={20} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconAction} onPress={handleEmail}>
              <Ionicons name="mail" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Catalog</Text>
        <Text style={styles.itemCount}>{sellerProducts.length} Products</Text>
      </View>
    </View>
  );

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
        <Text style={styles.errorText}>Seller not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FBFBFB" }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <FlatList
        data={sellerProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="package-variant"
              size={50}
              color="#DDD"
            />
            <Text style={styles.noProducts}>
              This seller has no products yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/ProductScreen",
              params: { productId: item._id },
            }}
            asChild
          >
            <TouchableOpacity style={styles.card}>
              <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.cardImg}
              />
              <View style={styles.cardInfo}>
                <Text numberOfLines={1} style={styles.cardName}>
                  {item.name}
                </Text>
                <Text style={styles.cardPrice}>
                  ETB {item.price.toLocaleString()}
                </Text>

                {/* Quick Chat Icon: HIDDEN IF VIEWING OWN PROFILE */}
                {!isMyProfile && (
                  <TouchableOpacity
                    style={styles.quickChat}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({
                        pathname: "/ChatScreen",
                        params: {
                          receiverId: sellerId,
                          receiverName: `${seller?.FirstName} ${seller?.LastName}`,
                          productId: item._id,
                          productName: item.name,
                          productImage: item.image,
                          productPrice: item.price,
                        },
                      });
                    }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
};

export default SellerProfile;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: { backgroundColor: "#FBFBFB", marginBottom: 10 },
  coverPhoto: { height: 180, width: "100%", backgroundColor: "#333" },
  coverImage: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  backBtn: {
    marginTop: 50,
    marginLeft: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContent: {
    marginTop: -40,
    alignItems: "center",
    backgroundColor: "#FBFBFB",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 5,
    borderColor: "#FBFBFB",
    marginTop: -55,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    backgroundColor: "white",
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 55 },
  verifiedBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
  },
  name: { fontSize: 24, fontWeight: "800", color: "#1A1A1A", marginTop: 10 },
  storeNameText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statsContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
    elevation: 2,
    width: "100%",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 12, color: "#999", marginTop: 2 },
  statDivider: { width: 1, height: "80%", backgroundColor: "#EEE" },
  bioText: {
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginBottom: 25,
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "white",
  },
  chatAction: {
    flex: 2,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 54,
    borderRadius: 18,
    gap: 10,
  },
  iconAction: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: { color: "white", fontWeight: "bold", fontSize: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
  itemCount: { color: "#999", fontSize: 14, fontWeight: "500" },
  row: { paddingHorizontal: 16, justifyContent: "space-between" },
  card: {
    backgroundColor: "white",
    width: columnWidth,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 3,
    overflow: "hidden",
  },
  cardImg: { width: "100%", height: 170 },
  cardInfo: { padding: 12, position: "relative" },
  cardName: { fontSize: 14, color: "#444", fontWeight: "600" },
  cardPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 4,
  },
  quickChat: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "#F5F5F5",
    padding: 6,
    borderRadius: 10,
  },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  noProducts: { color: "#AAA", marginTop: 10, fontSize: 14 },
  errorText: { color: "red", marginBottom: 20 },
  backButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 10,
  },
});