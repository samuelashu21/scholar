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
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Message from "../../../components/Message";
import { Colors } from "../../../constants/Utils";
import Ionicons from "@expo/vector-icons/Ionicons";
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
    switch (accountStatus) {
      case "active":
        setAccountStatus("suspended");
        break;
      case "suspended":
        setAccountStatus("inactive");
        break;
      case "inactive":
      default:
        setAccountStatus("active");
        break;
    }
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
        sellerProfile: {
          storeName,
          storeDescription,
        },
        sellerRequest: {
          subscriptionType,
          status: sellerStatus,
        },
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "User updated successfully",
      });

      refetch();
      router.replace("/admin/SellerRequestListScreen");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.data?.message || error.error,
      });
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

      // Seller info
      setStoreName(user.sellerProfile?.storeName || "");
      setStoreDescription(user.sellerProfile?.storeDescription || "");
      setSubscriptionType(user.sellerRequest?.subscriptionType || "free");
      setSellerStatus(user.sellerRequest?.status || "pending");
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push("/admin/SellerRequestListScreen")}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back-circle" size={35} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Manage Seller Requests</Text>
          </View>

          <View style={styles.actualFormContainer}>
            {loadingUpdate && <ActivityIndicator size="large" color={Colors.primary} />}
            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : error ? (
              <Message variant="error">{error?.data?.message || error.error}</Message>
            ) : (
              <View style={styles.form}>
                {/* Basic info */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* Account status */}
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Account Status</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Switch
                      value={accountStatus === "active"}
                      onValueChange={toggleAccountStatus}
                      trackColor={{ false: Colors.lightGray, true: Colors.primary }}
                      thumbColor={Colors.white}
                    />
                    <Text style={{ marginLeft: 10, fontWeight: "500" }}>
                      {accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Is Admin</Text>
                  <Switch
                    value={isAdmin}
                    onValueChange={setIsAdmin}
                    trackColor={{ false: Colors.lightGray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                {/* Seller fields */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Store Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter store name"
                    value={storeName}
                    onChangeText={setStoreName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Store Description</Text>
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="Enter store description"
                    value={storeDescription}
                    onChangeText={setStoreDescription}
                    multiline
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Subscription Type</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={subscriptionType}
                      onValueChange={(itemValue) => setSubscriptionType(itemValue)}
                      mode="dropdown"
                    >
                      <Picker.Item label="Free" value="free" />
                      <Picker.Item label="Paid 1 Month" value="paid_1_month" />
                      <Picker.Item label="Paid 6 Months" value="paid_6_month" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Request Status</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={sellerStatus}
                      onValueChange={(itemValue) => setSellerStatus(itemValue)}
                      mode="dropdown"
                    >
                      <Picker.Item label="Pending" value="pending" />
                      <Picker.Item label="Approved" value="approved" />
                      <Picker.Item label="Rejected" value="rejected" />
                    </Picker>
                  </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={submitHandler}>
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView> 
  );
};

export default ManageSellerRequestScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
  },
  actualFormContainer: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textColor,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textColor,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingRight: 10,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
  },
});
 