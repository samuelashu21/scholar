

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
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
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

const SellerProductEditScreen = () => {
  const router = useRouter();
  const { id: productId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [description, setDescription] = useState("");

  const { data: product, isLoading, refetch } = useGetProductDetailsQuery(productId);
  const { data: categories } = useGetCategoriesQuery();
  const { data: subcategories } = useGetSubcategoriesQuery();

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
    if (!imagePath) return null;
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
    try {
      await updateProduct({
        productId,
        name,
        price: Number(price),
        image,
        categoryId: selectedCategoryId,
        subcategoryId: selectedSubcategoryId,
        description,
        countInStock: Number(countInStock),
      }).unwrap();
      Toast.show({ type: "success", text1: "Updated Successfully" });
      refetch();
      router.back();
    } catch (err) {
      Toast.show({ type: "error", text1: "Update Failed" });
    }
  };

  if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled" // Important for inputs to remain editable
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Product</Text>
          </View>

          <View style={styles.formCard}>
            {/* Image Preview */}
            <View style={styles.imageSection}>
              {image ? (
                <Image source={{ uri: getImageUrl(image) }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.imagePlaceholder]}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                </View>
              )}
              <TouchableOpacity style={styles.uploadBtn} onPress={uploadFileHandler} disabled={loadingUpload}>
                <Text style={styles.uploadBtnText}>{loadingUpload ? "Uploading..." : "Change Photo"}</Text>
              </TouchableOpacity>
            </View>

            {/* Editable Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder="Product Name"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Price ($)</Text>
                <TextInput 
                  style={styles.input} 
                  value={price} 
                  onChangeText={setPrice} 
                  keyboardType="numeric" 
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Stock</Text>
                <TextInput 
                  style={styles.input} 
                  value={countInStock} 
                  onChangeText={setCountInStock} 
                  keyboardType="numeric" 
                />
              </View>
            </View>

            {/* Category Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedCategoryId}
                  onValueChange={(val) => {
                    setSelectedCategoryId(val);
                    setSelectedSubcategoryId("");
                  }}
                >
                  <Picker.Item label="Select Category" value="" />
                  {categories?.map((cat) => (
                    <Picker.Item key={cat._id} label={cat.categoryname} value={cat._id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Subcategory Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subcategory ({filteredSubcategories?.length || 0})</Text>
              <View style={[styles.pickerWrapper, !selectedCategoryId && styles.disabledPicker]}>
                <Picker
                  enabled={!!selectedCategoryId}
                  selectedValue={selectedSubcategoryId}
                  onValueChange={(val) => setSelectedSubcategoryId(val)}
                >
                  <Picker.Item label="Select Subcategory" value="" />
                  {filteredSubcategories?.map((sub) => (
                    <Picker.Item key={sub._id} label={sub.subcategoryName} value={sub._id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loadingUpdate && styles.btnDisabled]}
              onPress={submitHandler}
              disabled={loadingUpdate}
            >
              <Text style={styles.submitBtnText}>{loadingUpdate ? "Updating..." : "Save Changes"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SellerProductEditScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollViewContent: { paddingBottom: 40, flexGrow: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", padding: 20 },
  backBtn: { padding: 8, backgroundColor: "#fff", borderRadius: 10, elevation: 2 },
  title: { fontSize: 24, fontWeight: "bold", marginLeft: 15, color: "#1A1A1A" },
  formCard: { backgroundColor: "#fff", borderRadius: 25, padding: 20, marginHorizontal: 15, elevation: 5 },
  imageSection: { alignItems: "center", marginBottom: 20 },
  productImage: { width: "100%", height: 180, borderRadius: 20, backgroundColor: "#f0f0f0", resizeMode: "contain" },
  imagePlaceholder: { justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderStyle: "dashed" },
  uploadBtn: { marginTop: -20, backgroundColor: Colors.secondary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, elevation: 3 },
  uploadBtnText: { color: "#fff", fontWeight: "600" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "700", color: "#444", marginBottom: 5 },
  input: { backgroundColor: "#F1F3F5", borderRadius: 12, padding: 12, fontSize: 16, color: "#333", borderWidth: 1, borderColor: "#E9ECEF" },
  row: { flexDirection: "row" },
  textArea: { height: 80, textAlignVertical: "top" },
  pickerWrapper: { backgroundColor: "#F1F3F5", borderRadius: 12, borderWidth: 1, borderColor: "#E9ECEF" },
  disabledPicker: { opacity: 0.5 },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 15, alignItems: "center", marginTop: 10 },
  btnDisabled: { opacity: 0.7 },
  submitBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});