import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";
import { useGetMyProductsQuery } from "../../slices/productsApiSlice";

const StatCard = ({ label, value, icon, color = Colors.primary }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconWrap, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function SellerDashboard() {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  const { data, isLoading } = useGetMyProductsQuery({
    pageNumber: 1,
    keyword: "",
    sort: "-createdAt",
  });

  const status = userInfo?.sellerRequest?.status || "pending";
  const storeName = userInfo?.sellerProfile?.storeName || "Your Store";
  const subscriptionType = userInfo?.sellerRequest?.subscriptionType || "free";
  const subscriptionEnd = userInfo?.sellerRequest?.subscriptionEnd
    ? new Date(userInfo.sellerRequest.subscriptionEnd)
    : null;
  const now = new Date();
  const remainingDays = subscriptionEnd
    ? Math.max(0, Math.ceil((subscriptionEnd - now) / (1000 * 60 * 60 * 24)))
    : 0;

  const metrics = useMemo(() => {
    const products = data?.products || [];
    const lowStock = products.filter((item) => Number(item.countInStock || 0) <= 5);
    const outOfStock = products.filter((item) => Number(item.countInStock || 0) === 0);
    const totalReviews = products.reduce((sum, item) => sum + Number(item.numReviews || 0), 0);
    const averageRating = products.length
      ? (
          products.reduce((sum, item) => sum + Number(item.rating || 0), 0) / products.length
        ).toFixed(1)
      : "0.0";

    const topByViews = [...products]
      .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
      .slice(0, 5);

    return {
      products,
      lowStock,
      outOfStock,
      totalReviews,
      averageRating,
      topByViews,
      total: data?.total || products.length,
    };
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/account")} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <TouchableOpacity
          onPress={() => router.push("/seller/SellerProductListScreen")}
          style={styles.backBtn}
        >
          <Ionicons name="cube-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionTitle}>{storeName}</Text>
          <Text style={styles.subscriptionPackage}>
            PLAN: {subscriptionType.replaceAll("_", " ").toUpperCase()}
          </Text>
          <Text style={styles.subscriptionMeta}>
            {subscriptionEnd
              ? `Active until ${subscriptionEnd.toLocaleDateString()} (${remainingDays} day(s) left)`
              : "Free plan - standard visibility"}
          </Text>
          <Text style={styles.subscriptionMeta}>Request status: {status.toUpperCase()}</Text>
        </View>

        {status !== "approved" ? (
          <View style={styles.pendingCard}>
            <View style={styles.pendingIconWrap}>
              <Ionicons name="time-outline" size={30} color={Colors.primary} />
            </View>
            <Text style={styles.pendingTitle}>Seller Request in Review</Text>
            <Text style={styles.pendingSubtitle}>
              Your seller profile is still under review. You can keep editing your request details while
              waiting for approval.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/RequestToBeSeller")}>
              <Text style={styles.primaryBtnText}>Manage Seller Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.statsGrid}>
              <StatCard label="Products" value={metrics.total} icon="cube-outline" />
              <StatCard label="Low Stock" value={metrics.lowStock.length} icon="alert-outline" color="#F59E0B" />
              <StatCard label="Out of Stock" value={metrics.outOfStock.length} icon="close-circle-outline" color="#DC2626" />
              <StatCard label="Avg Rating" value={metrics.averageRating} icon="star-outline" color="#F59E0B" />
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Inventory Alerts</Text>
                <TouchableOpacity onPress={() => router.push("/seller/SellerProductListScreen")}> 
                  <Text style={styles.linkText}>Manage</Text>
                </TouchableOpacity>
              </View>
              {metrics.lowStock.length === 0 ? (
                <Text style={styles.emptyText}>No low stock alerts. Inventory is healthy.</Text>
              ) : (
                metrics.lowStock.slice(0, 6).map((item) => (
                  <View key={item._id} style={styles.rowItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.rowSubtitle}>{item.category?.categoryname || "General"}</Text>
                    </View>
                    <Text style={styles.alertQty}>{item.countInStock ?? 0} left</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Top Product Reach</Text>
                <Text style={styles.subStat}>{metrics.totalReviews} reviews total</Text>
              </View>
              {metrics.topByViews.length === 0 ? (
                <Text style={styles.emptyText}>No product analytics available yet.</Text>
              ) : (
                metrics.topByViews.map((item) => (
                  <View key={item._id} style={styles.rowItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.rowSubtitle}>
                        ⭐ {Number(item.rating || 0).toFixed(1)} • {item.numReviews || 0} reviews
                      </Text>
                    </View>
                    <View style={styles.viewBadge}>
                      <Ionicons name="eye-outline" size={13} color="#1D4ED8" />
                      <Text style={styles.viewBadgeText}>{item.views || 0}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.quickActionPanel}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/seller/SellerProductEditScreen?id=new")}>
                <Ionicons name="add-circle-outline" size={17} color={Colors.primary} />
                <Text style={styles.secondaryBtnText}>Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/seller/SellerProductListScreen")}>
                <Ionicons name="list-outline" size={17} color={Colors.primary} />
                <Text style={styles.secondaryBtnText}>Manage Products</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: 16, paddingBottom: 26 },
  subscriptionCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  subscriptionTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  subscriptionPackage: { color: "#FEE2E2", marginTop: 6, fontSize: 12, fontWeight: "700" },
  subscriptionMeta: { color: "#E5E7EB", marginTop: 6, fontSize: 12 },
  pendingCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pendingIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  pendingTitle: { textAlign: "center", fontSize: 17, fontWeight: "800", color: "#111827" },
  pendingSubtitle: {
    textAlign: "center",
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  sectionTitle: {
    marginTop: 2,
    marginBottom: 10,
    fontSize: 13,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "700",
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  panel: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  panelTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  subStat: { fontSize: 11, color: "#6B7280" },
  linkText: { color: Colors.primary, fontWeight: "700", fontSize: 12 },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  rowTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },
  rowSubtitle: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  alertQty: {
    color: "#B45309",
    backgroundColor: "#FFEDD5",
    fontSize: 11,
    fontWeight: "700",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewBadgeText: { color: "#1D4ED8", fontSize: 11, fontWeight: "700" },
  emptyText: { fontSize: 12, color: "#6B7280", paddingVertical: 8, textAlign: "center" },
  quickActionPanel: { flexDirection: "row", gap: 8, marginBottom: 8 },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 11,
  },
  secondaryBtnText: { fontSize: 12, fontWeight: "700", color: "#374151" },
}); 