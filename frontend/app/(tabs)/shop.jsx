import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";
import { useGetProductsQuery } from "../../slices/productsApiSlice";
import ProductCard from "../../components/ProductCard";

const ShopScreen = () => {
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useGetProductsQuery({
    keyword: search || "",
    pageNumber: 1,
  });

  const categories = [
    { id: 1, name: "Phones", icon: require("../../assets/adaptive-icon.png") },
    { id: 2, name: "Fashion", icon: require("../../assets/adaptive-icon.png") },
    { id: 3, name: "Electronics", icon: require("../../assets/adaptive-icon.png") },
    { id: 4, name: "Beauty", icon: require("../../assets/adaptive-icon.png") },
  ];

  return (
    <View style={styles.container}>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={Colors.gray} />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={Colors.gray}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <Ionicons name="options-outline" size={22} color={Colors.primary} />
      </View>

      {/* Flash Deals */}
      <View style={styles.flashContainer}>
        <Text style={styles.sectionHeader}>🔥 Flash Deals</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(products?.products?.slice(0, 6) || []).map((item) => (
            <TouchableOpacity key={item._id} style={styles.flashCard}>
              <Image source={{ uri: item.image }} style={styles.flashImage} />
              <View style={styles.flashBadge}>
                <Text style={styles.flashPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Categories */}
      <Text style={styles.sectionHeader}>Categories</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.categoryCard}>
            <View style={styles.categoryIconBox}>
              <Image source={cat.icon} style={styles.categoryIcon} />
            </View>
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <Text style={styles.sectionHeader}>Best Deals for You</Text>

      <FlatList
        data={products?.products || []}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={{ paddingBottom: 150 }}
      />
    </View>
  );
};

export default ShopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    padding: 12,
  },

  /** Search Bar **/
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },

  /** Flash Deals **/
  flashContainer: { marginBottom: 25 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1A1A1A",
  },
  flashCard: {
    width: 120,
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginRight: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  flashImage: {
    width: "100",
    height: "75%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  flashBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  flashPrice: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  /** Categories **/
  categoryCard: {
    alignItems: "center",
    marginRight: 18,
  },
  categoryIconBox: {
    width: 70,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoryIcon: {
    width: 45,
    height: 45,
  }, 
  categoryText: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: "600",
  },
});
