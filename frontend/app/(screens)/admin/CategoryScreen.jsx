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
  StatusBar 
} from "react-native";
import React, { useState } from "react";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "../../../constants/Utils";
import { BASE_URL } from "../../../constants/Urls";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
} from "../../../slices/categoryApiSlice.js";

import {
  useGetSubcategoriesQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} from "../../../slices/subcategoryApiSlice.js";

const CategoryScreen = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { data: categories, isLoading: catLoading, refetch: refetchCats } = useGetCategoriesQuery();
  const { data: subcategories, isLoading: subLoading, refetch: refetchSubs } = useGetSubcategoriesQuery();

  const [createCategory, { isLoading: loadingCreate }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: loadingUpdate }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [createSub, { isLoading: loadingCreateSub }] = useCreateSubcategoryMutation();
  const [updateSub, { isLoading: loadingUpdateSub }] = useUpdateSubcategoryMutation();
  const [deleteSub] = useDeleteSubcategoryMutation();

  const [uploadImage, { isLoading: loadingUpload }] = useUploadCategoryImageMutation();

  const resetForm = () => {
    setName("");
    setImage("");
    setParentCategory("");
    setEditingId(null);
  };

  const editHandler = (item, type) => {
    setEditingId(item._id);
    setImage(item.image);
    if (type === "category") {
      setName(item.categoryname);
    } else {
      setName(item.subcategoryName);
      setParentCategory(item.parentCategory?._id || item.parentCategory);
    }
  };

  const uploadFileHandler = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({ type: "error", text1: "Permission denied" });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const normalizedUri =
        Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri;
      const fileType = asset.mimeType || "image/jpeg";
      const fileName = asset.fileName || `upload.${fileType.split("/")[1] || "jpg"}`;

      const formData = new FormData();
      formData.append("image", {
        uri: normalizedUri,
        type: fileType,
        name: fileName,
      });

      const res = await uploadImage(formData).unwrap();
      if (!res?.image) throw new Error("Upload response missing image path");
      setImage(res.image);
      Toast.show({ type: "success", text1: "Image Uploaded" });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: err?.data?.message || err?.message,
      });
    }
  };

  const submitHandler = async () => {
    if (!name || !image || (activeTab === "subcategories" && !parentCategory)) {
      Toast.show({ type: "error", text1: "Missing Fields" });
      return;
    }
    try {
      if (activeTab === "categories") {
        editingId 
          ? await updateCategory({ categoryId: editingId, categoryname: name, image }).unwrap() 
          : await createCategory({ categoryname: name, image }).unwrap();
        refetchCats();
      } else {
        editingId 
          ? await updateSub({ subcategoryId: editingId, subcategoryName: name, parentCategory, image }).unwrap() 
          : await createSub({ subcategoryName: name, parentCategory, image }).unwrap();
        refetchSubs();
      }
      Toast.show({ type: "success", text1: "Saved successfully" });
      resetForm();
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: err?.data?.message });
    }
  };

  const deleteItemHandler = async (id) => {
    try {
      activeTab === "categories" ? await deleteCategory(id).unwrap() : await deleteSub(id).unwrap();
      activeTab === "categories" ? refetchCats() : refetchSubs();
      Toast.show({ type: "success", text1: "Deleted" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Delete failed" });
    }
  };

  const getImageUri = (img) => {
    if (typeof img !== "string" || !img.trim()) return null;
    return img.startsWith("http") ? img : `${BASE_URL}${img}`;
  };
  const selectedImageUri = getImageUri(image);

  if (catLoading || subLoading) return <ActivityIndicator size="large" color={Colors.primary} style={styles.center} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
        <ScrollView 
          stickyHeaderIndices={[1]} // Index 1 is the TabSectionWrapper
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* 1. LOGO (Top item, scrolls away) */}
          <View style={styles.logoContainer}>
            <Image 
              source={require("../../../assets/images/logo.png")} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>

          {/* 2. STICKY TABS (Sticks to top after logo scrolls away) */}
          <View style={styles.tabSectionWrapper}>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === "categories" && styles.activeTab]} 
                onPress={() => { setActiveTab("categories"); resetForm(); }}
              >
                <Text style={[styles.tabText, activeTab === "categories" && styles.activeTabText]}>Categories</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === "subcategories" && styles.activeTab]} 
                onPress={() => { setActiveTab("subcategories"); resetForm(); }}
              >
                <Text style={[styles.tabText, activeTab === "subcategories" && styles.activeTabText]}>Subcategories</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mainContent}>
            {/* 3. FORM */}
            <View style={styles.form}>
              <Text style={styles.title}>{editingId ? "Edit" : "Add"} {activeTab === "categories" ? "Category" : "Subcategory"}</Text>

              {activeTab === "subcategories" && (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={parentCategory}
                    onValueChange={(val) => setParentCategory(val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Parent..." value="" color="#999" />
                    {categories?.map((c) => (
                      <Picker.Item key={c._id} label={c.categoryname} value={c._id} />
                    ))}
                  </Picker>
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />

              <View style={styles.formFooter}>
                {selectedImageUri ? (
                  <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                ) : (
                  <View style={[styles.imagePreview, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={20} color="#ccc" />
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.uploadButton} onPress={uploadFileHandler}>
                    <Ionicons name="camera" size={16} color={Colors.white} />
                    <Text style={styles.buttonTextSmall}> Image</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.submitButton, editingId && { backgroundColor: Colors.secondary }]} 
                    onPress={submitHandler}
                  >
                    <Text style={styles.submitButtonText}>{editingId ? "Update" : "Create"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {editingId && (
                <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
 
            {/* 4. LIST */}
            <View style={styles.listContainer}>
              <Text style={styles.sectionHeader}>Manage {activeTab}</Text>
              {(activeTab === "categories" ? categories : subcategories)?.map((item) => {
                const itemImageUri = getImageUri(item.image);
                return (
                  <View key={item._id} style={styles.listItem}>
                    {itemImageUri ? (
                      <Image source={{ uri: itemImageUri }} style={styles.listImage} />
                    ) : (
                      <View style={[styles.listImage, styles.imagePlaceholder]}>
                        <Ionicons name="image-outline" size={16} color="#ccc" />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{activeTab === "categories" ? item.categoryname : item.subcategoryName}</Text>
                      {activeTab === "subcategories" && (
                        <Text style={styles.parentText}>{item.parentCategory?.categoryname}</Text>
                      )}
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity onPress={() => editHandler(item, activeTab === "categories" ? "category" : "subcategory")}>
                        <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteItemHandler(item._id)}>
                        <Ionicons name="trash-outline" size={18} color={Colors.textRed} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  center: { flex: 1, justifyContent: "center" },
  scrollContainer: { paddingBottom: 20 },
  
  // LOGO STYLES
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: Colors.offWhite,
  },
  logo: {
    width: 120,
    height: 50,
  },

  tabSectionWrapper: { 
    backgroundColor: Colors.offWhite, 
    paddingVertical: 10,
  },
  tabContainer: { 
    flexDirection: "row", 
    backgroundColor: "#ddd", 
    padding: 3, 
    marginHorizontal: 15, 
    borderRadius: 10 
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: Colors.primary, elevation: 2 },
  tabText: { fontWeight: "bold", color: "#666", fontSize: 13 },
  activeTabText: { color: Colors.white },
  
  mainContent: { paddingHorizontal: 15 },
  form: { 
    backgroundColor: Colors.white, 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 15,
    elevation: 2 
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  pickerContainer: { backgroundColor: "#f9f9f9", borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#eee" },
  picker: { height: 45 },
  input: { backgroundColor: "#f9f9f9", borderRadius: 8, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  formFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  imagePreview: { width: 50, height: 50, borderRadius: 8 },
  imagePlaceholder: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  actionButtons: { flex: 1, flexDirection: 'row', gap: 8 },
  uploadButton: { flex: 1, flexDirection: "row", backgroundColor: Colors.secondary, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  submitButton: { flex: 1.5, backgroundColor: Colors.primary, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  buttonTextSmall: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  submitButtonText: { color: Colors.white, fontWeight: "bold", fontSize: 13 },
  cancelBtn: { marginTop: 8, alignSelf: 'center' },
  cancelText: { color: Colors.textRed, fontSize: 11 },
  listContainer: { marginTop: 5 },
  sectionHeader: { fontSize: 14, fontWeight: "bold", marginBottom: 10, color: "#555" },
  listItem: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, padding: 10, borderRadius: 10, marginBottom: 8, elevation: 1 },
  listImage: { width: 40, height: 40, borderRadius: 6, marginRight: 12 },
  itemName: { fontSize: 14, fontWeight: "600" },
  parentText: { fontSize: 11, color: "gray" },
  actions: { flexDirection: "row", gap: 12 },
});

export default CategoryScreen; 
