import React, { useEffect, useRef, useState } from 'react';
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
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your existing logic imports
import { useGetProductsQuery } from '../../slices/productsApiSlice';
import Product from '../../components/Product';
import { Colors } from '../../constants/Utils';
import Message from '../../components/Message';

export default function SearchPage() { 
  const router = useRouter();
  const inputRef = useRef(null);
  
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); 
  const [history, setHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const { data, isLoading, error } = useGetProductsQuery({
    keyword: activeSearch,
    pageNumber: 1,
    category: "", 
  }, { skip: activeSearch.length < 2 });

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

  const renderProductGrid = () => {
    if (isLoading) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />;
    if (error) return <Message variant="error">Something went wrong.</Message>;

    return (
      <FlatList
        data={data?.products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Product product={item} />}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={80} color="#eee" />
            <Text style={styles.emptyText}>No products found for "{activeSearch}"</Text>
            <TouchableOpacity onPress={() => setShowResults(false)}>
                <Text style={styles.resetSearch}>Try a different keyword</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
          <Text style={styles.sectionTitle}>Trending Searches</Text>
          <MaterialCommunityIcons name="fire" size={20} color="#FF4747" />
        </View>
        <View style={styles.trendingGrid}>
          {['Earbuds', 'iPhone Case', 'Smart Watch', 'Wigs', 'Jeans', 'Laptops'].map((term, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.trendingItem}
              onPress={() => {
                setQuery(term);
                executeSearch(term);
              }}
            >
              <Text style={styles.trendingRank}>{index + 1}</Text>
              <Text style={styles.trendingText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      
      {/* 1. CENTERED LOGO */}
      <View style={styles.logoRow}>
         <Image 
          source={require("../../assets/images/logo.png")} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>

      {/* 2. SEARCH BAR HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => {
            if (showResults) {
                setShowResults(false);
                setQuery("");
            } else {
                router.back();
            }
        }}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        
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
            {/* --- CLEAR TEXT (X) BUTTON --- */}
            {query.length > 0 && (
              <TouchableOpacity 
                onPress={() => { setQuery(""); setShowResults(false); }} 
                style={styles.clearBtn}
              >
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

      <View style={{ flex: 1 }}>
        {showResults ? renderProductGrid() : renderSuggestions()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingTop: Platform.OS === 'ios' ? 60 : 45 
  },
  logoRow: {
    paddingHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  logo: {
    width: 130, 
    height: 45,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8
  },
  backBtn: {
    padding: 4,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    height: 46,
    borderWidth: 2,
    borderColor: '#FF4747',
    overflow: 'hidden',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 12,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#000' },
  clearBtn: {
    paddingHorizontal: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  searchButton: {
    backgroundColor: '#FF4747',
    height: '100%',
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Content and Grid Styles
  listContainer: { paddingHorizontal: 10, paddingTop: 10 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666', fontSize: 16, fontWeight: '500' },
  resetSearch: { color: Colors.primary, marginTop: 15, fontWeight: 'bold' },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#f5f5f5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { color: '#666', fontSize: 13 },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  trendingItem: { width: '48%', flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  trendingRank: { fontSize: 14, fontWeight: 'bold', color: '#bbb', marginRight: 10 },
  trendingText: { fontSize: 14, color: '#444' }
});