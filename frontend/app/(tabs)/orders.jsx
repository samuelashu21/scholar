import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  FlatList,  
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, useFocusEffect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useGetMyOrdersQuery } from "../../slices/ordersApiSlice";
import { Colors } from "../../constants/Utils";
import Message from "../../components/Message";

const orders = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const { data: orders, isLoading, error, refetch } = useGetMyOrdersQuery();

  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleLoginPress = () => {
    router.push("/LoginScreen");
  };

  if (!userInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.messageContainer]}>
          <Message variant="info">
            <Text style={styles.messageText}>
              Please
              <Text style={styles.loginLink} onPress={handleLoginPress}>
                Login
              </Text>
              to see your orders
            </Text>
          </Message>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (orders && orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.messageContainer]}>
          <Message variant="info">
            <Text style={styles.messageText}>Yo have not any orders yet</Text>
          </Message>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>My Orders</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 1 }]}>#</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Total</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Paid</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>View</Text>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item: order, index }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>
                ${order.totalPrice}
              </Text>
              <View
                style={[
                  styles.cell,
                  {
                    flex: 2,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                {order.isPaid ? (
                  <Text style={styles.statusTextSuccess}>
                    {order.paidAt.substring(0, 10)}
                  </Text>
                ) : (
                  <FontAwesome name="times" size={16} color={Colors.textRed} />
                )}
              </View>
              <TouchableOpacity
                style={[styles.cell, { flex: 1 }]}
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

export default orders;

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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.textColor,
  },
  loginLink: {
    color: Colors.primary,
    textDecorationLine: "underline",
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
    fontSize: 14,
    textAlign: "center",
    color: Colors.secondaryTextColor,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  cell: {
    fontSize: 12,
    textAlign: "center",
    color: Colors.textColor,
  },
  statusTextSuccess: {
    color: Colors.success,
    fontWeight: 500,
  },
});
