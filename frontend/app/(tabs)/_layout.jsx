import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Colors } from "../../constants/Utils";
 
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "",
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
        name="orders"
        options={{
          title: "",
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
          title: "",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={27}
              name={focused ? "person" : "person-outline"}
              color={focused ? Colors.primary : Colors.secondary}
            />
          ),  
        }}
      /> 
    </Tabs>
  );
} 