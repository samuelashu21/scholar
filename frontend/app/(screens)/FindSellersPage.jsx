import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  Dimensions,
  RefreshControl 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from "react-redux";

// Logic Imports
import { Colors, resolveImageUrl } from "../../constants/Utils";
import { useSearchSellersQuery, useGetUsersQuery } from "../../slices/userAPiSlice";

const { width } = Dimensions.get("window");

export default function FindSellersPage() { 
  const router = useRouter();
  const inputRef = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);
  
  // --- States ---
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); 
  const [history, setHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- API Hooks ---
  const { data: searchedUsers, isFetching: isSearchingUsers } = useSearchSellersQuery(activeSearch, {
    skip: activeSearch.length < 2,
  });

  const { data: suggestionsData, isLoading: suggestionsLoading, refetch: refetchSuggestions } = useGetUsersQuery();

  // --- Filter & Normalize Logic ---
  const filteredSuggestions = useMemo(() => {
    // 1. Handle potential API structures (Array vs Object with .users)
    const rawUsers = Array.isArray(suggestionsData) 
        ? suggestionsData 
        : (suggestionsData?.users || []);

    if (rawUsers.length === 0) return [];

    // 2. Filter out current user so they don't see themselves as a suggestion
    return rawUsers.filter(user => user._id !== userInfo?._id);
  }, [suggestionsData, userInfo]);

  // --- Handlers ---
  useEffect(() => { 
    loadHistory();
    if (Platform.OS !== 'web') {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem('user_search_history');
    if (stored) setHistory(JSON.parse(stored));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchSuggestions();
    setRefreshing(false);
  }, [refetchSuggestions]);

  const executeSearch = async (term) => {
    const finalTerm = term || query;
    if (!finalTerm.trim()) return;

    // Save to local storage history
    const newHistory = [finalTerm, ...history.filter(h => h !== finalTerm)].slice(0, 10);
    setHistory(newHistory);
    await AsyncStorage.setItem('user_search_history', JSON.stringify(newHistory));

    setActiveSearch(finalTerm);
    setShowResults(true);
  };

  const clearSearch = () => {
    setQuery("");
    setActiveSearch("");
    setShowResults(false);
  };

  const getImageUrl = (path) => resolveImageUrl(path, "https://via.placeholder.com/150");

  // --- UI Components ---

  const renderSuggestions = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Recent History Chips */}
      {history.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={async () => {
              await AsyncStorage.removeItem('user_search_history');
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

      {/* Suggested Users Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested for you</Text>
          <MaterialCommunityIcons name="sparkles" size={20} color={Colors.primary || "#FF4747"} />
        </View>
        
        {suggestionsLoading ? (
          <ActivityIndicator color={Colors.primary || "#FF4747"} />
        ) : filteredSuggestions.length > 0 ? (
          <View style={styles.trendingGrid}>
            {filteredSuggestions.slice(0, 15).map((user, index) => (
              <TouchableOpacity 
                key={user._id || index} 
                style={styles.suggestionGridItem}
                onPress={() => router.push({ pathname: "/SellerProfile", params: { sellerId: user._id } })}
              >
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: getImageUrl(user.profileImage) }} style={styles.gridImage} />
                </View>
                <Text style={styles.gridName} numberOfLines={1}>{user.FirstName || 'User'}</Text>
                <Text style={styles.gridSubName} numberOfLines={1}>View Profile</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptySuggestions}>
            <Ionicons name="people-outline" size={40} color="#DDD" />
            <Text style={styles.emptySubText}>No suggestions available right now.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER SECTION */}
      <View style={styles.headerWrapper}>
        <View style={styles.logoRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitleText}>Explore People</Text>

          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/ChatListScreen")}>
            <Ionicons name="chatbubbles-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchInner}>
              <Ionicons name="search-outline" size={18} color="#999" />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Search name, username..."
                value={query}
                onChangeText={(text) => {
                    setQuery(text);
                    if (text === "") setShowResults(false);
                }}
                returnKeyType="search"
                onSubmitEditing={() => executeSearch()}
              />
              {/* CLEAR SEARCH BUTTON */}
              {query.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={19} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={() => executeSearch()}>
                <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* CONTENT AREA */}
      <View style={{ flex: 1 }}>
        {showResults ? (
          <View style={{ flex: 1 }}>
            <View style={styles.infoBar}>
                <Text style={styles.resultsText}>{searchedUsers?.length || 0} Users Found</Text>
                {isSearchingUsers && <ActivityIndicator size="small" color={Colors.primary} />}
            </View>

            <FlatList
              data={searchedUsers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.userRow}
                  onPress={() => router.push({ pathname: "/SellerProfile", params: { sellerId: item._id } })}
                >
                  <Image source={{ uri: getImageUrl(item.profileImage) }} style={styles.searchAvatar} />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.userNameText}>{item.FirstName} {item.LastName}</Text>
                    <Text style={styles.subText}>View Profile</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CCC" />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="person-remove-outline" size={80} color="#eee" />
                  <Text style={styles.emptyText}>No users found for "{activeSearch}"</Text>
                </View>
              }
            />
          </View>
        ) : renderSuggestions()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: Platform.OS === "ios" ? 10 : 40, 
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 50 },
  headerTitleText: { fontSize: 18, fontWeight: '800', color: '#333' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { marginTop: 10 },
  searchBarWrapper: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 46,
    overflow: 'hidden',
  },
  searchInner: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingLeft: 12 },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#000' },
  clearBtn: { paddingHorizontal: 8 },
  searchButton: { backgroundColor: Colors.primary || '#FF4747', height: '100%', paddingHorizontal: 20, justifyContent: 'center' },
  searchButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  infoBar: { 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    backgroundColor: '#F9F9F9', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  resultsText: { fontSize: 12, color: "#999", fontWeight: '600' },
  
  // List & Row Styles
  listContainer: { paddingBottom: 20 },
  userRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#EEE' 
  },
  searchAvatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#F0F0F0' },
  userNameText: { fontSize: 16, fontWeight: '700', color: '#333' },
  subText: { fontSize: 13, color: Colors.primary || '#FF4747', marginTop: 2 },

  // Sections
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#f5f5f5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { color: '#666', fontSize: 13, fontWeight: '500' },
  
  // Grid Styles
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  suggestionGridItem: { width: width / 3 - 20, margin: 6, alignItems: 'center' },
  imageWrapper: { position: 'relative' },
  gridImage: { width: width / 3 - 35, height: width / 3 - 35, borderRadius: (width / 3 - 35) / 2, backgroundColor: '#F0F0F0' },
  gridName: { marginTop: 8, fontSize: 13, fontWeight: '700', color: '#333' },
  gridSubName: { fontSize: 11, color: '#999' },

  emptySuggestions: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptySubText: { color: '#999', marginTop: 10, fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 15 },
});