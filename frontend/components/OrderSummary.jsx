import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Colors } from "../constants/Utils";
import { useRouter } from "expo-router";
import { isAdminUser } from "../constants/roles";

const OrderSummary = ({
  order,
  userInfo, 
  isLoadingDeliver,
  isLoadingPayPalConfig,
  // isCreatingPayPalOrder,
  // isCapturingPayPalOrder, 
  // isPayingOrder,
  // paypalConfigError,
  // paypalConfig,
  // onPayWithPayPal,
  onMarkAsDelivered,
}) => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Order Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.text}>Items</Text>
        <Text style={styles.textPrice}>${order.itemsPrice}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.text}>Shipping</Text>
        <Text style={styles.textPrice}>${order.shippingPrice}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.text}>Tax</Text>
        <Text style={styles.textPrice}>${order.taxPrice}</Text>
      </View>
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalText}>${order.totalPrice}</Text>
      </View>

      {!order.isPaid && (
        <View style={styles.paymentSection}>
          {isLoadingPayPalConfig ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : paypalConfigError ? (
            <Text style={styles.errorText}>
              Error loading PayPal configuration
            </Text>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                (isCreatingPayPalOrder ||
                  isCapturingPayPalOrder ||
                  isPayingOrder ||
                  !order ||
                  !paypalConfig?.clientId) &&
                  styles.buttonDisabled,
              ]}
              onPress={onPayWithPayPal}
              disabled={
                isCreatingPayPalOrder ||
                isCapturingPayPalOrder ||
                isPayingOrder ||
                !order ||
                !paypalConfig?.clientId
              }
            >
              {isCreatingPayPalOrder ||
              isCapturingPayPalOrder ||
              isPayingOrder ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Pay with PayPal</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {userInfo && isAdminUser(userInfo) && order.isPaid && !order.isDelivered && (
        <View style={styles.adminActionSection}>
          <TouchableOpacity
            style={[styles.button, isLoadingDeliver && styles.buttonDisabled]}
            onPress={onMarkAsDelivered}
            disabled={isLoadingDeliver}
          >
            {isLoadingDeliver ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Mark As Delivered</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => router.push("/")}>
        <Text style={styles.buttonText}>Home Screen</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textColor,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: Colors.secondaryTextColor,
    lineHeight: 24,
  },
  textPrice: {
    fontSize: 16,
    color: Colors.textColor,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 16,
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textColor,
  },
  paymentSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 24,
  },
  adminActionSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: Colors.lightGray,
  },
  errorText: {
    color: Colors.danger, 
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
});

export default OrderSummary;