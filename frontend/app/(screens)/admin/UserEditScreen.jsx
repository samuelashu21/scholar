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
import React, { useState, useEffect, use } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Message from "../../../components/Message";
import { Colors } from "../../../constants/Utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../../slices/userAPiSlice";

const UserEditScreen = () => {
   const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); 
   const [accountStatus, setAccountStatus] = useState("active"); // default active
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.id;

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetUserDetailsQuery(userId);

  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  // Toggle account status through enum values
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
    await updateUser({
      userId,
      FirstName: firstName,
      LastName: lastName,
      email,
      phone,
      accountStatus,
      isAdmin,
    });

    Toast.show({ 
      type: "success",
      text1: "Success",
      text2: "User updated successfully",
    });

    refetch();
    router.replace("/admin/UserListScreen");
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
      setEmail(user.email); 
      setPhone(user.phone || "");
      setAccountStatus(user.accountStatus || "active");
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push("/admin/UserListScreen")}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back-circle"
                size={35}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Edit User</Text>
          </View>

          <View style={styles.actualFormContainer}>
            {loadingUpdate && (
              <ActivityIndicator size="large" color={Colors.primary} />
            )}
            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : error ? (
              <Message variant="error">
                {error?.data?.message || error.error}
              </Message>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>firstName</Text> 
                  <TextInput
                    style={styles.input}
                    placeholder="Enter firstName"
                    value={firstName} 
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>lastName</Text> 
                  <TextInput
                    style={styles.input}
                    placeholder="Enter lastName"
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
                  <Text style={styles.label}>phone</Text> 
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone"
                    value={phone}
                    onChangeText={setPhone}
                  /> 
                </View>

                  <View style={styles.switchContainer}>
                  <Text style={styles.label}>Account Status</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Switch
                      value={accountStatus === "active"}
                      onValueChange={toggleAccountStatus}
                      trackColor={{
                        false: Colors.lightGray,
                        true: Colors.primary,
                      }}
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
                    trackColor={{
                      false: Colors.lightGray,
                      true: Colors.primary,
                    }}
                    thumbColor={Colors.white}
                  />
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

export default UserEditScreen;

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
    flex: 1,
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
});
