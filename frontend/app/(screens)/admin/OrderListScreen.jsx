import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router"; 
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useGetOrdersQuery } from "../../../slices/ordersApiSlice";
import Message from "../../../components/Message";
import { Colors } from "../../../constants/Utils";

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.messageContainer]}>
        <Message variant="error">
          <Text style={styles.messageText}>
            {error?.data?.message || error.error}
          </Text>
        </Message>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Orders</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 0.5 }]}>#</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>User</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Paid</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Delivered</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>View</Text>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item: order, index }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={[styles.cell, { flex: 1.5 }]} numberOfLines={1}>
                {order.user && order.user.name}
              </Text>

              <View style={[styles.cell, { flex: 1.5 }]}>
                {order.isPaid ? (
                  <Text style={styles.statusTextSuccess}>
                    {order.paidAt.substring(0, 10)}
                  </Text>
                ) : (
                  <FontAwesome name="times" size={16} color={Colors.textRed} />
                )}
              </View>

              <View style={[styles.cell, { flex: 1.5 }]}>
                {order.isDelivered ? (
                  <Text style={styles.statusTextSuccess}>
                    {order.deliveredAt.substring(0, 10)}
                  </Text>
                ) : (
                  <FontAwesome name="times" color={Colors.textRed} size={16} />
                )}
              </View>

              <TouchableOpacity
                style={[styles.cell, { flex: 0.5 }]}
                onPress={() =>
                  router.push({
                    pathname: "(screens)/OrderScreen",
                    params: { orderId: order._id },
                  })
                }
              >
                <FontAwesome name="eye" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default OrderListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.offWhite,
  },
  messageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "start",
    margin: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.textColor,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    color: Colors.secondaryTextColor,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
    alignItems: "center",
  },
  cell: {
    fontSize: 12,
    textAlign: "center",
    color: Colors.textColor,
  },
  statusTextSuccess:{
    color:Colors.success,
    fontWeight:"500",
    fontSize: 12,
  }
});
