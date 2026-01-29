import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native";
import React, { useState, useMemo } from "react";
import { useRouter, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import Message from "../../../components/Message";
import { useDeleteUserMutation, useGetSellerRequestsQuery } from "../../../slices/userAPiSlice";
import { Colors } from "../../../constants/Utils";
import { Ionicons } from "@expo/vector-icons";

const SellerRequestListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetSellerRequestsQuery();
  const [deleteUser] = useDeleteUserMutation();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // Plan Filter
  const [statusFilter, setStatusFilter] = useState("All"); // Status Filter
  const [sortBy, setSortBy] = useState("name");

  // Filter Options
  const planOptions = [
    { label: "All Plans", value: "All" },
    { label: "Free", value: "free" },
    { label: "1 Month", value: "paid_1_month" },
    { label: "6 Months", value: "paid_6_month" },
  ];

  const statusOptions = [
    { label: "All Status", value: "All" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  // Logic to filter by Search, Subscription Type, AND Status
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let result = users.filter((user) => {
      const fullName = `${user.FirstName} ${user.LastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const userSub = user.sellerRequest?.subscriptionType;
      const userStatus = user.sellerRequest?.status || "pending";

      const matchesPlan = activeFilter === "All" || userSub === activeFilter;
      const matchesStatus = statusFilter === "All" || userStatus === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sortBy === "name") return a.FirstName.localeCompare(b.FirstName);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [users, searchQuery, activeFilter, statusFilter, sortBy]);

  // UI Helpers
  const getSubscriptionStyle = (type) => {
    switch (type) {
      case "paid_6_month": return { bg: "#E3F2FD", text: "#1976D2", label: "6 MONTHS" };
      case "paid_1_month": return { bg: "#F3E5F5", text: "#7B1FA2", label: "1 MONTH" };
      case "free": return { bg: "#E8F5E9", text: "#2E7D32", label: "FREE" };
      default: return { bg: "#F5F5F5", text: "#616161", label: "N/A" };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved": return { bg: "#E8F5E9", text: "#2E7D32", icon: "checkmark-circle" };
      case "rejected": return { bg: "#FFEBEE", text: "#C62828", icon: "close-circle" };
      case "pending": return { bg: "#FFF3E0", text: "#EF6C00", icon: "time" };
      default: return { bg: "#F5F5F5", text: "#616161", icon: "help-circle" };
    }
  };

  const renderUser = ({ item: user }) => {
    const subStyle = getSubscriptionStyle(user.sellerRequest?.subscriptionType);
    const statusStyle = getStatusStyle(user.sellerRequest?.status || "pending");

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.FirstName?.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user.FirstName} {user.LastName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
          
          {/* NEW: Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text} />
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
              {(user.sellerRequest?.status || "pending").toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={[styles.badge, { backgroundColor: subStyle.bg }]}>
            <Text style={[styles.badgeText, { color: subStyle.text }]}>
              {subStyle.label} PLAN
            </Text>
          </View>
          <Text style={styles.dateText}>
            Requested: {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.btn, styles.editBtn]}
            onPress={() => router.push({ pathname: "/admin/ManageSellerRequestScreen", params: { id: user._id } })}
          >
            <Ionicons name="eye-outline" size={18} color={Colors.primary} />
            <Text style={styles.editBtnText}>Review Request</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => deleteHandler(user._id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const deleteHandler = (id) => {
    Alert.alert("Remove Request", "Are you sure you want to delete this request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(id).unwrap();
            refetch();
            Toast.show({ type: "success", text1: "Deleted successfully" });
          } catch (err) {
            Toast.show({ type: "error", text1: "Error", text2: err?.data?.message });
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Management</Text>
        <TouchableOpacity 
           onPress={() => setSortBy(sortBy === "name" ? "newest" : "name")} 
           style={styles.iconButton}
        >
          <Ionicons 
            name={sortBy === "name" ? "text-outline" : "time-outline"} 
            size={22} 
            color={Colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#ADB5BD" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search name or email..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* STATUS FILTER (Pending, Approved, etc) */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{ paddingLeft: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.statusChip, statusFilter === item.value && styles.activeStatusChip]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text style={[styles.statusChipText, statusFilter === item.value && styles.activeStatusChipText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* PLAN FILTER (Free, Paid, etc) */}
      <View style={[styles.filterSection, { borderBottomWidth: 1, borderBottomColor: "#EEE", paddingBottom: 12 }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={planOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{ paddingLeft: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeFilter === item.value && styles.activeChip]}
              onPress={() => setActiveFilter(item.value)}
            >
              <Text style={[styles.chipText, activeFilter === item.value && styles.activeChipText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.container}>
        {error ? (
          <Message variant="error">{error?.data?.message || "Error loading requests"}</Message>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={renderUser}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={60} color="#CCC" />
                <Text style={styles.emptyText}>No requests found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SellerRequestListScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, backgroundColor: "#FFF" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  iconButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  searchSection: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#FFF" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F3F5", paddingHorizontal: 12, borderRadius: 10, height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: "#212529" },
  filterSection: { paddingVertical: 6, backgroundColor: "#FFF" },
  
  // Status Chips
  statusChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: "#F8F9FA", marginRight: 8, borderWidth: 1, borderColor: "#E9ECEF" },
  activeStatusChip: { backgroundColor: "#212529", borderColor: "#212529" },
  statusChipText: { fontSize: 12, color: "#6C757D", fontWeight: "600" },
  activeStatusChipText: { color: "#FFF" },

  // Plan Chips
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F1F3F5", marginRight: 8, borderWidth: 1, borderColor: "#E9ECEF" },
  activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: "#6C757D", fontWeight: "600" },
  activeChipText: { color: "#FFF" },

  container: { flex: 1 },
  listContent: { padding: 16 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: "#EAEAEA" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F0F4FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: "bold", color: Colors.primary },
  userName: { fontSize: 16, fontWeight: "700", color: "#212529" },
  userEmail: { fontSize: 13, color: "#6C757D" },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: "800" },
  
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  dateText: { fontSize: 11, color: "#ADB5BD" },

  cardActions: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#F1F3F5", paddingTop: 12 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, flex: 1 },
  editBtn: { backgroundColor: "#F0F7FF", marginRight: 12 },
  editBtnText: { marginLeft: 8, color: Colors.primary, fontWeight: "700" },
  deleteBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF0F0", borderRadius: 10 },
  
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { marginTop: 12, color: "#ADB5BD", fontSize: 16 }, 
}); 