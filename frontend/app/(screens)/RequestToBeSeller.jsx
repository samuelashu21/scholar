// import React, { useState, useCallback } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
//   Image,
//   ActivityIndicator,
//   StatusBar,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter, useFocusEffect } from "expo-router";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import * as ImagePicker from "expo-image-picker";
// import Toast from "react-native-toast-message";

// import { Colors } from "../../constants/Utils";
// import { BASE_URL } from "../../constants/Urls";
// import {
//   useRequestSellerMutation,
//   useUploadProfileImageMutation,
// } from "../../slices/userAPiSlice";
// import { setCredentials } from "../../slices/authSlice";

// const PLANS = [
//   { id: "free", label: "FREE", price: "$0", tier: 0, icon: "person-outline", features: ["Standard placement", "Basic store profile"] },
//   { id: "paid_1_month", label: "1 MO", price: "$9", tier: 1, icon: "checkmark-circle", features: ["Silver Badge", "Priority listing", "Direct support"] },
//   { id: "paid_6_month", label: "6 MO", price: "$49", tier: 2, icon: "medal", features: ["Gold Badge", "Top-tier ranking", "Category featured"] },
//   { id: "paid_1_year", label: "1 YR", price: "$89", tier: 3, icon: "diamond", features: ["Diamond Badge", "Guaranteed Top 3", "Home spotlight"] },
// ];

// // Reusable Timeline Component for Status
// const TimelineItem = ({ icon, title, desc, active, completed }) => (
//   <View style={styles.timelineItem}>
//     <View style={[styles.timelineIcon, (active || completed) && styles.timelineIconActive]}>
//       <Ionicons name={completed ? "checkmark" : icon} size={16} color="white" />
//     </View>
//     <View style={styles.timelineTextContainer}>
//       <Text style={[styles.timelineTitle, active && styles.activeText]}>{title}</Text>
//       <Text style={styles.timelineDesc}>{desc}</Text>
//     </View>
//   </View>
// );

// export default function RequestToBeSeller() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { userInfo } = useSelector((state) => state.auth);

//   const [storeName, setStoreName] = useState("");
//   const [storeDescription, setStoreDescription] = useState("");
//   const [storeLogo, setStoreLogo] = useState("");
//   const [subscriptionType, setSubscription] = useState("free");

//   const isPending = userInfo?.sellerRequest?.status === "pending";
//   const selectedPlan = PLANS.find(p => p.id === subscriptionType);
  
//   const [uploadImage, { isLoading: loadingUpload }] = useUploadProfileImageMutation();
//   const [requestSeller, { isLoading: loadingSubmit }] = useRequestSellerMutation();

//   useFocusEffect(
//     useCallback(() => {
//       if (userInfo?.sellerProfile) {
//         setStoreName(userInfo.sellerProfile.storeName || "");
//         setStoreDescription(userInfo.sellerProfile.storeDescription || "");
//         setStoreLogo(userInfo.sellerProfile.storeLogo || "");
//       }
//       if (userInfo?.sellerRequest?.subscriptionType) {
//         setSubscription(userInfo.sellerRequest.subscriptionType);
//       }
//     }, [userInfo])
//   );

//   const getImageUrl = (path) => {
//     if (!path) return "https://cdn-icons-png.flaticon.com/512/3597/3597075.png";
//     return path.startsWith("http") ? path : `${BASE_URL}${path}`;
//   };

//   const uploadLogoHandler = async () => {
//     if (isPending) return;
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) return Toast.show({ type: "error", text1: "Permission denied" });
    
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.6,
//     });

//     if (!result.canceled) {
//       const formData = new FormData();
//       formData.append("image", { 
//         uri: Platform.OS === "android" ? result.assets[0].uri : result.assets[0].uri.replace("file://", ""), 
//         name: "logo.jpg", 
//         type: "image/jpeg" 
//       });
//       try {
//         const res = await uploadImage(formData).unwrap();
//         setStoreLogo(res.image);
//         Toast.show({ type: "success", text1: "Logo Uploaded" });
//       } catch (err) { Toast.show({ type: "error", text1: "Upload failed" }); }
//     }
//   };

//   const submitRequest = async () => {
//     try {
//       const payload = { storeName, storeDescription, storeLogo, subscriptionType };
//       await requestSeller(payload).unwrap();
      
//       dispatch(setCredentials({
//         ...userInfo,
//         sellerProfile: { storeName, storeDescription, storeLogo },
//         sellerRequest: { isRequested: true, status: "pending", subscriptionType },
//       }));

//       Toast.show({ type: "success", text1: "Request Sent" });
//       router.replace("/account"); 
//     } catch (err) { 
//       Toast.show({ type: "error", text1: "Failed", text2: err?.data?.message || "Something went wrong" }); 
//     }
//   };

//   const renderBadgeColor = (tier, isActive) => {
//     if (!isActive) return "#ADB5BD";
//     if (tier === 3) return "#00E5FF";
//     if (tier === 2) return "#FFD700";
//     return "white";
//   };

//   const currentStep = !storeName ? 1 : !storeLogo ? 2 : 3;

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" />
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Seller Registration</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
//         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          
//           {/* INTERACTIVE STATUS CARD (Replaces Stepper when Pending) */}
//           {isPending ? (
//             <View style={styles.statusCard}>
//               <View style={styles.statusHeader}>
//                 <Text style={styles.statusTitle}>Application in Progress</Text>
//                 <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>PENDING</Text></View>
//               </View>
//               <View style={styles.timelineContainer}>
//                 <TimelineItem icon="send" title="Request Sent" desc="We've received your data" completed />
//                 <TimelineItem icon="search" title="Internal Review" desc="Checking store guidelines" active />
//                 <TimelineItem icon="rocket" title="Final Activation" desc="Your store goes live" />
//               </View>
//             </View>
//           ) : (
//             <View style={styles.stepperContainer}>
//               {[1, 2, 3].map((step) => (
//                 <View key={step} style={styles.stepWrapper}>
//                   <View style={[styles.stepCircle, currentStep >= step && styles.stepCircleActive]}>
//                     <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>{step}</Text>
//                   </View>
//                   {step < 3 && <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />}
//                 </View>
//               ))}
//             </View>
//           )}

//           {/* LIVE PREVIEW CARD */}
//           <View style={[styles.previewCard, isPending && styles.previewCardLocked]}>
//             <Text style={styles.previewTag}>{isPending ? "SUBMITTED PREVIEW" : "LIVE PREVIEW"}</Text>
//             <View style={styles.previewContent}>
//               <Image source={{ uri: getImageUrl(storeLogo) }} style={styles.previewImage} />
//               <View>
//                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                   <Text style={styles.previewName}>{storeName || "Your Store Name"}</Text>
//                   {subscriptionType !== 'free' && (
//                     <Ionicons name={selectedPlan.icon} size={14} color={renderBadgeColor(selectedPlan.tier, true)} style={{ marginLeft: 5 }} />
//                   )}
//                 </View>
//                 <Text style={styles.previewStatus}>{selectedPlan.label} Seller</Text>
//               </View>
//             </View>
//           </View>

//           {/* FORM SECTION */}
//           <View style={[styles.formCard, isPending && { opacity: 0.7 }]}>
//             <View style={styles.inputSection}>
//               <Text style={styles.label}>Official Store Name</Text>
//               <TextInput 
//                 style={styles.input} 
//                 value={storeName} 
//                 onChangeText={setStoreName} 
//                 editable={!isPending}
//                 placeholder="e.g. Apex Global" 
//               />
//             </View>

//             <View style={styles.inputSection}>
//               <View style={styles.labelRow}>
//                 <Text style={styles.label}>Store Description</Text>
//                 <Text style={styles.charCount}>{storeDescription.length}/500</Text>
//               </View>
//               <TextInput 
//                 style={[styles.input, styles.textArea]} 
//                 multiline 
//                 value={storeDescription} 
//                 onChangeText={setStoreDescription} 
//                 editable={!isPending}
//                 placeholder="Briefly describe your products..." 
//               />
//             </View>

//             <View style={styles.inputSection}>
//               <Text style={styles.label}>Choose Plan</Text>
//               <View style={styles.subscriptionGrid}>
//                 {PLANS.map((plan) => (
//                   <TouchableOpacity 
//                     key={plan.id} 
//                     style={[styles.subCard, subscriptionType === plan.id && styles.subActive]} 
//                     onPress={() => !isPending && setSubscription(plan.id)}
//                     disabled={isPending}
//                   >
//                     <Ionicons name={plan.icon} size={16} color={renderBadgeColor(plan.tier, subscriptionType === plan.id)} />
//                     <Text style={[styles.subText, subscriptionType === plan.id && styles.subTextActive]}>{plan.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <TouchableOpacity
//               style={[styles.submitBtn, (storeName.length < 3 || loadingSubmit || isPending) && { backgroundColor: "#DEE2E6" }]}
//               onPress={submitRequest}
//               disabled={loadingSubmit || storeName.length < 3 || isPending}
//             >
//               {loadingSubmit ? (
//                 <ActivityIndicator color="white" />
//               ) : (
//                 <Text style={styles.submitText}>{isPending ? "Waiting for Approval" : "Launch My Store"}</Text>
//               )}
//             </TouchableOpacity>
            
//             {!isPending && (
//               <TouchableOpacity onPress={uploadLogoHandler} style={styles.uploadLink}>
//                 <Text style={styles.uploadLinkText}>{storeLogo ? "Change Store Logo" : "Add Store Logo"}</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#FBFBFB", paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F3F5" },
//   backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" },
//   headerTitle: { fontSize: 17, fontWeight: "800", color: "#1A1A1A" },
//   scrollContainer: { paddingBottom: 40 },
  
//   // Status Card & Timeline
//   statusCard: { backgroundColor: "white", margin: 16, padding: 20, borderRadius: 24, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
//   statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
//   statusTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
//   pendingBadge: { backgroundColor: '#FFF9DB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
//   pendingBadgeText: { color: '#F59F00', fontSize: 10, fontWeight: '800' },
//   timelineContainer: { gap: 15 },
//   timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   timelineIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E9ECEF', justifyContent: 'center', alignItems: 'center' },
//   timelineIconActive: { backgroundColor: Colors.primary || "#007AFF" },
//   timelineTextContainer: { flex: 1 },
//   timelineTitle: { fontSize: 13, fontWeight: '700', color: '#ADB5BD' },
//   activeText: { color: '#1A1A1A' },
//   timelineDesc: { fontSize: 11, color: '#ADB5BD' },

//   stepperContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
//   stepWrapper: { flexDirection: 'row', alignItems: 'center' },
//   stepCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E9ECEF', justifyContent: 'center', alignItems: 'center' },
//   stepCircleActive: { backgroundColor: Colors.primary || "#007AFF" },
//   stepNumber: { fontSize: 10, color: '#ADB5BD', fontWeight: 'bold' },
//   stepNumberActive: { color: 'white' },
//   stepLine: { width: 30, height: 2, backgroundColor: '#E9ECEF', marginHorizontal: 5 },
//   stepLineActive: { backgroundColor: Colors.primary || "#007AFF" },

//   previewCard: { marginHorizontal: 16, backgroundColor: '#1A1A1A', borderRadius: 20, padding: 18, marginBottom: 15 },
//   previewCardLocked: { borderWidth: 1, borderColor: Colors.primary || "#007AFF" },
//   previewTag: { color: '#888', fontSize: 9, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
//   previewContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   previewImage: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#333' },
//   previewName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
//   previewStatus: { color: '#ADB5BD', fontSize: 12 },

//   formCard: { backgroundColor: "white", marginHorizontal: 16, padding: 20, borderRadius: 24 },
//   inputSection: { marginBottom: 20 },
//   label: { fontSize: 13, fontWeight: "700", color: "#495057", marginBottom: 8 },
//   labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
//   charCount: { fontSize: 11, color: '#ADB5BD' },
//   input: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: "#F1F3F5" },
//   textArea: { height: 80, textAlignVertical: "top" },
  
//   subscriptionGrid: { flexDirection: "row", gap: 6 },
//   subCard: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F8F9FA", alignItems: "center", borderWidth: 1, borderColor: "#F1F3F5" },
//   subActive: { backgroundColor: Colors.primary || "#007AFF", borderColor: Colors.primary || "#007AFF" },
//   subText: { fontSize: 9, fontWeight: "800", color: "#6C757D", marginTop: 4 },
//   subTextActive: { color: "white" },

//   submitBtn: { backgroundColor: Colors.primary || "#007AFF", padding: 16, borderRadius: 14, marginTop: 10, alignItems: "center" },
//   submitText: { color: "white", fontSize: 16, fontWeight: "700" },
//   uploadLink: { marginTop: 15, alignItems: 'center' },
//   uploadLinkText: { color: Colors.primary, fontSize: 13, fontWeight: '600' }
// });



import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
import {
  useRequestSellerMutation,
  useUploadProfileImageMutation,
} from "../../slices/userAPiSlice";
import { setCredentials } from "../../slices/authSlice";

const PLANS = [
  { id: "free", label: "FREE", price: "$0", tier: 0, icon: "person-outline", features: ["Standard placement", "Basic store profile", "Self-service dashboard"] },
  { id: "paid_1_month", label: "1 MO", price: "$9", tier: 1, icon: "checkmark-circle", features: ["Silver Badge", "Priority listing", "Direct support", "Basic Analytics"] },
  { id: "paid_6_month", label: "6 MO", price: "$49", tier: 2, icon: "medal", features: ["Gold Badge", "Top-tier ranking", "Category featured", "Advanced Insights"] },
  { id: "paid_1_year", label: "1 YR", price: "$89", tier: 3, icon: "diamond", features: ["Diamond Badge", "Guaranteed Top 3", "Home spotlight", "Personal Account Manager"] },
];

// Reusable Timeline Component
const TimelineItem = ({ icon, title, desc, active, completed, isError }) => (
  <View style={styles.timelineItem}>
    <View style={[
      styles.timelineIcon, 
      (active || completed) && styles.timelineIconActive,
      isError && styles.timelineIconError
    ]}>
      <Ionicons name={completed ? "checkmark" : icon} size={16} color="white" />
    </View>
    <View style={styles.timelineTextContainer}>
      <Text style={[styles.timelineTitle, (active || completed) && styles.activeText, isError && styles.errorText]}>{title}</Text>
      <Text style={styles.timelineDesc}>{desc}</Text>
    </View>
  </View>
);

export default function RequestToBeSeller() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [subscriptionType, setSubscription] = useState("free");

  // Status Logic
  const sellerRequest = userInfo?.sellerRequest;
  const isPending = sellerRequest?.status === "pending";
  const isRejected = sellerRequest?.status === "rejected";
  const isProcessed = isPending || isRejected;
  const rejectionReason = sellerRequest?.rejectionReason;

  const selectedPlan = PLANS.find(p => p.id === subscriptionType);
  
  const [uploadImage, { isLoading: loadingUpload }] = useUploadProfileImageMutation();
  const [requestSeller, { isLoading: loadingSubmit }] = useRequestSellerMutation();

  useFocusEffect(
    useCallback(() => {
      if (userInfo?.sellerProfile) {
        setStoreName(userInfo.sellerProfile.storeName || "");
        setStoreDescription(userInfo.sellerProfile.storeDescription || "");
        setStoreLogo(userInfo.sellerProfile.storeLogo || "");
      }
      if (sellerRequest?.subscriptionType) {
        setSubscription(sellerRequest.subscriptionType);
      }
    }, [userInfo])
  );

  const getImageUrl = (path) => {
    if (!path) return "https://cdn-icons-png.flaticon.com/512/3597/3597075.png";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const uploadLogoHandler = async () => {
    if (isProcessed) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Toast.show({ type: "error", text1: "Permission denied" });
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append("image", { 
        uri: Platform.OS === "android" ? result.assets[0].uri : result.assets[0].uri.replace("file://", ""), 
        name: "logo.jpg", 
        type: "image/jpeg" 
      });
      try {
        const res = await uploadImage(formData).unwrap();
        setStoreLogo(res.image);
        Toast.show({ type: "success", text1: "Logo Uploaded" });
      } catch (err) { Toast.show({ type: "error", text1: "Upload failed" }); }
    }
  };

  const submitRequest = async () => {
    try {
      const payload = { storeName, storeDescription, storeLogo, subscriptionType };
      await requestSeller(payload).unwrap();
      
      dispatch(setCredentials({
        ...userInfo,
        sellerProfile: { storeName, storeDescription, storeLogo },
        sellerRequest: { isRequested: true, status: "pending", subscriptionType },
      }));

      Toast.show({ type: "success", text1: "Request Sent" });
      router.replace("/account"); 
    } catch (err) { 
      Toast.show({ type: "error", text1: "Failed", text2: err?.data?.message || "Something went wrong" }); 
    }
  };

  const renderBadgeColor = (tier, isActive) => {
    if (!isActive) return "#ADB5BD";
    if (tier === 3) return "#00E5FF";
    if (tier === 2) return "#FFD700";
    return "white";
  };

  const currentStep = !storeName ? 1 : !storeLogo ? 2 : 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Registration</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          
          {/* STATUS CARD (Pending or Rejected) */}
          {isProcessed ? (
            <View style={[styles.statusCard, isRejected && styles.statusCardRejected]}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>{isRejected ? "Review Completed" : "Application in Progress"}</Text>
                <View style={[styles.statusBadge, isRejected ? styles.rejectedBadge : styles.pendingBadge]}>
                  <Text style={[styles.statusBadgeText, isRejected ? styles.rejectedBadgeText : styles.pendingBadgeText]}>
                    {isRejected ? "REJECTED" : "PENDING"}
                  </Text>
                </View>
              </View>

              {isRejected && (
                <View style={styles.rejectionBox}>
                  <Ionicons name="alert-circle" size={18} color="#E03131" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rejectionLabel}>Reason for Rejection:</Text>
                    <Text style={styles.rejectionText}>{rejectionReason || "Store content does not meet our guidelines."}</Text>
                  </View>
                </View>
              )}

              <View style={styles.timelineContainer}>
                <TimelineItem icon="send" title="Request Sent" desc="We've received your data" completed />
                <TimelineItem 
                  icon={isRejected ? "close-circle" : "search"} 
                  title={isRejected ? "Review Failed" : "Internal Review"} 
                  desc={isRejected ? "Requirements not met" : "Checking store guidelines"} 
                  active={!isRejected}
                  isError={isRejected}
                />
                <TimelineItem icon="rocket" title="Final Activation" desc="Your store goes live" />
              </View>
            </View>
          ) : (
            <View style={styles.stepperContainer}>
              {[1, 2, 3].map((step) => (
                <View key={step} style={styles.stepWrapper}>
                  <View style={[styles.stepCircle, currentStep >= step && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>{step}</Text>
                  </View>
                  {step < 3 && <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />}
                </View>
              ))}
            </View>
          )}

          {/* LIVE PREVIEW CARD */}
          <View style={[styles.previewCard, isProcessed && styles.previewCardLocked]}>
            <Text style={styles.previewTag}>{isProcessed ? "SUBMITTED PREVIEW" : "LIVE PREVIEW"}</Text>
            <View style={styles.previewContent}>
              <Image source={{ uri: getImageUrl(storeLogo) }} style={styles.previewImage} />
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.previewName}>{storeName || "Your Store Name"}</Text>
                  {subscriptionType !== 'free' && (
                    <Ionicons name={selectedPlan?.icon} size={14} color={renderBadgeColor(selectedPlan?.tier, true)} style={{ marginLeft: 5 }} />
                  )}
                </View>
                <Text style={styles.previewStatus}>{selectedPlan?.label} Seller</Text>
              </View>
            </View>
          </View>

          {/* PLAN FEATURES DESCRIPTION */}
          {!isProcessed && (
            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>{selectedPlan.label} Plan Includes:</Text>
              {selectedPlan.features.map((f, i) => (
                <View key={i} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary || "#007AFF"} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          )}

          {/* FORM SECTION */}
          <View style={[styles.formCard, isProcessed && { opacity: 0.7 }]}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>Official Store Name</Text>
              <TextInput 
                style={styles.input} 
                value={storeName} 
                onChangeText={setStoreName} 
                editable={!isProcessed}
                placeholder="e.g. Apex Global" 
              />
            </View>

            <View style={styles.inputSection}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Store Description</Text>
                <Text style={styles.charCount}>{storeDescription.length}/500</Text>
              </View>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                multiline 
                value={storeDescription} 
                onChangeText={setStoreDescription} 
                editable={!isProcessed}
                placeholder="Briefly describe your products..." 
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Choose Plan</Text>
              <View style={styles.subscriptionGrid}>
                {PLANS.map((plan) => (
                  <TouchableOpacity 
                    key={plan.id} 
                    style={[styles.subCard, subscriptionType === plan.id && styles.subActive]} 
                    onPress={() => !isProcessed && setSubscription(plan.id)}
                    disabled={isProcessed}
                  >
                    <Ionicons name={plan.icon} size={16} color={renderBadgeColor(plan.tier, subscriptionType === plan.id)} />
                    <Text style={[styles.subText, subscriptionType === plan.id && styles.subTextActive]}>{plan.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (storeName.length < 3 || loadingSubmit || isProcessed) && { backgroundColor: "#DEE2E6" }]}
              onPress={submitRequest}
              disabled={loadingSubmit || storeName.length < 3 || isProcessed}
            >
              {loadingSubmit ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitText}>
                  {isRejected ? "Request Rejected" : isPending ? "Waiting for Approval" : "Launch My Store"}
                </Text>
              )}
            </TouchableOpacity>
            
            {!isProcessed && (
              <TouchableOpacity onPress={uploadLogoHandler} style={styles.uploadLink}>
                <Text style={styles.uploadLinkText}>{storeLogo ? "Change Store Logo" : "Add Store Logo"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBFBFB", paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F3F5" },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#1A1A1A" },
  scrollContainer: { paddingBottom: 40 },
  
  // Status Cards
  statusCard: { backgroundColor: "white", margin: 16, padding: 20, borderRadius: 24, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  statusCardRejected: { borderTopWidth: 4, borderTopColor: '#E03131' },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pendingBadge: { backgroundColor: '#FFF9DB' },
  rejectedBadge: { backgroundColor: '#FFF5F5' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  pendingBadgeText: { color: '#F59F00' },
  rejectedBadgeText: { color: '#E03131' },

  // Rejection Box
  rejectionBox: { flexDirection: 'row', gap: 10, backgroundColor: '#F8F9FA', padding: 12, borderRadius: 12, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#E03131' },
  rejectionLabel: { fontSize: 12, fontWeight: '700', color: '#495057' },
  rejectionText: { fontSize: 12, color: '#868E96', marginTop: 2 },

  // Timeline
  timelineContainer: { gap: 15 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E9ECEF', justifyContent: 'center', alignItems: 'center' },
  timelineIconActive: { backgroundColor: Colors.primary || "#007AFF" },
  timelineIconError: { backgroundColor: '#E03131' },
  timelineTextContainer: { flex: 1 },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: '#ADB5BD' },
  activeText: { color: '#1A1A1A' },
  errorText: { color: '#E03131' },
  timelineDesc: { fontSize: 11, color: '#ADB5BD' },

  // Plan Features Card
  featuresCard: { marginHorizontal: 16, padding: 15, backgroundColor: '#E7F5FF', borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#A5D8FF' },
  featuresTitle: { fontSize: 13, fontWeight: '800', color: '#1971C2', marginBottom: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  featureText: { fontSize: 12, color: '#495057' },

  stepperContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E9ECEF', justifyContent: 'center', alignItems: 'center' },
  stepCircleActive: { backgroundColor: Colors.primary || "#007AFF" },
  stepNumber: { fontSize: 10, color: '#ADB5BD', fontWeight: 'bold' },
  stepNumberActive: { color: 'white' },
  stepLine: { width: 30, height: 2, backgroundColor: '#E9ECEF', marginHorizontal: 5 },
  stepLineActive: { backgroundColor: Colors.primary || "#007AFF" },

  previewCard: { marginHorizontal: 16, backgroundColor: '#1A1A1A', borderRadius: 20, padding: 18, marginBottom: 15 },
  previewCardLocked: { opacity: 0.8 },
  previewTag: { color: '#888', fontSize: 9, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  previewContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewImage: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#333' },
  previewName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  previewStatus: { color: '#ADB5BD', fontSize: 12 },

  formCard: { backgroundColor: "white", marginHorizontal: 16, padding: 20, borderRadius: 24 },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "700", color: "#495057", marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  charCount: { fontSize: 11, color: '#ADB5BD' },
  input: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: "#F1F3F5" },
  textArea: { height: 80, textAlignVertical: "top" },
  
  subscriptionGrid: { flexDirection: "row", gap: 6 },
  subCard: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F8F9FA", alignItems: "center", borderWidth: 1, borderColor: "#F1F3F5" },
  subActive: { backgroundColor: Colors.primary || "#007AFF", borderColor: Colors.primary || "#007AFF" },
  subText: { fontSize: 9, fontWeight: "800", color: "#6C757D", marginTop: 4 },
  subTextActive: { color: "white" },

  submitBtn: { backgroundColor: Colors.primary || "#007AFF", padding: 16, borderRadius: 14, marginTop: 10, alignItems: "center" },
  submitText: { color: "white", fontSize: 16, fontWeight: "700" },
  uploadLink: { marginTop: 15, alignItems: 'center' },
  uploadLinkText: { color: Colors.primary || "#007AFF", fontSize: 13, fontWeight: '600' }
});