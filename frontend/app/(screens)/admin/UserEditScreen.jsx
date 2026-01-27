
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
import Message from "../../../components/Message";
import { Colors } from "../../../constants/Utils";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../../slices/userAPiSlice";


  const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    keyboardType = "default",
  }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons
          name={icon}
          size={20}
          color="#6C757D"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#ADB5BD"
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );


const UserEditScreen = () => {
  const router = useRouter();
  const { id: userId } = useLocalSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountStatus, setAccountStatus] = useState("active");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetUserDetailsQuery(userId);
  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setFirstName(user.FirstName || "");
      setLastName(user.LastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAccountStatus(user.accountStatus || "active");
      setIsAdmin(user.isAdmin || false);
      setIsSeller(user.isSeller || false);
    }
  }, [user]);

  const submitHandler = async () => {
    try {
      await updateUser({
        userId,
        FirstName: firstName,
        LastName: lastName,
        email,
        phone,
        accountStatus,
        isAdmin,
        isSeller,
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "User Updated",
        text2: `${firstName}'s profile has been saved.`,
      });

      refetch();
      router.back();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err?.data?.message || err.error,
      });
    }
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit User Profile</Text>
          <TouchableOpacity onPress={submitHandler} disabled={loadingUpdate}>
            {loadingUpdate ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ marginTop: 50 }}
            />
          ) : error ? (
            <Message variant="error">
              {error?.data?.message || "Failed to load user"}
            </Message>
          ) : (
            <>
              {/* SECTION: BASIC INFO */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
              </View>

              <View style={styles.card}>
                <FormInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  icon="person-outline"
                />
                <FormInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  icon="person-outline"
                />
                <FormInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="john@example.com"
                  icon="mail-outline"
                  keyboardType="email-address"
                />
                <FormInput
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 234..."
                  icon="call-outline"
                  keyboardType="phone-pad"
                />
              </View>

              {/* SECTION: PERMISSIONS & STATUS */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Permissions & Status</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Administrator Access</Text>
                    <Text style={styles.switchSubLabel}>
                      Allows full access to management tools
                    </Text>
                  </View>
                  <Switch
                    value={isAdmin}
                    onValueChange={setIsAdmin}
                    trackColor={{ false: "#DEE2E6", true: Colors.primary }}
                    thumbColor="#FFF"
                  />
                </View>

                <View style={[styles.switchRow, styles.borderTop]}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Seller Account</Text>
                    <Text style={styles.switchSubLabel}>
                      Allows user to list products
                    </Text>
                  </View>
                  <Switch
                    value={isSeller}
                    onValueChange={setIsSeller}
                    trackColor={{ false: "#DEE2E6", true: "#FD7E14" }}
                    thumbColor="#FFF"
                  />
                </View>

                <View style={[styles.switchRow, styles.borderTop]}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Account Status</Text>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            accountStatus === "active" ? "#2FB344" : "#D63939",
                        },
                      ]}
                    >
                      Currently: {accountStatus.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.statusToggle}
                    onPress={() =>
                      setAccountStatus((prev) =>
                        prev === "active" ? "suspended" : "active",
                      )
                    }
                  >
                    <Text style={styles.statusToggleText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.deleteUserBtn}>
                <Text style={styles.deleteUserText}>Flag User for Review</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserEditScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60, 
  backgroundColor: "#FFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A" },
  closeButton: { width: 40, height: 40, justifyContent: "center" },
  saveText: { color: Colors.primary, fontWeight: "700", fontSize: 16 },

  scrollContent: { padding: 16, paddingBottom: 40, backgroundColor: "#F8F9FA" },
  sectionHeader: { marginTop: 20, marginBottom: 8, paddingHorizontal: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C757D",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },

  inputWrapper: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, height: 48, fontSize: 15, color: "#212529" },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  borderTop: { borderTopWidth: 1, borderTopColor: "#F1F3F5", marginTop: 4 },
  switchInfo: { flex: 1, marginRight: 10 },
  switchLabel: { fontSize: 15, fontWeight: "600", color: "#212529" },
  switchSubLabel: { fontSize: 12, color: "#6C757D", marginTop: 2 },

  statusText: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F1F3F5",
    borderRadius: 6,
  },
  statusToggleText: { fontSize: 12, fontWeight: "600", color: "#495057" },

  deleteUserBtn: { marginTop: 30, alignItems: "center", padding: 15 },
  deleteUserText: { color: "#D63939", fontWeight: "600", fontSize: 14 },
});
