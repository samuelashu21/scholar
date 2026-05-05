import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Utils";
import {
  useGetDashboardSummaryQuery,
  useGetRevenueQuery,
  useGetTopProductsQuery,
  useGetUserGrowthQuery,
} from "../../../slices/analyticsApiSlice";
import { useTranslation } from "react-i18next";

const PERIODS = ["today", "week", "month", "year"];

// Simple bar chart component — no SVG dependency
const SimpleBarChart = ({ data, labelKey, valueKey, color = Colors.primary }) => {
  if (!data || data.length === 0) {
    return <Text style={styles.noData}>No data available</Text>;
  }

  const maxVal = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => {
        const barHeight = Math.max(((item[valueKey] || 0) / maxVal) * 120, 4);
        return (
          <View key={index} style={styles.barWrapper}>
            <Text style={styles.barValue}>
              {item[valueKey] > 999
                ? `${(item[valueKey] / 1000).toFixed(1)}k`
                : item[valueKey]}
            </Text>
            <View style={[styles.bar, { height: barHeight, backgroundColor: color }]} />
            <Text style={styles.barLabel} numberOfLines={1}>
              {item[labelKey]?.slice(-5) || ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const StatCard = ({ icon, label, value, color = Colors.primary }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={[styles.statIconBox, { backgroundColor: color + "18" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

const AnalyticsDashboard = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [revenuePeriod, setRevenuePeriod] = useState("week");

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummaryQuery();
  const { data: revenue, isLoading: revenueLoading } = useGetRevenueQuery(revenuePeriod);
  const { data: topProducts, isLoading: productsLoading } = useGetTopProductsQuery(8);
  const { data: userGrowth, isLoading: growthLoading } = useGetUserGrowthQuery();

  const isLoading = summaryLoading || revenueLoading || productsLoading || growthLoading;

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
        <Text style={styles.headerTitle}>{t("admin.analytics")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* ─── SUMMARY CARDS ────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statGrid}>
            <StatCard
              icon="cart-outline"
              label="Total Orders"
              value={summary?.totalOrders || 0}
              color={Colors.primary}
            />
            <StatCard
              icon="cash-outline"
              label="Revenue (ETB)"
              value={`${(summary?.totalRevenue || 0).toFixed(0)}`}
              color="#28A745"
            />
            <StatCard
              icon="people-outline"
              label="Total Users"
              value={summary?.totalUsers || 0}
              color="#FF6B35"
            />
            <StatCard
              icon="cube-outline"
              label="Products"
              value={summary?.totalProducts || 0}
              color="#6F42C1"
            />
          </View>

          {/* ─── PENDING ORDERS ALERT ─────────────────────────────────── */}
          {summary?.pendingOrders > 0 && (
            <View style={styles.alertBanner}>
              <Ionicons name="alert-circle" size={18} color="#FFC107" />
              <Text style={styles.alertText}>
                {summary.pendingOrders} order{summary.pendingOrders > 1 ? "s" : ""} pending action
              </Text>
            </View>
          )}

          {/* ─── REVENUE CHART ────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("admin.revenue")}</Text>
              <View style={styles.periodTabs}>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.periodTab,
                      revenuePeriod === p && styles.periodTabActive,
                    ]}
                    onPress={() => setRevenuePeriod(p)}
                  >
                    <Text
                      style={[
                        styles.periodTabText,
                        revenuePeriod === p && styles.periodTabTextActive,
                      ]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.revenueHighlight}>
                <Text style={styles.revenueTotal}>
                  ETB {(revenue?.totalRevenue || 0).toFixed(2)}
                </Text>
                <Text style={styles.revenueSubtitle}>
                  {revenue?.totalOrders || 0} paid orders
                </Text>
              </View>
              <SimpleBarChart
                data={revenue?.data || []}
                labelKey="_id"
                valueKey="revenue"
                color={Colors.primary}
              />
            </View>
          </View>

          {/* ─── TOP PRODUCTS ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("admin.topProducts")}</Text>
            {(topProducts || []).map((p, index) => (
              <View key={p._id} style={styles.productRow}>
                <View style={styles.productRank}>
                  <Text style={styles.productRankText}>{index + 1}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.productMeta}>
                    {p.views} views · {p.numReviews} reviews · ⭐ {p.rating?.toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.productScore}>
                  {p.popularityScore?.toFixed(0)}
                </Text>
              </View>
            ))}
          </View>

          {/* ─── USER GROWTH CHART ────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("admin.userGrowth")}</Text>
            <View style={styles.card}>
              <View style={styles.growthStats}>
                <View>
                  <Text style={styles.growthNumber}>{userGrowth?.totalUsers || 0}</Text>
                  <Text style={styles.growthLabel}>Total Users</Text>
                </View>
                <View>
                  <Text style={[styles.growthNumber, { color: "#28A745" }]}>
                    {userGrowth?.totalSellers || 0}
                  </Text>
                  <Text style={styles.growthLabel}>Sellers</Text>
                </View>
              </View>
              <SimpleBarChart
                data={userGrowth?.data || []}
                labelKey="_id"
                valueKey="count"
                color="#FF6B35"
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AnalyticsDashboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
  content: { padding: 16, paddingBottom: 40 },
  // Summary cards
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1,
    minWidth: "46%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: { fontSize: 11, color: "#888", fontWeight: "600", textTransform: "uppercase" },
  statValue: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
  // Alert
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFE08A",
  },
  alertText: { fontSize: 13, fontWeight: "600", color: "#856404" },
  // Section
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  // Period tabs
  periodTabs: { flexDirection: "row", gap: 4 },
  periodTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F1F3F5",
  },
  periodTabActive: { backgroundColor: Colors.primary },
  periodTabText: { fontSize: 11, color: "#666", fontWeight: "600" },
  periodTabTextActive: { color: "#FFF" },
  // Revenue
  revenueHighlight: { alignItems: "center", marginBottom: 16 },
  revenueTotal: { fontSize: 28, fontWeight: "900", color: Colors.primary },
  revenueSubtitle: { fontSize: 13, color: "#888", marginTop: 2 },
  // Bar chart
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
    paddingTop: 20,
  },
  barWrapper: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "60%", borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 9, color: "#999", marginTop: 4, textAlign: "center" },
  barValue: { fontSize: 9, color: "#666", marginBottom: 2 },
  noData: { textAlign: "center", color: "#999", padding: 20 },
  // Top products
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    gap: 10,
  },
  productRank: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  productRankText: { fontSize: 13, fontWeight: "800", color: Colors.primary },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  productMeta: { fontSize: 11, color: "#888", marginTop: 2 },
  productScore: { fontSize: 13, fontWeight: "700", color: "#666" },
  // User growth
  growthStats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  growthNumber: { fontSize: 24, fontWeight: "900", color: Colors.primary, textAlign: "center" },
  growthLabel: { fontSize: 11, color: "#888", fontWeight: "600", textAlign: "center", marginTop: 2 },
});
