import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import React from "react";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLogoutMutation } from "../../slices/userAPiSlice";
import { logout } from "../../slices/authSlice";
import { resetCart } from "../../slices/cartSlice";
import Message from "../../components/Message";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";

const  Account = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const router = useRouter();
  const [logoutApiCall] = useLogoutMutation();

  const handleLogin = () => router.push("/LoginScreen");

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
        <View style={styles.centeredContainer}>
          <Message variant="info">
            <Text style={styles.messageText}>
              Please{" "}
              <Text style={styles.loginLink} onPress={handleLogin}>
                login
              </Text>{" "}
              to view your Account
            </Text>
          </Message>
        </View>
      </SafeAreaView>
    );
  }

  const MenuItem = ({ icon, title, onPress, isLast }) => (
    <TouchableOpacity
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* -------- Account Header Card -------- */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{
                uri: userInfo.profileImage
                  ? getImageUrl(userInfo.profileImage)
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.userName}>
            {userInfo.name.split(" ")[0] || "User"}
          </Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>
          <Text style={styles.userEmail}>{userInfo.phone}</Text>
        </View>

        {/* -------- Menu List Card -------- */}
        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            title="Account Information"
            onPress={() => router.push("/AccountInformation")}
          />

          {!userInfo.isSeller && (
            <>
              <MenuItem
                icon="person-outline"
                title="Become a Seller"
                onPress={() => router.push("/(screens)/RequestToBeSeller")}
              />
              <MenuItem
                icon="document-text-outline"
                title="Orders"
                onPress={() => router.push("/orders")}
              />
              <MenuItem
                icon="cart-outline"
                title="Cart"
                onPress={() => router.push("/(screens)/Cart")}
              />
            </>
          )}

          {userInfo.isAdmin && (
            <>
              <MenuItem
                icon="cube-outline"
                title="Products"
                onPress={() => router.push("/admin/ProductListScreen")}
              />
              <MenuItem
                icon="layers-outline"
                title="Categories"
                onPress={() => router.push("/admin/CategoryScreen")}
              />
              <MenuItem
                icon="cube-outline"
                title="Seller Request List"
                onPress={() => router.push("/admin/SellerRequestListScreen")}
              />
              <MenuItem
                icon="list-outline"
                title="All Orders"
                onPress={() => router.push("/admin/OrderListScreen")}
              />
              <MenuItem
                icon="people-outline"
                title="Users"
                onPress={() => router.push("/admin/UserListScreen")}
              />
            </>
          )}

          {userInfo.isSeller && (
            <MenuItem
              icon="cube-outline"
              title="Products"
              onPress={() => router.push("/seller/SellerProductListScreen")}
            />
          )}

          <MenuItem
            icon="log-out-outline"
            title="Logout"
            onPress={logoutHandler}
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
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },

  scrollContent: {
    alignItems: "center",
    paddingVertical: 24,
  },

  /* ----------- Profile Card ----------- */
  profileCard: {
    width: "92%",
    backgroundColor: Colors.white,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },

  profileImageWrapper: {
    width: 105,
    height: 105,
    borderRadius: 60,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 14,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textColor,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 14,
    color: Colors.secondary,
  },

  /* ----------- Menu Card ----------- */
  menuCard: {
    width: "92%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },

  menuItemText: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textColor,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  messageText: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.textColor,
  },

  loginLink: {
    color: Colors.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
