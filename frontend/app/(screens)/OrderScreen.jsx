import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGetOrderDetailsQuery } from "../../slices/ordersApiSlice"; // Assuming this exists
import { Colors } from "../../constants/Utils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const OrderScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  // Fetching the specific order details
  const { data: order, isLoading, error } = useGetOrderDetailsQuery(orderId);

  if (isLoading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerLoader}>
        <Ionicons name="alert-circle" size={50} color="red" />
        <Text style={styles.errorText}>{error?.data?.message || "Something went wrong"}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* STATUS INDICATOR */}
        <View style={styles.statusBanner}>
          <View style={[styles.statusBadge, { backgroundColor: order.isPaid ? "#E7F6EC" : "#FFEBEB" }]}>
            <Text style={[styles.statusText, { color: order.isPaid ? "#28A745" : "#DC3545" }]}>
              {order.isPaid ? "Paid" : "Payment Pending"}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: order.isDelivered ? "#E7F6EC" : "#FFF4E5" }]}>
            <Text style={[styles.statusText, { color: order.isDelivered ? "#28A745" : "#FD7E14" }]}>
              {(order.status || "processing").replaceAll("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Order #{order._id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.subtitle}>Placed on {new Date(order.createdAt).toLocaleDateString()}</Text>

        {/* SHIPPING & PAYMENT INFO */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.infoTitle}>Ship To</Text>
            <Text style={styles.infoText} numberOfLines={2}>
              {order.shippingAddress.address}, {order.shippingAddress.city}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="card" size={20} color={Colors.primary} />
            <Text style={styles.infoTitle}>Method</Text>
            <Text style={styles.infoText}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* ORDER ITEMS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ordered Items</Text>
          {order.orderItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                {item.selectedVariant?.label ? (
                  <Text style={styles.variantText}>
                    {item.selectedVariant.name}: {item.selectedVariant.label}
                  </Text>
                ) : null}
                <Text style={styles.productPrice}>
                  {item.qty} x ${item.price} = <Text style={styles.itemTotal}>${(item.qty * item.price).toFixed(2)}</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>

        {order.statusHistory?.length ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Status Timeline</Text>
            {order.statusHistory.map((entry, index) => (
              <View key={`${entry.status}-${index}`} style={styles.timelineItem}>
                <Text style={styles.timelineStatus}>{entry.status.replaceAll("_", " ")}</Text>
                <Text style={styles.timelineDate}>{new Date(entry.timestamp).toLocaleString()}</Text>
                {entry.note ? <Text style={styles.timelineNote}>{entry.note}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Total Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${order.itemsPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>${order.shippingPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${order.taxPrice}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>${order.totalPrice}</Text>
          </View>
        </View>

        {/* ACTION BUTTONS (Optional) */}
        {!order.isPaid && (
           <TouchableOpacity style={styles.payNowBtn}>
             <Text style={styles.payNowText}>Proceed to Payment</Text>
           </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.darkGray },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: "#F1F3F5" },
  scrollContent: { padding: 20 },
  centerLoader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: Colors.darkGray },
  errorText: { marginVertical: 10, color: "#DC3545", textAlign: "center" },
  statusBanner: { flexDirection: "row", gap: 10, marginBottom: 15 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },
  title: { fontSize: 24, fontWeight: "800", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#6C757D", marginBottom: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  infoCard: {
    backgroundColor: "#FFF",
    width: "48%",
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },
  infoTitle: { fontSize: 14, fontWeight: "700", marginTop: 8, color: "#333" },
  infoText: { fontSize: 12, color: "#666", marginTop: 4 },
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15, color: "#1A1A1A" },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
    paddingBottom: 10,
  },
  productImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  productDetails: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "600", color: "#333" },
  variantText: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  productPrice: { fontSize: 13, color: "#666", marginTop: 2 },
  itemTotal: { fontWeight: "700", color: Colors.primary },
  timelineItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
    paddingBottom: 10,
    marginBottom: 10,
  },
  timelineStatus: { fontSize: 13, fontWeight: "700", color: "#212529", textTransform: "capitalize" },
  timelineDate: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  timelineNote: { fontSize: 12, color: "#495057", marginTop: 4 },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { color: "#666", fontSize: 14 },
  summaryValue: { fontWeight: "600", color: "#333" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#F1F3F5", paddingTop: 15, marginTop: 5 },
  totalLabel: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  totalValue: { fontSize: 18, fontWeight: "800", color: Colors.primary },
  payNowBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  payNowText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
