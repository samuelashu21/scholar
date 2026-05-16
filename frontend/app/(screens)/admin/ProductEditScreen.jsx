 


import {
  StyleSheet,
  Text,
  View, 
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import {
  useCreateProductMutation,  
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "../../../slices/productsApiSlice";

import { useGetCategoriesQuery } from "../../../slices/categoryApiSlice";
import { useGetSubcategoriesQuery } from "../../../slices/subcategoryApiSlice";

import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "../../../constants/Utils";
import { BASE_URL } from "../../../constants/Urls";

const ProductEditScreen = () => {
  const router = useRouter();
  const { id: productId } = useLocalSearchParams();
  const isNewMode = productId === "new"; // Boolean check 

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [description, setDescription] = useState("");
 
  // Skip fetching product details if we are creating a new one
  const { data: product, isLoading } = useGetProductDetailsQuery(productId, {
    skip: isNewMode,
  });

  const { data: categories } = useGetCategoriesQuery();
  const { data: subcategories } = useGetSubcategoriesQuery();
 
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  const filteredSubcategories = useMemo(() => {
    return subcategories?.filter((sub) => {
      const parentId = sub.parentCategory?._id || sub.parentCategory;
      return parentId === selectedCategoryId;
    });
  }, [subcategories, selectedCategoryId]);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price?.toString() || "0");
      setImage(product.image || "");
      setCountInStock(product.countInStock?.toString() || "0");
      setDescription(product.description || "");
      setSelectedCategoryId(product.category?._id || product.category || "");
      setSelectedSubcategoryId(product.subcategory?._id || product.subcategory || "");
    }
  }, [product]);

  const getImageUrl = (imagePath) => {
    if (typeof imagePath !== "string" || !imagePath.trim()) return null;
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  const uploadFileHandler = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Toast.show({ type: "error", text1: "Permission Denied" });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append("image", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "product.jpg",
        });
        const response = await uploadProductImage(formData).unwrap();
        setImage(response.image);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Upload Failed" });
    }
  };

 const submitHandler = async () => {
    // Basic frontend validation
    if (!name || !price || !selectedCategoryId || !selectedSubcategoryId) {
      Toast.show({ type: "error", text1: "Please fill in all required fields" });
      return;
    }
    try {
      const payload = {
        name,
        price: Number(price),
        image,
        categoryId: selectedCategoryId,
        subcategoryId: selectedSubcategoryId,
        description,
        countInStock: Number(countInStock),
      };

      if (isNewMode) {
        // CREATE FLOW
        await createProduct(payload).unwrap();
        Toast.show({ type: "success", text1: "Product Created!" });
      } else {
        // UPDATE FLOW
        await updateProduct({ productId, ...payload }).unwrap();
        Toast.show({ type: "success", text1: "Product Updated!" });
      }
      router.back();
    } catch (err) {
      Toast.show({ type: "error", text1: err?.data?.message || "Action Failed" });
    } 
  };

  if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isNewMode ? "Add Product" : "Edit Product"}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Container */}
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: getImageUrl(image) }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.imagePlaceholder]}>
                <Ionicons name="cloud-upload-outline" size={40} color="#ADB5BD" />
                <Text style={styles.placeholderText}>No Image Selected</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.floatingUploadBtn} 
              onPress={uploadFileHandler} 
              disabled={loadingUpload}
            >
              {loadingUpload ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PRODUCT NAME</Text>
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder="Product Name"
                placeholderTextColor="#ADB5BD"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>PRICE (USD)</Text>
                <TextInput 
                  style={styles.input} 
                  value={price} 
                  onChangeText={setPrice} 
                  keyboardType="numeric" 
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>STOCK</Text>
                <TextInput 
                  style={styles.input} 
                  value={countInStock} 
                  onChangeText={setCountInStock} 
                  keyboardType="numeric" 
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CATEGORY</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedCategoryId}
                  onValueChange={(val) => {
                    setSelectedCategoryId(val);
                    setSelectedSubcategoryId("");
                  }}
                >
                  <Picker.Item label="Select Category" value="" color="#ADB5BD" />
                  {categories?.map((cat) => (
                    <Picker.Item key={cat._id} label={cat.categoryname} value={cat._id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SUBCATEGORY ({filteredSubcategories?.length || 0})</Text>
              <View style={[styles.pickerWrapper, !selectedCategoryId && styles.disabledPicker]}>
                <Picker
                  enabled={!!selectedCategoryId}
                  selectedValue={selectedSubcategoryId}
                  onValueChange={(val) => setSelectedSubcategoryId(val)}
                >
                  <Picker.Item label="Select Subcategory" value="" color="#ADB5BD" />
                  {filteredSubcategories?.map((sub) => (
                    <Picker.Item key={sub._id} label={sub.subcategoryName} value={sub._id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#ADB5BD"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loadingUpdate && styles.btnDisabled]}
              onPress={submitHandler}
              disabled={loadingUpdate}
            >
              {loadingUpdate ? (
                <ActivityIndicator color="#FFF" />
              ) : (
               <Text style={styles.submitBtnText}>{isNewMode ? "Create Product" : "Save Changes"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProductEditScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#FFF",
    // Fix for Android header visibility
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
    // Elevation for Android
    elevation: 2,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1A1A1A" 
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "#F8F9FA", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  scrollViewContent: { 
    paddingBottom: 40 
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  productImage: { 
    width: "100%", 
    height: 200, 
    borderRadius: 20, 
    backgroundColor: "#F8F9FA", 
    resizeMode: "cover" 
  },
  imagePlaceholder: { 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 2, 
    borderColor: "#E9ECEF", 
    borderStyle: "dashed" 
  },
  placeholderText: { 
    color: "#ADB5BD", 
    marginTop: 10, 
    fontSize: 14 
  },
  floatingUploadBtn: { 
    position: "absolute",
    bottom: -10,
    right: 35,
    backgroundColor: Colors.primary, 
    width: 44,
    height: 44,
    borderRadius: 22, 
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  formContainer: { 
    paddingHorizontal: 20 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: "#ADB5BD", 
    marginBottom: 8, 
    letterSpacing: 1 
  },
  input: { 
    backgroundColor: "#F8F9FA", 
    borderRadius: 14, 
    padding: 16, 
    fontSize: 15, 
    color: "#1A1A1A", 
    borderWidth: 1, 
    borderColor: "#F1F3F5" 
  },
  row: { 
    flexDirection: "row" 
  },
  textArea: { 
    height: 100, 
    textAlignVertical: "top" 
  },
  pickerWrapper: { 
    backgroundColor: "#F8F9FA", 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: "#F1F3F5",
    overflow: "hidden" 
  },
  disabledPicker: { 
    opacity: 0.5 
  },
  submitBtn: { 
    backgroundColor: Colors.primary, 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: "center", 
    marginTop: 10 
  }, 
  btnDisabled: { 
    opacity: 0.7 
  },
  submitBtnText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700" 
  },
}); 