import React from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";

export default function SellerDashboard() { 
  const router = useRouter(); 
  const { userInfo } = useSelector((state) => state.auth); 

  const status = userInfo?.sellerRequest?.status || "pending";
  const storeName = userInfo?.sellerProfile?.storeName || "Your Store";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" /> 
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/account")} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="clock-fast" size={50} color={Colors.primary} />
          </View>
           
          <Text style={styles.title}>Application Pending</Text>
          <Text style={styles.subtitle}>
            We're reviewing <Text style={{fontWeight: 'bold'}}>{storeName}</Text>. 
            You'll receive a notification once approved.
          </Text>

          {/* PROGRESS STEPS */}
          <View style={styles.stepsContainer}>
            <Step label="Request Received" sub="Completed" completed />
            <Step label="Staff Review" sub="In Progress" active />
            <Step label="Store Setup" sub="Pending Approval" />
          </View>

          <TouchableOpacity  
            style={styles.button} 
            onPress={() => router.replace("/account")}
          >
            <Text style={styles.buttonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component for progress steps
const Step = ({ label, sub, completed, active }) => (
  <View style={styles.stepRow}>
    <View style={styles.dotColumn}>
      <View style={[styles.dot, (completed || active) && {backgroundColor: Colors.primary}]} />
      <View style={styles.line} />
    </View>
    <View style={styles.stepText}>
      <Text style={[styles.stepLabel, !completed && !active && {color: '#ADB5BD'}]}>{label}</Text>
      <Text style={styles.stepSub}>{sub}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFBFB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "white" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" },
  content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: "white", padding: 30, borderRadius: 30, alignItems: "center", elevation: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F0F4FF", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "800", color: "#1A1A1A", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#6C757D", textAlign: "center", marginBottom: 30, lineHeight: 20 },
  stepsContainer: { width: '100%', marginBottom: 30 },
  stepRow: { flexDirection: 'row', gap: 15 },
  dotColumn: { alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#E9ECEF', borderWidth: 3, borderColor: 'white' },
  line: { width: 2, height: 40, backgroundColor: '#F1F3F5' },
  stepLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  stepSub: { fontSize: 12, color: '#ADB5BD' },
  button: { backgroundColor: Colors.primary, width: '100%', padding: 18, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 }
}); 