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
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Message from "../../../components/Message";
import { useDeleteUserMutation, useGetSellerRequestsQuery } from "../../../slices/userAPiSlice";
import { Colors } from "../../../constants/Utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const SellerRequestListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetSellerRequestsQuery();
  const [deleteUser] = useDeleteUserMutation();
  const router = useRouter();

  const deleteHandler = (id) => {
    Alert.alert(
      "Delete Seller",
      "Are you sure you want to delete this seller?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(id);
              refetch();
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Seller deleted successfully",
              });
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Message variant="error">{error?.data?.message || error.error}</Message>
      </View>
    );
  } 

  const renderUser = ({ item: user }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 2 }]}>{user.FirstName}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{user.sellerRequest?.subscriptionType}</Text>
      <View style={[styles.cell, { flex: 2, flexDirection: "row", justifyContent: "center" }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/admin/ManageSellerRequestScreen",
              params: { id: user._id },
            })
          }
        >
          <FontAwesome name="edit" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => deleteHandler(user._id)}>
          <FontAwesome name="trash" size={20} color={Colors.textRed} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("../../profile")} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seller Requests</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>First Name</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Subscription</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>Actions</Text>
        </View>

        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={renderUser}
        />
      </View>
    </SafeAreaView>
  );
};

export default SellerRequestListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.offWhite,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 8,
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
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  cell: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.textColor,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    marginHorizontal: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: Colors.offWhite,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
});
