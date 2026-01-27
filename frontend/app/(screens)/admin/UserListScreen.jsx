
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
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from "../../../slices/userAPiSlice";
import { Colors } from "../../../constants/Utils";
import { Ionicons } from "@expo/vector-icons";

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const router = useRouter();

  // FILTER STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // All, Admin, Seller, Customer

  // SORTING & FILTERING LOGIC
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users
      .filter((user) => {
        const matchesSearch =
          user.FirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab =
          activeFilter === "All" ||
          (activeFilter === "Admin" && user.isAdmin) ||
          (activeFilter === "Seller" && user.isSeller) || // Assuming isSeller exists in your model
          (activeFilter === "Customer" && !user.isAdmin && !user.isSeller);

        return matchesSearch && matchesTab;
      })
      .sort((a, b) => a.FirstName.localeCompare(b.FirstName));
  }, [users, searchQuery, activeFilter]);

  const deleteHandler = async (id) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(id).unwrap();
              refetch();
              Toast.show({ type: "success", text1: "User Deleted" });
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: err?.data?.message || err.error,
              });
            }
          },
        },
      ]
    );
  };

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
        <TouchableOpacity onPress={() => router.push("/account")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Roles</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#ADB5BD" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name or email..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#ADB5BD"
          />
        </View>
      </View>

      {/* ROLE FILTER TABS */}
      <View style={styles.filterWrapper}>
        <FlatList
          data={["All", "Admin", "Seller", "Customer"]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item && styles.activeFilterChip]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.activeFilterText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {error ? (
        <View style={{ padding: 20 }}>
          <Message variant="error">{error?.data?.message || error.error}</Message>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: user }) => (
            <View style={styles.userCard}>
              <View style={styles.cardMain}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.FirstName?.charAt(0)}</Text>
                </View>
                
                <View style={styles.infoContainer}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{user.FirstName}</Text>
                    
                    {/* DYNAMIC BADGES */}
                    {user.isAdmin ? (
                      <View style={[styles.badge, styles.badgeAdmin]}>
                        <Text style={styles.badgeTextAdmin}>ADMIN</Text>
                      </View>
                    ) : user.isSeller ? (
                      <View style={[styles.badge, styles.badgeSeller]}>
                        <Text style={styles.badgeTextSeller}>SELLER</Text>
                      </View>
                    ) : (
                      <View style={[styles.badge, styles.badgeCustomer]}>
                        <Text style={styles.badgeTextCustomer}>CUSTOMER</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                </View>

                <View style={styles.actionGroup}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push({ pathname: "/admin/UserEditScreen", params: { id: user._id } })}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  {!user.isAdmin && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteHandler(user._id)}>
                      <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                    </TouchableOpacity>
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

export default UserListScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" },
  refreshButton: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#FFF" },
  searchInputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F3F5", borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, fontSize: 15, color: "#212529", marginLeft: 8 },
  
  filterWrapper: { paddingLeft: 16, paddingBottom: 12, backgroundColor: "#FFF" },
  filterChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F1F3F5", marginRight: 8 },
  activeFilterChip: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: "600", color: "#6C757D" },
  activeFilterText: { color: "#FFF" },

  listContent: { padding: 16 },
  userCard: { backgroundColor: "#FFF", borderRadius: 18, padding: 14, marginBottom: 12, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardMain: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E9ECEF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  infoContainer: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 2, flexWrap: 'wrap', gap: 6 },
  userName: { fontSize: 15, fontWeight: "700", color: "#212529" },
  
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeAdmin: { backgroundColor: "#E7F5FF" },
  badgeSeller: { backgroundColor: "#FFF4E6" },
  badgeCustomer: { backgroundColor: "#F8F9FA" },
  badgeTextAdmin: { fontSize: 8, fontWeight: "800", color: "#228BE6" },
  badgeTextSeller: { fontSize: 8, fontWeight: "800", color: "#FD7E14" },
  badgeTextCustomer: { fontSize: 8, fontWeight: "800", color: "#ADB5BD" },

  userEmail: { fontSize: 12, color: "#6C757D" }, 
  actionGroup: { flexDirection: "row", alignItems: "center" },
  editBtn: { padding: 8, backgroundColor: "#F0F4FF", borderRadius: 10, marginLeft: 6 },
  deleteBtn: { padding: 8, backgroundColor: "#FFF5F5", borderRadius: 10, marginLeft: 6 },
});