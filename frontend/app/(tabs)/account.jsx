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
import { isAdminUser, isSellerUser } from "../../constants/roles";

const Account = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = isAdminUser(userInfo);
  const isSeller = isSellerUser(userInfo);

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

    return imagePath.startsWith("http")
      ? imagePath
      : `${BASE_URL}${imagePath}`;
  };

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const MenuItem = ({
    icon,
    title,
    onPress,
    isLast,
    color = Colors.primary,
  }) => (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: `${color}15`,
            },
          ]}
        >
          <Ionicons name={icon} size={22} color={color} />
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.menuItemText,
            color === "#FF4D4D" && { color: "#FF4D4D" },
          ]}
        >
          {title}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!userInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F4F6F8"
        />

        <View style={styles.centeredContainer}>
          <View style={styles.loginCard}>
            <View style={styles.guestIconContainer}>
              <Ionicons
                name="person-outline"
                size={50}
                color={Colors.primary}
              />
            </View>

            <Text style={styles.loginTitle}>
              Your Profile
            </Text>

            <Text style={styles.loginSubtitle}>
              Log in to see your orders, manage your
              wishlist, and enjoy a personalized shopping
              experience.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.primaryBtn}
              onPress={() =>
                router.push({
                  pathname: "/AuthEntryScreen",
                  params: {
                    redirect: "/account",
                  },
                })
              }
            >
              <Text style={styles.primaryBtnText}>
                Register / Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push("/")}
            >
              <Text style={styles.secondaryBtnText}>
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // =========================
  // LOGGED IN
  // =========================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F6F8"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================
            PROFILE HEADER
        ========================== */}

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
              <Ionicons
                name="camera"
                size={16}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {userInfo.name}
          </Text>

          <Text style={styles.userEmail}>
            {userInfo.email}
          </Text>

          <Text style={styles.welcomeText}>
            Welcome back 👋
          </Text>
        </View>

        {/* =========================
            QUICK STATS
        ========================== */}

        <View style={styles.quickStatsContainer}>
          <View style={styles.quickCard}>
            <Ionicons
              name="bag-handle-outline"
              size={22}
              color={Colors.primary}
            />

            <Text style={styles.quickNumber}>12</Text>

            <Text style={styles.quickLabel}>Orders</Text>
          </View>

          <View style={styles.quickCard}>
            <Ionicons
              name="heart-outline"
              size={22}
              color="#FF4D6D"
            />

            <Text style={styles.quickNumber}>5</Text>

            <Text style={styles.quickLabel}>Wishlist</Text>
          </View>
        </View>

        {/* =========================
            ACCOUNT SETTINGS
        ========================== */}

        <SectionHeader title="Account Settings" />

        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            title="Personal Information"
            onPress={() =>
              router.push("/AccountInformation")
            }
          />

          <MenuItem
            icon="document-text-outline"
            title="My Orders"
            onPress={() => router.push("/orders")}
          />

          <MenuItem
            icon="heart-outline"
            title="Wishlist"
            onPress={() =>
              router.push("/WishlistScreen")
            }
            isLast
          />
        </View>

        {/* =========================
            SELLER SECTION
        ========================== */}

        {!isAdmin && (
          <>
            <SectionHeader title="Selling" />

            <View style={styles.menuCard}>
              {isSeller ? (
                <MenuItem
                  icon="cube-outline"
                  title="Seller Dashboard"
                  onPress={() =>
                    router.push(
                      "/sellerDashboard"
                    )
                  }
                  isLast
                />
              ) : (
                <MenuItem
                  icon="storefront-outline"
                  title="Become a Seller"
                  onPress={() =>
                    router.push(
                      "/(screens)/RequestToBeSeller"
                    )
                  }
                  isLast
                />
              )}
            </View>
          </>
        )}

        {/* =========================
            ADMIN SECTION
        ========================== */}

        {isAdmin && (
          <>
            <SectionHeader title="Administrator Tools" />

            <View style={styles.menuCard}>
              <MenuItem
                icon="speedometer-outline"
                title="Dashboard Overview"
                onPress={() =>
                  router.push(
                    "/admin/DashboardScreen"
                  )
                }
              />

              <MenuItem
                icon="grid-outline"
                title="Manage Products"
                onPress={() =>
                  router.push(
                    "/admin/ProductListScreen"
                  )
                }
              />

              <MenuItem
                icon="layers-outline"
                title="Manage Categories"
                onPress={() =>
                  router.push(
                    "/admin/CategoryScreen"
                  )
                }
              />

              <MenuItem
                icon="list-circle-outline"
                title="Order Management"
                onPress={() =>
                  router.push(
                    "/admin/OrderListScreen"
                  )
                }
              />

              <MenuItem
                icon="people-outline"
                title="User Management"
                onPress={() =>
                  router.push(
                    "/admin/UserListScreen"
                  )
                }
              />

              <MenuItem
                icon="mail-unread-outline"
                title="Seller Requests"
                onPress={() =>
                  router.push(
                    "/admin/SellerRequestListScreen"
                  )
                }
                isLast
              />
            </View>
          </>
        )}

        {/* =========================
            LOGOUT
        ========================== */}

        <View
          style={{
            marginTop: 10,
            marginBottom: 40,
          }}
        >
          <View style={styles.menuCard}>
            <MenuItem
              icon="log-out-outline"
              title="Log Out"
              color="#FF4D4D"
              onPress={logoutHandler}
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : 0,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  /* =========================
     HEADER / PROFILE
  ========================== */

  headerContainer: {
    alignItems: "center",
    paddingVertical: 30,
    marginTop: 10,
    marginBottom: 10,
  },

  profileImageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "#FFF",
    padding: 4,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 8,
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },

  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 3,
    borderColor: "#FFF",
  },

  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginTop: 16,
  },

  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  welcomeText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },

  /* =========================
     QUICK STATS
  ========================== */

  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 12,
  },

  quickCard: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  quickNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },

  quickLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  /* =========================
     SECTION TITLE
  ========================== */

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 4,
  },

  /* =========================
     MENU CARD
  ========================== */

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 20,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#EEF1F4",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  /* =========================
     MENU ITEM
  ========================== */

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingVertical: 18,
    paddingHorizontal: 18,

    backgroundColor: "#FFFFFF",
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",
  },

  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 14,
    flexShrink: 1,
  },

  /* =========================
     LOGIN SCREEN
  ========================== */

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F4F6F8",
  },

  loginCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 30,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 6,
  },

  guestIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },

  loginTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginTop: 20,
  },

  loginSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },

  /* =========================
     BUTTONS
  ========================== */

  primaryBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 25,
    alignItems: "center",

    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 14,
    alignItems: "center",

    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  secondaryBtnText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
}); 
