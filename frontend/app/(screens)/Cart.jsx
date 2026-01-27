import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform // Added Platform
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons"; 
import { addToCart, removeFromCart } from "../../slices/cartSlice";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls"; // 1. Import BASE_URL 

const Cart = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  // 2. Add your Image URL helper
  const getImageUrl = (imagePath) => {   
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };
   
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.qty * item.price, 0)
    .toFixed(2);

  const updateQuantity = (item, newQty) => {
    if (newQty > 0 && newQty <= item.countInStock) {
      dispatch(addToCart({ ...item, qty: newQty }));
    }
  };

  const deleteItem = (id) => {
    dispatch(removeFromCart(id));
  };
 
  const handleCheckout = () => { 
    if (userInfo) {
      router.push("(screens)/ShippingScreen");
    } else {
      router.push({
        pathname: "(screens)/LoginScreen",
        params: { redirect: "(screens)/ShippingScreen" },
      });
    }
  };

  const renderItem = ({ item }) => (
    // Wrap the entire card in a TouchableOpacity to make it clickable
    <TouchableOpacity 
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => 
        router.push({
          // This must be the path to the screen file  
          pathname: "(screens)/ProductScreen", 
          params: { productId: item._id }, // Passing the ID
        }) 
      } 
    >
      {/* 3. Use getImageUrl helper here */}
      <Image 
        source={{ uri: getImageUrl(item.image) }} 
        style={styles.image} 
        resizeMode="cover"
      />
        
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={() => deleteItem(item._id)}>
            <Ionicons name="close-circle" size={22} color={Colors.textRed} />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>${item.price}</Text>
        <View style={styles.actionRow}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, item.qty - 1)}>
              <Ionicons name="remove" size={18} color={Colors.darkGray} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, item.qty + 1)}>
              <Ionicons name="add" size={18} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtotal}>${(item.qty * item.price).toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

 return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* FIX: Use ternary ( ? : ) instead of ( && ) to avoid rendering '0' */}
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={100} color={Colors.lightGray} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Looks like you haven't added anything yet.</Text>
            {/* <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push("/")}> */}
             <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.back()}>
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </View> 
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item._id.toString()} // Ensure ID is a string
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                {/* Wrapped strings tightly in Text */}
                <Text style={styles.totalLabel}>Total ({totalItems} items)</Text>
                <Text style={styles.totalAmount}>${totalPrice}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8F9FA",
    // 3. Fix for Android StatusBar overlap
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    height: 60, // Fixed height for consistency
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: "#1A1A1A",
    textAlign: "center"
  },
  listContent: { paddingBottom: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  imageContainer: {
    width: 95,
    height: 95,
    borderRadius: 14,
    backgroundColor: "#F1F3F5", // Light grey background while loading
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Ensures image corners are rounded
  },
   
  image: { width: 90, height: 90, borderRadius: 12, backgroundColor: "#F0F0F0" },
  infoContainer: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { fontSize: 16, fontWeight: "700", color: "#333", flex: 1, marginRight: 10 },
  price: { fontSize: 15, fontWeight: "600", color: Colors.primary, marginTop: 2 },
  actionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    borderRadius: 10,
    padding: 4,
  },
  qtyBtn: { padding: 5, backgroundColor: Colors.white, borderRadius: 8, elevation: 1 },
  qtyText: { marginHorizontal: 12, fontWeight: "700", fontSize: 14 },
  subtotal: { fontSize: 14, fontWeight: "700", color: "#333" },
  footer: {
    backgroundColor: Colors.white,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Extra padding for iOS bottom bar
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginHorizontal: -20,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  totalLabel: { fontSize: 16, color: "#777", fontWeight: "500" },
  totalAmount: { fontSize: 20, fontWeight: "900", color: Colors.primary },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  checkoutBtnText: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginTop: 20 },
  emptySub: { fontSize: 14, color: "#999", marginTop: 8, textAlign: "center" },
  shopNowBtn: { marginTop: 25, backgroundColor: Colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  shopNowText: { color: Colors.white, fontWeight: "700" }
});