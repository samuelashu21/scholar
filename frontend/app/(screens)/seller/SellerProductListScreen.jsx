

 import {
   StyleSheet,
   Text,
   View,
   ActivityIndicator,
   FlatList,
   TouchableOpacity,
   Alert,
   Platform,
   SafeAreaView,
   StatusBar,
   RefreshControl,
   TextInput, // Added
 } from "react-native";
 import React, { useState } from "react"; // Added useState
 import { useRouter, useLocalSearchParams, Stack } from "expo-router";
 import { FontAwesome, Ionicons } from "@expo/vector-icons";
 import Message from "../../../components/Message";
 import { Picker } from "@react-native-picker/picker"; // Ensure this is installed
 
 import {
   useGetProductsQuery,
   useDeleteProductMutation,
 } from "../../../slices/productsApiSlice";
 import { Colors } from "../../../constants/Utils";
 
 const SellerProductListScreen = () => {
   const { pageNumber = "1" } = useLocalSearchParams();
   const router = useRouter();
 
   // --- Search & Sort States ---
   const [keyword, setKeyword] = useState("");
   const [sortOrder, setSortOrder] = useState("-createdAt");
 
   // Pass keyword and sort to the RTK Query hook
   const { data, isLoading, error, refetch, isFetching } = useGetProductsQuery({
     pageNumber: Number(pageNumber),
     keyword,
     sort: sortOrder,
   });
 
   const [deleteProduct] = useDeleteProductMutation();
 
   const deleteHandler = async (id) => {
     Alert.alert("Delete Product", "Are you sure?", [
       { text: "Cancel", style: "cancel" },
       {
         text: "Delete",
         style: "destructive",
         onPress: async () => {
           try {
             await deleteProduct(id).unwrap();
             refetch();
           } catch (err) {
             Alert.alert("Error", err?.data?.message || err.error);
           }
         },
       },
     ]);
   };
 
   const createProductHandler = () => {
     router.push({ pathname: "/admin/ProductEditScreen", params: { id: "new" } });
   };
 
   const renderPaginationButtons = () => {
     if (!data?.pages || data.pages <= 1) return <View style={{ height: 40 }} />;
     return (
       <View style={styles.paginationContainer}>
         {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
           <TouchableOpacity
             key={page}
             style={[styles.pageButton, page === data.page && styles.activePageButton]}
             onPress={() => router.setParams({ pageNumber: page.toString() })}
           >
             <Text style={[styles.pageButtonText, page === data.page && styles.activePageButtonText]}>
               {page}
             </Text>
           </TouchableOpacity>
         ))}
       </View> 
     );
   };
 
   return (
     <SafeAreaView style={styles.safeArea}>
       <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
       <Stack.Screen options={{ headerShown: false }} />
 
       {/* HEADER */}
       <View style={styles.header}>
         <TouchableOpacity onPress={() => router.push("/account")} style={styles.backButton}>
           <Ionicons name="arrow-back" size={26} color="#1A1A1A" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>My Products</Text>
         <TouchableOpacity style={styles.addButton} onPress={createProductHandler}>
           <FontAwesome name="plus" size={16} color="#FFF" />
         </TouchableOpacity>
       </View>
 
       {/* SEARCH & SORT BAR */}
       <View style={styles.filterContainer}>
         <View style={styles.searchSection}>
           <Ionicons name="search" size={18} color="#ADB5BD" style={styles.searchIcon} />
           <TextInput
             style={styles.searchInput}
             placeholder="Search products..."
             value={keyword}
             onChangeText={setKeyword}
             clearButtonMode="while-editing"
           />
         </View>
         <View style={styles.sortWrapper}>
           <Picker
             selectedValue={sortOrder}
             style={styles.sortPicker}
             onValueChange={(itemValue) => setSortOrder(itemValue)}
           >
             <Picker.Item label="Newest" value="-createdAt" />
             <Picker.Item label="Price: Low" value="price" />
             <Picker.Item label="Price: High" value="-price" />
             <Picker.Item label="Name" value="name" />
           </Picker>
         </View>
       </View>
 
       {isLoading ? (
         <View style={styles.center}>
           <ActivityIndicator size="large" color={Colors.primary} />
         </View>
       ) : (
         <FlatList
           data={data?.products}
           keyExtractor={(item) => item._id}
           refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} color={Colors.primary} />}
           contentContainerStyle={styles.listContent}
           ListHeaderComponent={() => (
             <View style={styles.tableHeader}>
               <Text style={[styles.hCell, { flex: 1 }]}>PRODUCT NAME</Text>
               <Text style={[styles.hCell, { width: 80, textAlign: 'center' }]}>PRICE</Text>
               <Text style={[styles.hCell, { width: 90, textAlign: 'right' }]}>ACTION</Text>
             </View>
           )}
           renderItem={({ item }) => (
             <View style={styles.productRow}>
               <View style={{ flex: 1, paddingRight: 10 }}>
                 <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                 <Text style={styles.productCategory} numberOfLines={1}>
                   {item.category?.categoryname || 'Uncategorized'}
                 </Text>
               </View>
               <View style={{ width: 85, alignItems: 'center' }}>
                 <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
               </View>
               <View style={styles.actionGroup}>
                 <TouchableOpacity 
                     style={styles.editBtn} 
                     onPress={() => router.push({ pathname: "/admin/ProductEditScreen", params: { id: item._id } })}
                 >
                   <Ionicons name="create-outline" size={18} color={Colors.primary} />
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteHandler(item._id)}>
                   <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
                 </TouchableOpacity>
               </View>
             </View>
           )}
           ListFooterComponent={renderPaginationButtons}
           ListEmptyComponent={() => !isLoading && <Text style={styles.emptyText}>No products found.</Text>}
         />
       )}
     </SafeAreaView>
   );
 };
 
 export default SellerProductListScreen;
 
 const styles = StyleSheet.create({
   safeArea: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
   header: {
     flexDirection: "row",
     alignItems: "center",
     justifyContent: "space-between",
     paddingHorizontal: 20,
     paddingVertical: 15,
     backgroundColor: "#FFF",
     borderBottomWidth: 1,
     borderBottomColor: "#E9ECEF",
   },
   headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
   backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" },
   addButton: { backgroundColor: Colors.primary, width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
   
   // Filter Styles
   filterContainer: {
     padding: 16,
     flexDirection: 'row',
     gap: 10,
     backgroundColor: '#FFF',
     borderBottomWidth: 1,
     borderBottomColor: '#E9ECEF'
   },
   searchSection: {
     flex: 2,
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#F1F3F5',
     borderRadius: 10,
     paddingHorizontal: 10,
   },
   searchIcon: { marginRight: 5 },
   searchInput: { flex: 1, height: 40, fontSize: 14, color: '#495057' },
   sortWrapper: { flex: 1.2, backgroundColor: '#F1F3F5', borderRadius: 10, overflow: 'hidden', justifyContent: 'center' },
   sortPicker: { height: 40, width: '100%' },
 
   center: { flex: 1, justifyContent: "center", alignItems: "center" },
   tableHeader: { flexDirection: "row", paddingVertical: 12, alignItems: 'center' },
   hCell: { fontSize: 10, fontWeight: "800", color: "#ADB5BD", letterSpacing: 0.8 },
   listContent: { paddingHorizontal: 16, paddingBottom: 20 },
   productRow: {
     flexDirection: "row",
     alignItems: "center",
     backgroundColor: "#FFF",
     paddingVertical: 12,
     paddingHorizontal: 12,
     borderRadius: 16,
     marginVertical: 6,
     elevation: 2,
   },
   productName: { fontSize: 14, fontWeight: "700", color: "#343A40" },
   productCategory: { fontSize: 11, color: "#ADB5BD", marginTop: 2 },
   productPrice: { fontSize: 14, fontWeight: "800", color: Colors.primary },
   actionGroup: { flexDirection: "row", width: 85, justifyContent: "flex-end" },
   editBtn: { padding: 6, backgroundColor: "#F0F4FF", borderRadius: 8, marginRight: 6 },
   deleteBtn: { padding: 6, backgroundColor: "#FFF5F5", borderRadius: 8 },
   emptyText: { textAlign: 'center', marginTop: 50, color: '#ADB5BD' },
   
   paginationContainer: { flexDirection: "row", justifyContent: "center", paddingVertical: 25, gap: 8 },
   pageButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E9ECEF" },
   activePageButton: { backgroundColor: Colors.primary, borderColor: Colors.primary },
   pageButtonText: { color: "#495057", fontWeight: "700" },
   activePageButtonText: { color: "#FFF" },
 });