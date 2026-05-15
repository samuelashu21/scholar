import { useMemo } from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Layout, Radius, Shadows, Spacing, Typography } from "../../constants/Utils";
import { useGetWishlistQuery } from "../../slices/wishlistApiSlice";
import { useGetMyChatsQuery } from "../../slices/chatApiSlice";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../constants/Urls";

const MIN_TOUCH_TARGET = 44;
const BASE_TAB_BAR_HEIGHT = 64;
const TAB_BAR_ITEM_MIN_HEIGHT = 56;
const ICON_WRAP_WIDTH = 52;
const ICON_WRAP_MIN_HEIGHT = 48;

const getTabBarLayout = (bottomInset) => {
  const horizontalInset = Layout.isSmallDevice ? Spacing.md : Spacing.lg;
  const safeBottom = Math.max(bottomInset, Spacing.sm);

  return {
    left: horizontalInset,
    right: horizontalInset,
    bottom: Math.max(Math.min(bottomInset, Spacing.md), Spacing.sm),
    height: BASE_TAB_BAR_HEIGHT + safeBottom,
    paddingTop: Spacing.sm,
    paddingBottom: safeBottom,
  };
};

const TabIcon = ({ focused, badge, children }) => (
  <View style={styles.iconWrap}>
    <View style={[styles.iconInner, focused && styles.iconInnerActive]}>{children}</View>
    {!!badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
      </View>
    )}
  </View>
);

export default function TabLayout() {
  const { userInfo } = useSelector((state) => state.auth);
  const insets = useSafeAreaInsets();

  const { data: wishlist } = useGetWishlistQuery();
  const wishlistCount = wishlist?.length || 0;

  const { data: conversations } = useGetMyChatsQuery(undefined, {
    skip: !userInfo,
    pollingInterval: 10000,
  });

  const totalUnread =
    conversations?.reduce((sum, chat) => {
      const count =
        chat.messages?.filter((m) => m.sender !== userInfo?._id && !m.isRead).length || 0;
      return sum + count;
    }, 0) || 0;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  const tabBarStyle = useMemo(() => [styles.tabBar, getTabBarLayout(insets.bottom)], [insets.bottom]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarHideOnKeyboard: true,
        tabBarStyle: tabBarStyle,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Ionicons size={20} name={focused ? "home" : "home-outline"} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Ionicons size={20} name={focused ? "grid" : "grid-outline"} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="wishlistScreen"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} badge={wishlistCount}>
              <Ionicons size={20} name={focused ? "bookmark" : "bookmark-outline"} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="ChatListScreen"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} badge={totalUnread}>
              <Ionicons size={20} name={focused ? "chatbubbles" : "chatbubbles-outline"} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Ionicons size={20} name={focused ? "bag-check" : "bag-check-outline"} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused, color }) => {
            if (userInfo?.profileImage) {
              return (
                <TabIcon focused={focused}>
                  <View style={[styles.profileWrap, focused && styles.profileWrapActive]}>
                    <Image
                      source={{ uri: getImageUrl(userInfo.profileImage) }}
                      style={styles.profileImage}
                    />
                  </View>
                </TabIcon>
              );
            }
            return (
              <TabIcon focused={focused}>
                <Ionicons size={20} name={focused ? "person" : "person-outline"} color={color} />
              </TabIcon>
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.sm,
    ...Shadows.lg,
  },
  tabBarItem: {
    minHeight: TAB_BAR_ITEM_MIN_HEIGHT,
    paddingVertical: Spacing.xs,
  },
  tabBarLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    marginTop: Spacing.xs,
  },
  iconWrap: {
    width: ICON_WRAP_WIDTH,
    minHeight: ICON_WRAP_MIN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },
  iconInnerActive: {
    backgroundColor: Colors.infoLight,
  },
  badge: {
    position: "absolute",
    top: 3,
    right: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: Typography.weight.bold,
  },
  profileWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceMuted,
  },
  profileWrapActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});
