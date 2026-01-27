import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Switch,
  StatusBar,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Message from "../../../components/Message";
import { Colors } from "../../../constants/Utils";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useGetSellerRequestsQuery, useApproveSellerMutation } from "../../../slices/userAPiSlice";

const ManageSellerRequestScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountStatus, setAccountStatus] = useState("active");
  const [isAdmin, setIsAdmin] = useState(false);

  // Seller fields
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("free");
  const [sellerStatus, setSellerStatus] = useState("pending");

  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.id;

  const { data: user, isLoading, error, refetch } = useGetSellerRequestsQuery(userId);
  const [approveSeller, { isLoading: loadingUpdate }] = useApproveSellerMutation();

  const toggleAccountStatus = () => {
    setAccountStatus((prev) => (prev === "active" ? "suspended" : "active"));
  };

  const submitHandler = async () => {
    try {
      await approveSeller({
        userId,
        FirstName: firstName,
        LastName: lastName,
        email,
        phone,
        accountStatus,
        isAdmin,
        sellerProfile: { storeName, storeDescription },
        sellerRequest: { subscriptionType, status: sellerStatus },
      }).unwrap();

      Toast.show({ type: "success", text1: "Success", text2: "User updated successfully" });
      refetch();
      router.back();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error?.data?.message || "Failed to update" });
    }
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.FirstName || "");
      setLastName(user.LastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAccountStatus(user.accountStatus || "active");
      setIsAdmin(user.isAdmin);
      setStoreName(user.sellerProfile?.storeName || "");
      setStoreDescription(user.sellerProfile?.storeDescription || "");
      setSubscriptionType(user.sellerRequest?.subscriptionType || "free");
      setSellerStatus(user.sellerRequest?.status || "pending");
    }
  }, [user]);

  const SectionHeader = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Request</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
          ) : error ? (
            <Message variant="error">{error?.data?.message || "Error fetching data"}</Message>
          ) : (
            <>
              {/* User Identity Section */}
              <View style={styles.card}>
                <SectionHeader icon="person-outline" title="Applicant Identity" />
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.row}>
                    <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={firstName} onChangeText={setFirstName} placeholder="First" />
                    <TextInput style={[styles.input, { flex: 1 }]} value={lastName} onChangeText={setLastName} placeholder="Last" />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Details</Text>
                  <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Email Address" />
                  <TextInput style={[styles.input, { marginTop: 10 }]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone Number" />
                </View>

                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.label}>Account Permission</Text>
                    <Text style={styles.subLabel}>Grant admin privileges</Text>
                  </View>
                  <Switch value={isAdmin} onValueChange={setIsAdmin} trackColor={{ true: Colors.primary }} />
                </View>
              </View>

              {/* Seller Profile Section */}
              <View style={styles.card}>
                <SectionHeader icon="storefront-outline" title="Store Information" />
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Store Name</Text>
                  <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>About the Store</Text>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                    value={storeDescription}
                    onChangeText={setStoreDescription}
                    multiline
                  />
                </View>
              </View>

              {/* Approval Section */}
              <View style={styles.card}>
                <SectionHeader icon="checkmark-circle-outline" title="Approval Decision" />
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Plan Selection</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker selectedValue={subscriptionType} onValueChange={setSubscriptionType}>
                      <Picker.Item label="Free Plan" value="free" />
                      <Picker.Item label="Paid (1 Month)" value="paid_1_month" />
                      <Picker.Item label="Paid (6 Months)" value="paid_6_month" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Action</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker selectedValue={sellerStatus} onValueChange={setSellerStatus}>
                      <Picker.Item label="Pending" value="pending" />
                      <Picker.Item label="Approve" value="approved" color="#2E7D32" />
                      <Picker.Item label="Reject" value="rejected" color="#D32F2F" />
                    </Picker>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, loadingUpdate && { opacity: 0.7 }]} 
                onPress={submitHandler}
                disabled={loadingUpdate}
              >
                {loadingUpdate ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Confirm Updates</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ManageSellerRequestScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 60,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  backButton: { padding: 4 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginLeft: 10, color: "#444" },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8 },
  subLabel: { fontSize: 11, color: "#999" },
  row: { flexDirection: "row" },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#333",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  pickerWrapper: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    overflow: "hidden",
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});