import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, Image } from "react-native";
import { Colors } from "../../constants/Utils";

import { useGetWishlistQuery } from "../../slices/wishlistApiSlice";
 
import { useSelector, useDispatch } from "react-redux";
import { BASE_URL } from "../../constants/Urls";

export default function TabLayout() {
  // Fetch wishlist data
  const { data: wishlist } = useGetWishlistQuery();

  const wishlistCount = wishlist?.length || 0;

  const { userInfo } = useSelector((state) => state.auth);


  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  return (
    <Tabs screenOptions={{ headerShown: false }}>
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
          title: "shop",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={27}
              name={focused ? "grid" : "grid-outline"}
              color={focused ? Colors.primary : Colors.secondary}
            />
          ),
        }}
      />

      {/* ❤️ WISHLIST TAB WITH BADGE */}
      <Tabs.Screen
        name="wishlistScreen"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="bookmark-outline" size={size} color={color} />

              {/* 🔴 Badge */}
              {wishlistCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -10,
                    backgroundColor: "red",
                    borderRadius: 10,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {wishlistCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "orders",
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
  name="profile"
  options={{
    title: "Profile",
    tabBarIcon: ({ focused }) => {
      if (userInfo?.profileImage) {
        return (
          <View
            style={{
              borderWidth: focused ? 2 : 0,
              borderColor: Colors.primary,
              borderRadius: 20,
              padding: 2,
            }}
          >
            <Image
              source={{ uri: getImageUrl(userInfo.profileImage) }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
              }}
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
