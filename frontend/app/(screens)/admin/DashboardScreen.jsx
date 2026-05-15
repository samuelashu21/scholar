import React, { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Utils";
import { useGetOrdersQuery } from "../../../slices/ordersApiSlice";
import { useGetUsersQuery, useGetSellerRequestsQuery } from "../../../slices/userAPiSlice";
import { useGetProductsQuery } from "../../../slices/productsApiSlice";

const SummaryCard = ({ icon, label, value, tone = "default" }) => (
  <View style={[styles.summaryCard, tone === "accent" && styles.summaryCardAccent]}>
    <View style={styles.summaryTopRow}>
      <View style={[styles.iconWrap, tone === "accent" && styles.iconWrapAccent]}>
        <Ionicons name={icon} size={18} color={tone === "accent" ? "#fff" : Colors.primary} />
      </View>
      <Text style={[styles.summaryValue, tone === "accent" && { color: "#fff" }]}>{value}</Text>
    </View>
    <Text style={[styles.summaryLabel, tone === "accent" && { color: "#FEE2E2" }]}>{label}</Text>
  </View>
);

const Bar = ({ label, value, max, color }) => {
  const width = max > 0 ? Math.max(8, (value / max) * 100) : 0;
  return (
    <View style={styles.barRow}>
      <View style={styles.barMeta}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barCount}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${width}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

export default function DashboardScreen() {
  const router = useRouter();

  const { data: orders, isLoading: loadingOrders } = useGetOrdersQuery();
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();
  const { data: sellerRequests, isLoading: loadingSellers } = useGetSellerRequestsQuery();
  const { data: productData, isLoading: loadingProducts } = useGetProductsQuery({
    pageNumber: 1,
    keyword: "",
    sort: "-createdAt",
  });

  const loading = loadingOrders || loadingUsers || loadingSellers || loadingProducts;

  const stats = useMemo(() => {
    const orderList = orders || [];
    const userList = users || [];
    const products = productData?.products || [];
    const sellerList = sellerRequests || [];

    const totalRevenue = orderList.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const paidOrders = orderList.filter((item) => item.isPaid).length;
    const deliveredOrders = orderList.filter((item) => item.isDelivered).length;
    const pendingOrders = Math.max(orderList.length - deliveredOrders, 0);

    const admins = userList.filter((item) => item.isAdmin).length;
    const sellers = userList.filter((item) => item.isSeller).length;

    const approvedSellers = sellerList.filter(
      (item) => item.sellerRequest?.status === "approved"
    ).length;
    const pendingSellerRequests = sellerList.filter(
      (item) => (item.sellerRequest?.status || "pending") === "pending"
    ).length;

    const lowStock = products.filter((item) => Number(item.countInStock || 0) <= 5);

    const recentOrders = [...orderList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      orders: orderList.length,
      revenue: totalRevenue,
      paidOrders,
      deliveredOrders,
      pendingOrders,
      users: userList.length,
      admins,
      sellers,
      approvedSellers,
      pendingSellerRequests,
      products: productData?.total || products.length,
      lowStock,
      recentOrders,
      chartMax: Math.max(paidOrders, deliveredOrders, pendingOrders, 1),
    };
  }, [orders, users, sellerRequests, productData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/account")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={23} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => router.push("/admin/OrderListScreen")} style={styles.menuButton}>
          <Ionicons name="list" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.grid}>
          <SummaryCard icon="receipt-outline" label="Orders" value={stats.orders} tone="accent" />
          <SummaryCard icon="cash-outline" label="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
          <SummaryCard icon="cube-outline" label="Products" value={stats.products} />
          <SummaryCard icon="people-outline" label="Users" value={stats.users} />
        </View>

        <View style={styles.grid}>
          <SummaryCard icon="person-circle-outline" label="Sellers" value={stats.sellers} />
          <SummaryCard icon="shield-checkmark-outline" label="Approved Sellers" value={stats.approvedSellers} />
          <SummaryCard icon="time-outline" label="Pending Requests" value={stats.pendingSellerRequests} />
          <SummaryCard icon="warning-outline" label="Low Stock Items" value={stats.lowStock.length} />
        </View>

        <Text style={styles.sectionTitle}>Order Analytics</Text>
        <View style={styles.panel}>
          <Bar label="Paid" value={stats.paidOrders} max={stats.chartMax} color="#2563EB" />
          <Bar label="Delivered" value={stats.deliveredOrders} max={stats.chartMax} color="#16A34A" />
          <Bar label="Pending" value={stats.pendingOrders} max={stats.chartMax} color="#F59E0B" />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push("/admin/ProductListScreen")}>
            <Ionicons name="pricetags-outline" size={16} color={Colors.primary} />
            <Text style={styles.quickActionText}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push("/admin/UserListScreen")}>
            <Ionicons name="people-outline" size={16} color={Colors.primary} />
            <Text style={styles.quickActionText}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push("/admin/SellerRequestListScreen")}>
            <Ionicons name="mail-open-outline" size={16} color={Colors.primary} />
            <Text style={styles.quickActionText}>Seller Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push("/admin/CategoryScreen")}>
            <Ionicons name="layers-outline" size={16} color={Colors.primary} />
            <Text style={styles.quickActionText}>Categories</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <View style={styles.panel}>
          {stats.recentOrders.length === 0 ? (
            <Text style={styles.emptyText}>No recent orders</Text>
          ) : (
            stats.recentOrders.map((order) => (
              <View key={order._id} style={styles.listRow}>
                <View>
                  <Text style={styles.rowTitle}>#{order._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.rowSubtitle}>{order.user?.name || "Customer"}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.rowAmount}>${Number(order.totalPrice || 0).toFixed(2)}</Text>
                  <Text style={[styles.statusTag, order.isDelivered ? styles.statusSuccess : styles.statusPending]}>
                    {order.isDelivered ? "Delivered" : "In Progress"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
        <View style={styles.panel}>
          {stats.lowStock.length === 0 ? (
            <Text style={styles.emptyText}>All listed products have healthy stock levels.</Text>
          ) : (
            stats.lowStock.slice(0, 6).map((item) => (
              <View key={item._id} style={styles.alertRow}>
                <View style={styles.alertDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.rowSubtitle}>
                    {item.category?.categoryname || "General"}
                  </Text>
                </View>
                <Text style={styles.stockText}>{item.countInStock ?? 0} left</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  content: { padding: 16, paddingBottom: 26 },
  sectionTitle: {
    fontSize: 13,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.7,
    marginBottom: 10,
    marginTop: 6,
  },
  grid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  summaryCardAccent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapAccent: { backgroundColor: "rgba(255,255,255,0.2)" },
  summaryLabel: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  summaryValue: { fontSize: 17, color: "#111827", fontWeight: "800" },
  panel: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  barRow: { marginBottom: 12 },
  barMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  barLabel: { color: "#374151", fontSize: 12, fontWeight: "600" },
  barCount: { color: "#111827", fontSize: 12, fontWeight: "700" },
  barTrack: { height: 8, backgroundColor: "#F3F4F6", borderRadius: 99 },
  barFill: { height: 8, borderRadius: 99 },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  quickActionBtn: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickActionText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },
  rowSubtitle: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  rowAmount: { fontSize: 13, fontWeight: "700", color: "#111827" },
  statusTag: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
  statusSuccess: { color: "#166534", backgroundColor: "#DCFCE7" },
  statusPending: { color: "#9A3412", backgroundColor: "#FFEDD5" },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  alertDot: { width: 8, height: 8, borderRadius: 99, backgroundColor: "#F59E0B" },
  stockText: { fontSize: 12, color: "#B45309", fontWeight: "700" },
  emptyText: { color: "#6B7280", fontSize: 12, textAlign: "center", paddingVertical: 8 },
});
