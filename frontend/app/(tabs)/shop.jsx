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
    keyword: search,
  });

  const categories = [
    { id: 1, name: "Phones", icon: require("../../assets/phone.png") },
    { id: 2, name: "Fashion", icon: require("../../assets/fashion.png") },
    { id: 3, name: "Electronics", icon: require("../../assets/electronics.png") },
    { id: 4, name: "Beauty", icon: require("../../assets/beauty.png") },
  ];

  return (
    <View style={styles.container}>

      {/* 🔍 Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={22} color={Colors.darkGray} />
        <TextInput
          placeholder="Search products"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <Ionicons name="options-outline" size={22} color={Colors.primary} />
      </View>

      {/* 🔥 Flash Deals */}
      <View style={styles.flashContainer}>
        <Text style={styles.flashTitle}>🔥 Flash Deals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(products?.slice(0, 6) || []).map((item) => (
            <TouchableOpacity key={item._id} style={styles.flashItem}>
              <Image source={{ uri: item.image }} style={styles.flashImage} />
              <Text style={styles.flashPrice}>${item.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 🧭 Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <Image source={cat.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{cat.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 🛍 Products Grid */}
      <Text style={styles.sectionTitle}>Best Deals for You</Text>

      <FlatList
        data={products || []}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item._id}
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
    backgroundColor: Colors.offWhite,
    padding: 12,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  flashContainer: {
    marginBottom: 20,
  },
  flashTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  flashItem: {
    marginRight: 12,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 8,
  },
  flashImage: {
    width: 100,
    height: 90,
    borderRadius: 8,
  },
  flashPrice: {
    textAlign: "center",
    fontWeight: "700",
    marginTop: 5,
    color: Colors.primary,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },

  categoryItem: {
    alignItems: "center",
    marginRight: 15,
  },
  categoryIcon: {
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: Colors.white,
    padding: 10,
  },
  categoryText: {
    fontSize: 14,
    marginTop: 5,
  },
});
 