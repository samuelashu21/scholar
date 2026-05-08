// import {
//   StyleSheet,
//   Text,
//   View,
//   ActivityIndicator,
//   FlatList,
//   TouchableOpacity,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { useRouter } from "expo-router"; 
// import React from "react";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { useGetOrdersQuery } from "../../../slices/ordersApiSlice";
// import Message from "../../../components/Message";
// import { Colors } from "../../../constants/Utils";
// import Ionicons from "@expo/vector-icons/Ionicons";

// const OrderListScreen = () => {
//   const { data: orders, isLoading, error } = useGetOrdersQuery();

//   const router = useRouter();

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={Colors.primary} />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={[styles.container, styles.messageContainer]}>
//         <Message variant="error">
//           <Text style={styles.messageText}>
//             {error?.data?.message || error.error}
//           </Text>
//         </Message>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//          <TouchableOpacity
//                     onPress={() => router.push("../../account")}
//                     style={styles.backButton}
//                   >
//                     <Ionicons name="chevron-back" size={28} color={Colors.primary} />
//                   </TouchableOpacity>
//         <Text style={styles.title}>Orders</Text>
 
//         <View style={styles.tableHeader}>
//           <Text style={[styles.headerCell, { flex: 0.5 }]}>#</Text>
//           <Text style={[styles.headerCell, { flex: 1.5 }]}>User</Text>
//           <Text style={[styles.headerCell, { flex: 1.5 }]}>Paid</Text>
//           <Text style={[styles.headerCell, { flex: 1.5 }]}>Delivered</Text>
//           <Text style={[styles.headerCell, { flex: 1 }]}>View</Text>
//         </View>

//         <FlatList
//           data={orders}
//           keyExtractor={(item) => item._id}
//           contentContainerStyle={{ paddingBottom: 20 }}
//           renderItem={({ item: order, index }) => (
//             <View style={styles.tableRow}>
//               <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
//               <Text style={[styles.cell, { flex: 1.5 }]} numberOfLines={1}>
//                 {order.user && order.user.name}
//               </Text>

//               <View style={[styles.cell, { flex: 1.5 }]}>
//                 {order.isPaid ? (
//                   <Text style={styles.statusTextSuccess}>
//                     {order.paidAt.substring(0, 10)}
//                   </Text>
//                 ) : (
//                   <FontAwesome name="times" size={16} color={Colors.textRed} />
//                 )}
//               </View>

//               <View style={[styles.cell, { flex: 1.5 }]}>
//                 {order.isDelivered ? (
//                   <Text style={styles.statusTextSuccess}>
//                     {order.deliveredAt.substring(0, 10)}
//                   </Text>
//                 ) : (
//                   <FontAwesome name="times" color={Colors.textRed} size={16} />
//                 )}
//               </View>

//               <TouchableOpacity
//                 style={[styles.cell, { flex: 0.5 }]}
//                 onPress={() =>
//                   router.push({
//                     pathname: "(screens)/OrderScreen",
//                     params: { orderId: order._id },
//                   })
//                 }
//               >
//                 <FontAwesome name="eye" size={18} color={Colors.primary} />
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default OrderListScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: Colors.offWhite,
//     paddingTop: Platform.OS === "android" ? 20 : 0,
//   },
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: Colors.offWhite,
//   },
//   messageContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: Colors.primary,
//     textAlign: "start",
//     margin: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   messageText: {
//     fontSize: 16,
//     textAlign: "center",
//     color: Colors.textColor,
//   },
//   tableHeader: {
//     flexDirection: "row",
//     backgroundColor: Colors.lightGray,
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 6,
//   },
//   headerCell: {
//     fontWeight: "bold",
//     fontSize: 12,
//     textAlign: "center",
//     color: Colors.secondaryTextColor,
//   },
//   tableRow: {
//     flexDirection: "row",
//     backgroundColor: Colors.white,
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     elevation: 2,
//     alignItems: "center",
//   },
//   cell: {
//     fontSize: 12,
//     textAlign: "center",
//     color: Colors.textColor,
//   },
//   statusTextSuccess:{
//     color:Colors.success,
//     fontWeight:"500",
//     fontSize: 12,
//   }
// });


import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import React from "react";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useGetOrdersQuery } from "../../../slices/ordersApiSlice";
import Message from "../../../components/Message";
import { Colors } from "../../../constants/Utils";

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push("/account")} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {error ? (
        <View style={{ padding: 20 }}>
          <Message variant="error">{error?.data?.message || error.error}</Message>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: order, index }) => (
            <View style={styles.orderCard}>
              {/* CARD TOP: INDEX & VIEW BUTTON */}
              <View style={styles.cardHeader}>
                <View style={styles.orderNumberBadge}>
                  <Text style={styles.orderNumberText}>#{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() =>
                    router.push({
                      pathname: "(screens)/OrderScreen",
                      params: { orderId: order._id },
                    })
                  }
                >
                  <Text style={styles.viewBtnText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {/* USER INFO */}
              <View style={styles.userInfo}>
                <Text style={styles.userLabel}>Customer</Text>
                <Text style={styles.userName}>{order.user?.name || "Guest User"}</Text>
              </View>

              <View style={styles.divider} />

              {/* STATUS SECTION */}
              <View style={styles.statusContainer}>
                {/* PAID STATUS */}
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Order Status</Text>
                  <View style={[styles.badge, styles.badgePaid]}>
                    <FontAwesome name="history" size={12} color="#228BE6" />
                    <Text style={styles.badgeTextPaid}>
                      {(order.status || (order.isDelivered ? "delivered" : order.isPaid ? "confirmed" : "pending"))
                        .replaceAll("_", " ")
                        .toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* PAYMENT STATUS */}
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Payment</Text>
                  {order.isPaid ? (
                    <View style={[styles.badge, styles.badgePaid]}>
                      <FontAwesome name="check-circle" size={12} color="#228BE6" />
                      <Text style={styles.badgeTextPaid}>{order.paidAt?.substring?.(0, 10) || "Paid"}</Text>
                    </View>
                  ) : (
                    <View style={[styles.badge, styles.badgePending]}>
                      <FontAwesome name="clock-o" size={12} color="#FA5252" />
                      <Text style={styles.badgeTextPending}>Pending</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default OrderListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: { padding: 16, paddingBottom: 30 },
  orderCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  orderNumberBadge: {
    backgroundColor: "#F1F3F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderNumberText: { fontSize: 12, fontWeight: "800", color: "#495057" },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "700",
    marginRight: 4,
  },
  userInfo: { marginBottom: 12 },
  userLabel: { fontSize: 10, fontWeight: "700", color: "#ADB5BD", marginBottom: 2, textTransform: 'uppercase' },
  userName: { fontSize: 16, fontWeight: "700", color: "#212529" },
  divider: { height: 1, backgroundColor: "#F1F3F5", marginBottom: 12 },
  statusContainer: { flexDirection: "row", justifyContent: "space-between" },
  statusItem: { flex: 0.48 },
  statusLabel: { fontSize: 10, fontWeight: "700", color: "#ADB5BD", marginBottom: 6, textTransform: 'uppercase' },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  badgePaid: { backgroundColor: "#E7F5FF" },
  badgeDelivered: { backgroundColor: "#EBFAEB" },
  badgePending: { backgroundColor: "#FFF5F5" },
  badgeTextPaid: { color: "#228BE6", fontSize: 11, fontWeight: "700" },
  badgeTextDelivered: { color: "#40C057", fontSize: 11, fontWeight: "700" },
  badgeTextPending: { color: "#FA5252", fontSize: 11, fontWeight: "700" },
});
