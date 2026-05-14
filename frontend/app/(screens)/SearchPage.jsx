import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  View, 
  TextInput,  
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  ScrollView, 
  FlatList, 
  ActivityIndicator,
  Platform,
  Image,
  StatusBar,
  Modal,
  Pressable,
  RefreshControl 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Logic Imports
import { useGetProductsQuery } from '../../slices/productsApiSlice';
import { useGetCategoriesQuery } from '../../slices/categoryApiSlice'; 
import Product from '../../components/Product';

export default function SearchPage() { 
  const router = useRouter();
  const inputRef = useRef(null);
  
  // --- States ---
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); 
  const [history, setHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 
  const [sort, setSort] = useState("-createdAt"); 
  const [showSortModal, setShowSortModal] = useState(false);

  const sortOptions = [
    { label: "Newest Arrivals", value: "-createdAt" },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "-price" },
    { label: "Top Rated", value: "-rating" },
  ];

  // --- API Hooks ---
  const { data, isLoading, refetch } = useGetProductsQuery({
    keyword: activeSearch,
    pageNumber: 1,
    sort, 
  }, { skip: activeSearch.length < 2 });

  // Pulling trending categories from your Database
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();

  // --- Handlers ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useEffect(() => { 
    loadHistory();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem('search_history');
    if (stored) setHistory(JSON.parse(stored));
  };

  const executeSearch = async (term) => {
    const finalTerm = term || query;
    if (!finalTerm.trim()) return;

    const newHistory = [finalTerm, ...history.filter(h => h !== finalTerm)].slice(0, 10);
    setHistory(newHistory);
    await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));

    setActiveSearch(finalTerm);
    setShowResults(true);
  };

  const handleSortSelect = (value) => {
    setSort(value);
    setShowSortModal(false);
  };

  // --- UI Components ---
  const renderProductGrid = () => {
    if (isLoading && !refreshing) return <ActivityIndicator size="large" color="#FF4747" style={{ marginTop: 50 }} />;
    
    return (
      <View style={{ flex: 1 }}>
        {data?.products?.length > 0 && (
          <View style={styles.infoBar}>
             <Text style={styles.resultsText}>{data?.total || 0} Products Found</Text>
             <TouchableOpacity style={styles.filterBtn} onPress={() => setShowSortModal(true)}>
                <Text style={styles.filterText}>
                    {sortOptions.find(o => o.value === sort)?.label.split(':')[0]}
                </Text>
                <Ionicons name="options-outline" size={14} color="#FF4747" />
             </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={data?.products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <Product product={item} />}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF4747"]} tintColor="#FF4747" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={80} color="#eee" />
              <Text style={styles.emptyText}>No products for "{activeSearch}"</Text>
              
              <TouchableOpacity 
                style={styles.goBackBtn} 
                onPress={() => router.replace("/")}
              >
                <Text style={styles.goBackBtnText}>Go Back Home</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    );
  };

  const renderSuggestions = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {history.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={async () => {
              await AsyncStorage.removeItem('search_history');
              setHistory([]);
            }}>
              <Ionicons name="trash-outline" size={18} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={styles.chipContainer}>
            {history.map((item, index) => (
              <TouchableOpacity key={index} style={styles.chip} onPress={() => {
                  setQuery(item);
                  executeSearch(item);
              }}>
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Categories</Text>
          <MaterialCommunityIcons name="fire" size={20} color="#FF4747" />
        </View>
        
        {categoriesLoading ? (
          <ActivityIndicator color="#FF4747" />
        ) : (
          <View style={styles.trendingGrid}>
            {categories?.slice(0, 8).map((cat, index) => (
              <TouchableOpacity 
                key={cat._id || index} 
                style={styles.trendingItem}
                onPress={() => {
                  setQuery(cat.categoryname); // Updated to match your model
                  executeSearch(cat.categoryname);
                }}
              >
                <View style={styles.trendingRow}>
                   <Text style={styles.trendingRank}>{index + 1}</Text>
                   {cat.image && (
                     <Image source={{ uri: cat.image }} style={styles.catThumb} />
                   )}
                   <Text style={styles.trendingText} numberOfLines={1}>
                     {cat.categoryname}
                   </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.headerWrapper}>
        <View style={styles.logoRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/cart")}>
            <Ionicons name="cart-outline" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchInner}>
              <Ionicons name="search-outline" size={18} color="#999" />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="I'm shopping for..."
                value={query}
                onChangeText={(text) => {
                    setQuery(text);
                    if (text === "") setShowResults(false);
                }}
                returnKeyType="search"
                onSubmitEditing={() => executeSearch()}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(""); setShowResults(false); }} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={19} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.rightActions}>
               <Feather name="camera" size={18} color="#666" style={{marginHorizontal: 10}} />
               <TouchableOpacity style={styles.searchButton} onPress={() => executeSearch()}>
                  <Text style={styles.searchButtonText}>Search</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {showResults ? renderProductGrid() : renderSuggestions()}
      </View>

      <Modal visible={showSortModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Search Results</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {sortOptions.map((option) => (
              <TouchableOpacity 
                key={option.value} 
                style={styles.sortOption} 
                onPress={() => handleSortSelect(option.value)}
              >
                <Text style={[styles.sortOptionText, sort === option.value && styles.activeSortText]}>
                  {option.label}
                </Text>
                {sort === option.value && <Ionicons name="checkmark-circle" size={22} color="#FF4747" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: Platform.OS === "ios" ? 10 : 25, 
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 60 },
  logoContainer: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 140, height: "100%" },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { marginTop: 5 },
  searchBarWrapper: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 23,
    height: 46,
    borderWidth: 1.5,
    borderColor: '#FF4747',
    overflow: 'hidden',
  },
  searchInner: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingLeft: 12 },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#000' },
  clearBtn: { paddingHorizontal: 8 },
  rightActions: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  searchButton: { backgroundColor: '#FF4747', height: '100%', paddingHorizontal: 20, justifyContent: 'center' },
  searchButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9'
  },
  resultsText: { fontSize: 12, color: "#999" },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  filterText: { fontSize: 12, color: '#FF4747', marginRight: 5, fontWeight: "600" },
  
  listContainer: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 20 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666', fontSize: 16, marginBottom: 20 },
  
  goBackBtn: {
    backgroundColor: '#FF4747',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  goBackBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 40 },
  modalIndicator: { width: 40, height: 5, backgroundColor: '#DDD', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  sortOptionText: { fontSize: 16, color: '#444' },
  activeSortText: { color: '#FF4747', fontWeight: 'bold' },

  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#f5f5f5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { color: '#666', fontSize: 13 },
  
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  trendingItem: { width: '48%', marginBottom: 15, backgroundColor: '#fcfcfc', borderRadius: 8, padding: 5 },
  trendingRow: { flexDirection: 'row', alignItems: 'center' },
  trendingRank: { fontSize: 14, fontWeight: 'bold', color: '#FF4747', width: 20 },
  catThumb: { width: 30, height: 30, borderRadius: 15, marginRight: 8, backgroundColor: '#eee' },
  trendingText: { fontSize: 13, color: '#444', flex: 1, fontWeight: '500' }
});