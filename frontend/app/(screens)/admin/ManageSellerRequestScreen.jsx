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
import { useGetSellerRequestsQuery, useApproveSellerMutation,useGetUserDetailsQuery } from "../../../slices/userAPiSlice";

const ManageSellerRequestScreen = () => { 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountStatus, setAccountStatus] = useState("active");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("free");
  const [sellerStatus, setSellerStatus] = useState("pending");

  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.id;

  // const { data: user, isLoading, error, refetch } = useGetSellerRequestsQuery(userId);
  const { data: user, isLoading, error, refetch } = useGetUserDetailsQuery(userId);
  const [approveSeller, { isLoading: loadingUpdate }] = useApproveSellerMutation();

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

  const SectionHeader = ({ icon, title, color = Colors.primary }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (isLoading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF"/>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        
        {/* IMPROVED HEADER WITH BACK BUTTON */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Review Request</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {error ? (
            <View style={{ padding: 20 }}>
                <Message variant="error">{error?.data?.message || "Error fetching data"}</Message>
            </View>
          ) : (
            <>
              {/* Applicant identity Section */}
              <View style={styles.card}>
                <SectionHeader icon="person" title="Applicant Identity" />
                <View style={styles.inputRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boldLabel}>Admin Privileges</Text>
                    <Text style={styles.subLabel}>Grant access to admin tools</Text>
                  </View>
                  <Switch 
                    value={isAdmin} 
                    onValueChange={setIsAdmin} 
                    trackColor={{ true: Colors.primary, false: '#D1D1D1' }} 
                    thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                  />
                </View>
              </View>

              {/* Store Section */}
              <View style={styles.card}>
                <SectionHeader icon="storefront" title="Store Information" color="#6366F1" />
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Store Name</Text>
                  <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="Official Shop Name" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={storeDescription}
                    onChangeText={setStoreDescription}
                    multiline
                    placeholder="Describe what the seller offers..."
                  />
                </View>
              </View>

              {/* Decision Section */}
              <View style={[
                styles.card, 
                sellerStatus === 'approved' && styles.approveCard,
                sellerStatus === 'rejected' && styles.rejectCard
              ]}>
                <SectionHeader 
                  icon="shield-checkmark" 
                  title="Final Decision" 
                  color={sellerStatus === 'approved' ? '#2E7D32' : sellerStatus === 'rejected' ? '#D32F2F' : '#F59E0B'} 
                />
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Subscription Plan</Text>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={subscriptionType} onValueChange={setSubscriptionType} style={styles.picker}>
                      <Picker.Item label="Free Plan" value="free" />
                      <Picker.Item label="Paid (1 Month)" value="paid_1_month" />
                      <Picker.Item label="Paid (6 Months)" value="paid_6_month" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Status Action</Text>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={sellerStatus} onValueChange={setSellerStatus} style={styles.picker}>
                      <Picker.Item label="Keep Pending" value="pending" />
                      <Picker.Item label="Approve Application" value="approved" color="#2E7D32" />
                      <Picker.Item label="Reject Application" value="rejected" color="#D32F2F" />
                    </Picker>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, loadingUpdate && { opacity: 0.8 }]} 
                onPress={submitHandler}
                disabled={loadingUpdate}
              >
                {loadingUpdate ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={22} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>Save Review Changes</Text>
                  </>
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
  safeArea: { flex: 1, backgroundColor: "#FFF", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  header: {
    height: 64,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1, 
    borderBottomColor: "#F3F4F6",
    zIndex: 1000,
    elevation: 4, 
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
        android: { elevation: 3 },
    }),
  },
  headerLeft: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerRight: {
    width: 44, // Matches headerLeft to keep title perfectly centered
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#111827", 
    flex: 1, 
    textAlign: 'center' 
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6", // Light grey circle background for visibility
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  backIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  approveCard: { borderColor: '#A7F3D0', borderWidth: 1.5, backgroundColor: '#F0FFF4' },
  rejectCard: { borderColor: '#FECACA', borderWidth: 1.5, backgroundColor: '#FFF5F5' },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconContainer: { padding: 8, borderRadius: 10, marginRight: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },
  inputGroup: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 6, marginLeft: 4 },
  boldLabel: { fontSize: 15, fontWeight: "700", color: "#374151" },
  subLabel: { fontSize: 12, color: "#9CA3AF" },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  pickerContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  picker: { height: 50, color: "#1F2937" },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 58,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    ...Platform.select({
        ios: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
        android: { elevation: 4 },
    }),
  },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});