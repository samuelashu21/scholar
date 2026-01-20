import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, Image, Platform } from "react-native";
import { Colors } from "../../constants/Utils";
import { useGetWishlistQuery } from "../../slices/wishlistApiSlice";
import { useGetMyChatsQuery } from "../../slices/chatApiSlice";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../constants/Urls";  
import { useEffect, useRef } from 'react';  
 
export default function TabLayout() {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);
 
 
  // 1. Fetch Wishlist & Chat data for badges
  const { data: wishlist } = useGetWishlistQuery();
  const wishlistCount = wishlist?.length || 0;

  const { data: conversations } = useGetMyChatsQuery(undefined, {
    skip: !userInfo,
    pollingInterval: 10000, 
  });

  // Calculate total unread messages
  const totalUnread = conversations?.reduce((sum, chat) => {
    const count = chat.messages?.filter(
      (m) => m.sender !== userInfo?._id && !m.isRead
    ).length || 0;
    return sum + count;
  }, 0) || 0;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };
 
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={27}
              name={focused ? "home" : "home-outline"}
              color={focused ? Colors.primary : Colors.secondary}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="shop" 
        options={{
          title: "Shop",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={27}
              name={focused ? "grid" : "grid-outline"}
              color={focused ? Colors.primary : Colors.secondary}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wishlistScreen"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="bookmark-outline" size={size} color={color} />
              {wishlistCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{wishlistCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen 
        name="ChatListScreen"   
        options={{
          title: "Chat",
          tabBarIcon: ({ focused, color }) => (
            <View>  
              <Ionicons 
                size={26}
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                color={color}
              />
              {totalUnread > 0 && (
                <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.badgeText}>{totalUnread > 9 ? '9+' : totalUnread}</Text>
                </View>
              )}
            </View>
          ), 
        }}
      /> 

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={27}
              name={focused ? "bag-check" : "bag-check-outline"}
              color={focused ? Colors.primary : Colors.secondary}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused }) => {
            if (userInfo?.profileImage) {
              return (
                <View style={{
                    borderWidth: focused ? 2 : 0,
                    borderColor: Colors.primary,
                    borderRadius: 20,
                    padding: 2,
                  }}>
                  <Image
                    source={{ uri: getImageUrl(userInfo.profileImage) }}
                    style={{ width: 28, height: 28, borderRadius: 14 }}
                  />
                </View>
              );
            }
            return (
              <Ionicons
                size={27}
                name={focused ? "person" : "person-outline"}
                color={focused ? Colors.primary : Colors.secondary}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = {
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'white'
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800",
  }
};