// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   Keyboard,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import React, { useState, useEffect } from "react";
// import { Link, useRouter, useLocalSearchParams } from "expo-router";
// import { useSelector, useDispatch } from "react-redux";
// import { useLoginMutation } from "../../slices/userAPiSlice";
// import { setCredentials } from "../../slices/authSlice";
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import Toast from "react-native-toast-message";
// import FormContainer from "../../components/FormContainer";
// import { Colors } from "../../constants/Utils";

// const LoginScreen = () => {
//   const [emailOrPhone, setEmailOrPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const dispatch = useDispatch();
//   const router = useRouter();

//   const [login, { isLoading }] = useLoginMutation();
//   const { userInfo } = useSelector((state) => state.auth);
//   const localSearchParams = useLocalSearchParams();
//   const redirect = localSearchParams.redirect || "/";

//   useEffect(() => {
//     if (userInfo) {
//       router.replace(redirect);
//     }
//   }, [userInfo, redirect, router]);

//   const submitHandler = async () => {
//     Keyboard.dismiss();

//     if (!emailOrPhone || !password) {
//       Toast.show({
//         type: "error",
//         text1: "Error",
//         text2: "Please fill in all fields",
//         position: "top",
//         visibilityTime: 5000,
//       });
//       return;
//     }

//     try {
//       const res = await login({ email: emailOrPhone, password }).unwrap();
//       dispatch(setCredentials({ ...res }));
//       router.replace(redirect);
//     } catch (error) {
//       Toast.show({
//         type: "error",
//         text1: "Login Failed",
//         text2: error?.data?.message || error.error,
//         position: "top",
//         visibilityTime: 7000,
//       });
//     }
//   };

//   const togglePasswordVisibility = () => setShowPassword(!showPassword);

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <FormContainer>
//         <View style={styles.logoContainer}>
//           <Image
//             source={require("../../assets/images/logo.png")}
//             style={styles.logo}
//           />
//           <Text style={styles.slogan}>One Login. Endless Choices</Text>
//         </View>

//         <Text style={styles.title}>Sign In</Text>

//         {/* Email or Phone */}
//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Email or Phone:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter email or phone"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={emailOrPhone}
//             onChangeText={setEmailOrPhone}
//           />
//         </View>

//         {/* Password */}
//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Password:</Text>
//           <View style={styles.passwordInputContainer}>
//             <TextInput
//               style={styles.passwordInput}
//               placeholder="Enter Password"
//               secureTextEntry={!showPassword}
//               value={password}
//               onChangeText={setPassword}
//             />
//             <TouchableOpacity
//               onPress={togglePasswordVisibility}
//               style={styles.passwordToggle}
//             >
//               {showPassword ? (
//                 <FontAwesome6
//                   name="eye-slash"
//                   size={20}
//                   color={Colors.primary}
//                 />
//               ) : (
//                 <FontAwesome6 name="eye" size={20} color={Colors.primary} />
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>

//          {/* Forgot Password */}
//         <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
//           <Text style={{ fontSize: 14 }}>
//             Forgot Password?{" "}
//             <Link
//               href={{
//                 pathname: "/RequestResetScreen",
//                 params: redirect !== "/" ? { redirect } : {},
//               }}
//               style={{ color: Colors.primary, fontWeight: "500" }}
//             >
//               Reset
//             </Link>
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={[styles.button, isLoading && styles.buttonDisabled]}
//           onPress={submitHandler}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color={Colors.white} />
//           ) : (
//             <Text style={styles.buttonText}>Sign In</Text>
//           )}
//         </TouchableOpacity>

//         <View style={styles.registerContainer}>
//           <Text style={styles.registerText}>
//             New User?{" "}
//             <Link
//               href={{
//                 pathname: "/RegisterScreen",
//                 params: redirect !== "/" ? { redirect } : {},
//               }}
//               style={styles.registerLink}
//             >
//               Register
//             </Link>
//           </Text>
//         </View>
//       </FormContainer>
//     </TouchableWithoutFeedback> 
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   logoContainer: {
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   logo: {
//     width: 150,
//     height: 150,
//     resizeMode: "contain",
//     marginBottom: 10,
//   },
//   slogan: {
//     fontSize: 18,
//     color: Colors.secondaryTextColor,
//     textAlign: "center",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 16,
//     textAlign: "center",
//     color: Colors.textColor,
//   },
//   formGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: Colors.textColor,
//     marginBottom: 8,
//   },
//   input: {
//     width: "100%",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     backgroundColor: Colors.white,
//     color: Colors.textColor,
//   },
//   passwordInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     backgroundColor: Colors.white,
//   },
//   passwordInput: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     color: Colors.textColor,
//   },
//   passwordToggle: {
//     padding: 10,
//     position: "absolute",
//     right: 5,
//   },
//   button: {
//     width: "100%",
//     backgroundColor: Colors.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 16,
//   },
//   buttonDisabled: {
//     opacity: 0.7,
//   },
//   buttonText: {
//     color: Colors.white,
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   registerContainer: {
//     paddingVertical: 12,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   registerText: {
//     fontSize: 14,
//     color: Colors.secondaryTextColor,
//   },
//   registerLink: {
//     color: Colors.primary,
//     fontWeight: "bold",
//     textDecorationLine: "underline",
//   },
// });



import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,  
  Image,
  ActivityIndicator,
  KeyboardAvoidingView, // Added
  Platform,             // Added
  ScrollView,           // Added
} from "react-native";
import React, { useState, useEffect } from "react";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation } from "../../slices/userAPiSlice";
import { setCredentials } from "../../slices/authSlice";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Toast from "react-native-toast-message";
import FormContainer from "../../components/FormContainer";
import { Colors } from "../../constants/Utils";

const LoginScreen = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const localSearchParams = useLocalSearchParams();
  const redirect = localSearchParams.redirect || "/";

  useEffect(() => {
    if (userInfo) {
      router.replace(redirect);
    }
  }, [userInfo, redirect, router]);

  const submitHandler = async () => {
    Keyboard.dismiss();

    if (!emailOrPhone || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    try {
      const res = await login({ email: emailOrPhone, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      router.replace(redirect);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error?.data?.message || error.error,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Colors.white }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormContainer>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
              />
              <Text style={styles.slogan}>One Login. Endless Choices</Text>
            </View>

            <Text style={styles.title}>Sign In</Text>

            {/* Email or Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email or Phone:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email or phone"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
              />
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password:</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <FontAwesome6 
                    name={showPassword ? "eye-slash" : "eye"} 
                    size={18} 
                    color={Colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
              <Link
                href={{
                  pathname: "/RequestResetScreen",
                  params: redirect !== "/" ? { redirect } : {},
                }}
                style={{ color: Colors.primary, fontSize: 14, fontWeight: "500" }}
              >
                Forgot Password?
              </Link>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={submitHandler}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Social Login Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            

           {/* Update this in LoginScreen.js */}
<View style={styles.registerContainer}>
  <Text style={styles.registerText}>
    Don't have an account?{" "}
    <Link
      href={{
        pathname: "/AuthEntryScreen", // Points to the new page
        params: redirect !== "/" ? { redirect } : {},
      }}
      style={styles.registerLink}
    >
      Register 
    </Link>
  </Text>
</View>
          </FormContainer>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fafafa",
    color: "#333",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    color: "#333",
  },
  passwordToggle: {
    padding: 12,
  },
  button: {
    width: "100%",
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  // Social Styles
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#aaa",
    fontSize: 12,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  registerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
  registerLink: {
    color: Colors.primary,
    fontWeight: "bold",
  },
}); 