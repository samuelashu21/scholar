import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BarChart, LineChart } from "react-native-gifted-charts";
import {
  useGetRevenueAnalyticsQuery,
  useGetTopProductsQuery,
  useGetUserGrowthQuery,
} from "../../../slices/analyticsApiSlice";
import { Colors } from "../../../constants/Utils";

const PERIODS = ["week", "month", "year"];

const AnalyticsDashboard = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("week");

  const { data: revenueData, isLoading: revLoading } = useGetRevenueAnalyticsQuery(period);
  const { data: topProducts, isLoading: topLoading } = useGetTopProductsQuery(8);
  const { data: userGrowth, isLoading: growthLoading } = useGetUserGrowthQuery();

  const isLoading = revLoading || topLoading || growthLoading;

  // Transform revenue data for BarChart
  const revenueBarData = (revenueData?.revenue || []).map((r) => ({
    value: parseFloat(r.total?.toFixed(2) || 0),
    label: r.date?.slice(5) || "", // Show MM-DD
    frontColor: Colors.primary,
  }));

  // Transform user growth for LineChart
  const growthLineData = (userGrowth || []).map((g) => ({
    value: g.count || 0,
    label: g.month?.slice(5) || "", // Show month number
    dataPointColor: Colors.primary,
  }));

  const totalRevenue = (revenueData?.revenue || []).reduce((s, r) => s + (r.total || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* Revenue Summary Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Revenue — Last {period}</Text>
              <Text style={styles.totalRevenue}>${totalRevenue.toFixed(2)}</Text>
              {revenueBarData.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={revenueBarData}
                    barWidth={28}
                    spacing={16}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={1}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: "#999", fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: "#999", fontSize: 9 }}
                    noOfSections={4}
                    height={160}
                  />
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>No revenue data for this period.</Text>
              )}
            </View>

            {/* User Growth */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>User Growth (Monthly)</Text>
              {growthLineData.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={growthLineData}
                    height={150}
                    spacing={40}
                    color={Colors.primary}
                    thickness={2}
                    startFillColor={Colors.primary}
                    startOpacity={0.2}
                    endOpacity={0}
                    xAxisLabelTextStyle={{ color: "#999", fontSize: 9 }}
                    yAxisTextStyle={{ color: "#999", fontSize: 10 }}
                    hideRules
                    curved
                  />
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>No user growth data.</Text>
              )}
            </View>

            {/* Top Products */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Top Products by Popularity</Text>
              {(topProducts || []).map((product, idx) => (
                <View key={product._id || idx} style={styles.productRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{idx + 1}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productMeta}>
                      {product.views || 0} views · {product.numReviews || 0} reviews · ⭐ {(product.rating || 0).toFixed(1)}
                    </Text>
                  </View>
                  <Text style={styles.productPrice}>${product.price}</Text>
                </View>
              ))}
              {(!topProducts || topProducts.length === 0) && (
                <Text style={styles.emptyText}>No products found.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: 16, paddingBottom: 40 },
  center: { padding: 60, alignItems: "center" },
  periodRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#E9ECEF",
    alignItems: "center",
  },
  periodBtnActive: { backgroundColor: Colors.primary },
  periodText: { fontSize: 13, fontWeight: "600", color: "#495057" },
  periodTextActive: { color: "#FFF" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", marginBottom: 12 },
  totalRevenue: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.primary,
    marginBottom: 16,
  },
  emptyText: { color: "#ADB5BD", textAlign: "center", paddingVertical: 20 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F1F3F5",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: { fontSize: 12, fontWeight: "800", color: "#495057" },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "700", color: "#212529" },
  productMeta: { fontSize: 11, color: "#ADB5BD", marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: "700", color: Colors.primary },
});
