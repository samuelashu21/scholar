

import {
  StyleSheet,
  Text,
  View, 
  Image,
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLogoutMutation } from "../../slices/userAPiSlice";
import { logout } from "../../slices/authSlice";
import { resetCart } from "../../slices/cartSlice";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";

const Account = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      router.replace("/");
    } catch (error) {
      console.log("logout error:", error);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  if (!userInfo) {
    return ( 
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.centeredContainer}>
          <View style={styles.loginCard}>
            {/* The Icon Container */}
            <View style={styles.guestIconContainer}>
              <Ionicons name="person-outline" size={50} color={Colors.primary} />
            </View>
            
            <Text style={styles.loginTitle}>Your Profile</Text>
            <Text style={styles.loginSubtitle}>
              Log in to see your orders, manage your wishlist, and enjoy a personalized shopping experience.
            </Text>
            
            {/* Redirects to the Entry Screen instead of just Login */}
            <TouchableOpacity  
              activeOpacity={0.8}
              style={styles.primaryBtn} 
              onPress={() => router.push({
                pathname: "/AuthEntryScreen",
                params: { redirect: "/account" } // Ensures they come back here after login
              })}
            >
              <Text style={styles.primaryBtnText}>Register / Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn}
              onPress={() => router.push("/")}
            >
              <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  } 

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const MenuItem = ({ icon, title, onPress, isLast, color = Colors.primary }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.menuItemText, color === '#FF4D4D' && { color: '#FF4D4D' }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ADB5BD" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.offWhite} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER PROFILE SECTION */}
        <View style={styles.headerContainer}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{
                uri: userInfo.profileImage
                  ? getImageUrl(userInfo.profileImage)
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>
        </View>

        {/* ACCOUNT SETTINGS */}
        <SectionHeader title="Account Settings" />
        <View style={styles.menuCard}>
          <MenuItem 
            icon="person-outline" 
            title="Personal Information" 
            onPress={() => router.push("/AccountInformation")} 
          />
          <MenuItem 
            icon="document-text-outline" 
            title="My Orders" 
            onPress={() => router.push("/orders")} 
          />
          <MenuItem 
            icon="heart-outline" 
            title="Wishlist" 
            onPress={() => router.push("/WishlistScreen")} 
          />
        </View>

        {/* SELLER SECTION */}
        {!userInfo.isAdmin && (
          <>
            <SectionHeader title="Selling" />
            <View style={styles.menuCard}>
              {userInfo.isSeller ? (
                <MenuItem 
                  icon="cube-outline" 
                  title="Seller Dashboard" 
                  onPress={() => router.push("/seller/SellerProductListScreen")} 
                />
              ) : (
                <MenuItem 
                  icon="storefront-outline" 
                  title="Become a Seller" 
                  onPress={() => router.push("/(screens)/RequestToBeSeller")} 
                />
              )}
            </View>
          </>
        )}

        {/* ADMIN SECTION */}
        {userInfo.isAdmin && (
          <>
            <SectionHeader title="Administrator Tools" />
            <View style={styles.menuCard}>
              <MenuItem icon="grid-outline" title="Manage Products" onPress={() => router.push("/admin/ProductListScreen")} />
              <MenuItem icon="grid-outline" title="Manage Categories" onPress={() => router.push("/admin/CategoryScreen")} />
              <MenuItem icon="list-circle-outline" title="Order Management" onPress={() => router.push("/admin/OrderListScreen")} />
              <MenuItem icon="people-outline" title="User Management" onPress={() => router.push("/admin/UserListScreen")} />
              <MenuItem icon="mail-unread-outline" title="Seller Requests" onPress={() => router.push("/admin/SellerRequestListScreen")} isLast />
            </View>
          </>
        )} 
 
        {/* LOGOUT */}
        <View style={[styles.menuCard, { marginTop: 20, marginBottom: 40 }]}>
          <MenuItem 
            icon="log-out-outline" 
            title="Log Out" 
            onPress={logoutHandler} 
            color="#FF4D4D" 
            isLast 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  
  /* Profile Styles */
  headerContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF",
    padding: 3,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 15,
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 50 },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F8F9FA",
  },
  userName: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
  userEmail: { fontSize: 14, color: "#6C757D", marginTop: 4 },

  /* Menu Styles */
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ADB5BD",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 5,
  },
  menuCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 25,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: { fontSize: 16, fontWeight: "600", color: "#343A40", marginLeft: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F3F5" },

  /* Login Prompt Styles */
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loginCard: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    elevation: 4,
  },
  loginTitle: { fontSize: 22, fontWeight: "800", marginTop: 15, color: "#1A1A1A" },
  loginSubtitle: { fontSize: 14, color: "#6C757D", textAlign: "center", marginVertical: 10 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});