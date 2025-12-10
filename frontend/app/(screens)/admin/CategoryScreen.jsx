import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../../../constants/Utils";
import { BASE_URL } from "../../../constants/Urls";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
} from "../../../slices/categoryApiSlice.js";

const CategoryScreen = () => { 
  const router = useRouter();

  const [categoryname, setCategoryname] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { data: categories, isLoading, refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: loadingCreate }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: loadingUpdate }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: loadingDelete }] = useDeleteCategoryMutation();
  const [uploadCategoryImage, { isLoading: loadingUpload }] = useUploadCategoryImageMutation();

  // Prefill form when editing
  const editHandler = (cat) => {
    setCategoryname(cat.categoryname);
    setImage(cat.image);
    setEditingId(cat._id);
  };

  const resetForm = () => {
    setCategoryname("");
    setImage("");
    setEditingId(null);
  };

  const submitHandler = async () => {
    if (!categoryname || !image) {
      Toast.show({ type: "error", text1: "Error", text2: "Name and image are required" });
      return;
    }

    try {
      if (editingId) {
        await updateCategory({ categoryId: editingId, categoryname, image }).unwrap(); 
        Toast.show({ type: "success", text1: "Success", text2: "Category updated" });
      } else {
        await createCategory({ categoryname, image }).unwrap();
        Toast.show({ type: "success", text1: "Success", text2: "Category added" });
      }
      resetForm();
      refetch();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.data?.message || error.error || error.message,
      });
    }
  };

  const deleteHandler = async (id) => {
    try {
      
      Toast.show({ type: "success", text1: "Deleted", text2: "Category removed" });
      refetch();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.data?.message || error.error || error.message,
      });
    }
  };

  const uploadFileHandler = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2: "Camera roll access is required",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append("image", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "image.jpg",
        });
        const response = await uploadCategoryImage(formData).unwrap();
        setImage(response.image);
        Toast.show({ type: "success", text1: "Uploaded", text2: "Image uploaded successfully" });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: error?.data?.message || error.error || error.message,
      });
    }
  };

  if (isLoading) return <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1, justifyContent: "center" }} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>{editingId ? "Edit Category" : "Add Category"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Category name"
              value={categoryname}
              onChangeText={setCategoryname}
            />

            {image && <Image source={{ uri: image.startsWith("http") ? image : `${BASE_URL}${image}` }} style={styles.imagePreview} />}

            <TouchableOpacity style={styles.uploadButton} onPress={uploadFileHandler}>
              <Text style={styles.uploadButtonText}>{loadingUpload ? "Uploading..." : "Upload Image"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={submitHandler} disabled={loadingCreate || loadingUpdate}>
              <Text style={styles.submitButtonText}>{editingId ? "Update Category" : "Add Category"}</Text>
            </TouchableOpacity>
          </View>

          {/* Category List */}
          <View style={styles.listContainer}>
            {categories?.map((cat) => (
              <View key={cat._id} style={styles.categoryItem}>
                <Image source={{ uri: cat.image.startsWith("http") ? cat.image : `${BASE_URL}${cat.image}` }} style={styles.categoryImage} />
                <Text style={styles.categoryName}>{cat.categoryname}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => editHandler(cat)}>
                    <Ionicons name="pencil-outline" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteHandler(cat._id)}>
                    <Ionicons name="trash-outline" size={24} color={Colors.textRed} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.offWhite, paddingTop: Platform.OS === "android" ? 20 : 0 },
  container: { padding: 20, gap: 20 },
  form: { backgroundColor: Colors.white, padding: 15, borderRadius: 12, shadowColor: Colors.darkGray, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 10, color: Colors.primary },
  input: { borderWidth: 1, borderColor: Colors.lightGray, borderRadius: 8, padding: 12, marginBottom: 10, color: Colors.textColor },
  uploadButton: { backgroundColor: Colors.secondary, padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  uploadButtonText: { color: Colors.white, fontWeight: "600" },
  submitButton: { backgroundColor: Colors.primary, padding: 15, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  submitButtonText: { color: Colors.white, fontWeight: "600" },
  imagePreview: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  listContainer: { gap: 15 },
  categoryItem: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, padding: 10, borderRadius: 10, gap: 10, shadowColor: Colors.darkGray, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  categoryImage: { width: 50, height: 50, borderRadius: 8 },
  categoryName: { flex: 1, fontSize: 16, fontWeight: "500", color: Colors.textColor },
  actions: { flexDirection: "row", gap: 15 },
});
  