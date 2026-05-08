import React, { useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart, BarChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useGetRevenueAnalyticsQuery,
  useGetTopProductsAnalyticsQuery,
  useGetUserGrowthAnalyticsQuery,
} from "../../../slices/adminAnalyticsApiSlice";
import { Colors } from "../../../constants/Utils";

const periods = ["week", "month", "year"];

const AdminAnalyticsScreen = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("week");

  const { data: revenueData, isLoading: revenueLoading, error: revenueError } =
    useGetRevenueAnalyticsQuery(period);
  const { data: topProducts, isLoading: topLoading } = useGetTopProductsAnalyticsQuery();
  const { data: userGrowth, isLoading: userLoading } = useGetUserGrowthAnalyticsQuery();

  const revenueChartData = useMemo(
    () =>
      (revenueData?.revenue || []).map((entry) => ({
        value: Number(entry.revenue || 0),
        label: `${entry._id.month}/${entry._id.day}`,
      })),
    [revenueData]
  );

  const userGrowthChartData = useMemo(
    () =>
      (userGrowth || []).map((entry) => ({
        value: Number(entry.users || 0),
        label: `${entry._id.month}/${String(entry._id.year).slice(-2)}`,
      })),
    [userGrowth]
  );

  if (revenueLoading || topLoading || userLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (revenueError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{revenueError?.data?.message || "Failed to load analytics"}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Analytics</Text>
        </View>

        <View style={styles.periodRow}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue</Text>
          {revenueChartData.length ? (
            <LineChart
              data={revenueChartData}
              color1={Colors.primary}
              dataPointsColor1={Colors.primary}
              hideRules
              xAxisLabelTextStyle={{ fontSize: 10 }}
            />
          ) : (
            <Text style={styles.emptyText}>No revenue data for this period.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Growth</Text>
          {userGrowthChartData.length ? (
            <BarChart
              data={userGrowthChartData}
              frontColor={Colors.primary}
              yAxisTextStyle={{ fontSize: 10 }}
              xAxisLabelTextStyle={{ fontSize: 10 }}
            />
          ) : (
            <Text style={styles.emptyText}>No user growth data available.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Products</Text>
          {(topProducts || []).length ? (
            topProducts.map((product, index) => (
              <View key={product._id || index} style={styles.rowBetween}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.metricText}>{Math.round(product.engagementScore || 0)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No top products data available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  periodRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  periodButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText: { textTransform: "capitalize", color: "#495057", fontWeight: "600" },
  periodTextActive: { color: "#FFF" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: "#111" },
  emptyText: { fontSize: 13, color: "#6C757D" },
  errorText: { color: "#DC3545", fontWeight: "600" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  productName: { flex: 1, marginRight: 8, color: "#212529", fontWeight: "600" },
  metricText: { color: Colors.primary, fontWeight: "700" },
});

export default AdminAnalyticsScreen;
