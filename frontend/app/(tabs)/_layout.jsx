import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors, Layout, Radius, Shadows, Spacing, Typography, resolveImageUrl } from "../../constants/Utils";
import { useGetWishlistQuery } from "../../slices/wishlistApiSlice";
import { useGetMyChatsQuery } from "../../slices/chatApiSlice";
import { useSelector } from "react-redux";

export default function TabLayout() {
  const { userInfo } = useSelector((state) => state.auth);

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

  const TabIcon = ({ focused, name, activeName, color, badge }) => (
    <View style={styles.iconWrap}>
      <View style={[styles.iconInner, focused && styles.iconInnerActive]}>
        <Ionicons size={20} name={focused ? activeName : name} color={color} />
      </View>
      {!!badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} name="home-outline" activeName="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} name="grid-outline" activeName="grid" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="wishlistScreen"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              name="bookmark-outline"
              activeName="bookmark"
              color={color}
              badge={wishlistCount}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ChatListScreen"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              name="chatbubbles-outline"
              activeName="chatbubbles"
              color={color}
              badge={totalUnread}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} name="bag-check-outline" activeName="bag-check" color={color} />
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
                <View style={[styles.profileWrap, focused && styles.profileWrapActive]}>
                  <Image
                    source={{ uri: resolveImageUrl(userInfo.profileImage) }}
                    style={styles.profileImage}
                  />
                </View>
              );
            }
            return (
              <TabIcon
                focused={focused}
                name="person-outline"
                activeName="person"
                color={color}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Layout.tabBarHeight,
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    ...Shadows.md,
  },
  tabBarLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 36,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInnerActive: {
    backgroundColor: Colors.infoLight,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -9,
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
    borderRadius: Radius.pill,
    padding: 2,
  },
  profileWrapActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
