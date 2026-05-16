 
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image, 
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
import { useSelector } from "react-redux";
import { useGetMyChatsQuery } from "../../slices/chatApiSlice";
import { io } from "socket.io-client";

// Mock color for Facebook-style green online dot
const ONLINE_GREEN = "#42b72a";

const ChatListScreen = () => {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);
  const socket = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { data: conversations, isLoading, refetch, isFetching } = useGetMyChatsQuery(undefined, {
    skip: !userInfo,
  });

  useEffect(() => {
    if (userInfo?._id) {
      socket.current = io(BASE_URL);
      socket.current.emit("joinRoom", userInfo._id);
      socket.current.on("messageReceived", () => refetch());
      return () => {
        socket.current?.off("messageReceived");
        socket.current?.disconnect();
      };
    }
  }, [userInfo?._id, refetch]);

  useFocusEffect(
    useCallback(() => {
      if (!userInfo) router.replace("/LoginScreen");
      else refetch();
    }, [userInfo, router, refetch])
  );

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((chat) => {
      const otherUser = chat.participants.find((p) => p._id !== userInfo?._id);
      return `${otherUser?.FirstName} ${otherUser?.LastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, userInfo]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // --- COMPONENT: ACTIVE NOW HEADER ---
  const renderActiveHeader = () => (
    <View style={styles.activeSection}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={conversations?.slice(0, 8)} // Mocking active users from chat list
        keyExtractor={(item) => `active-${item._id}`}
        renderItem={({ item }) => {
          const otherUser = item.participants.find((p) => p._id !== userInfo?._id);
          return (
            <TouchableOpacity style={styles.activeUserContainer}>
              <View style={styles.activeAvatarWrapper}>
                <Image source={{ uri: getImageUrl(otherUser?.profileImage) }} style={styles.activeAvatar} />
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.activeUserName} numberOfLines={1}>{otherUser?.FirstName}</Text>
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={
          <TouchableOpacity style={styles.activeUserContainer}>
             <View style={[styles.activeAvatar, styles.yourStory]}>
                <Ionicons name="add" size={30} color="#555" />
             </View>
             <Text style={styles.activeUserName}>Your Story</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );

  const renderChatItem = ({ item }) => {
    const otherUser = item.participants.find((p) => p._id !== userInfo?._id);
    const displayName = otherUser ? `${otherUser.FirstName} ${otherUser.LastName}` : "User";
    const visibleMessages = [...(item.messages || [])].reverse();
    const lastVisibleMsg = visibleMessages.find(m => {
        const deletedByArray = m.deletedBy || [];
        return !deletedByArray.some(db => (db._id || db) === userInfo?._id);
    });

    const unreadCount = item.messages?.filter(m => m.sender !== userInfo?._id && !m.isRead).length || 0;
    const isLastMsgMine = lastVisibleMsg?.sender === userInfo?._id;

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.chatCard}
        onPress={() => router.push({ 
          pathname: "/ChatScreen", 
          params: { chatId: item._id, receiverId: otherUser?._id, receiverName: displayName } 
        })}
      >
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: getImageUrl(otherUser?.profileImage) }} style={styles.avatar} />
          {/* Show online status on avatar like Messenger */}
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.contentRight}>
          <View style={styles.rowJustified}>
            <Text style={[styles.userName, unreadCount > 0 && { fontWeight: "800" }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.timeText}>{formatTime(item.updatedAt)}</Text>
          </View>
          
          <View style={styles.rowJustified}>
            <Text style={[styles.msgSnippet, unreadCount > 0 && styles.unreadTextBold]} numberOfLines={1}>
              {isLastMsgMine && "You: "}{lastVisibleMsg?.text || "Started a conversation"}
            </Text> 
            
            {unreadCount > 0 ? (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            ) : (
              isLastMsgMine && <Ionicons name="checkmark-circle-outline" size={14} color="#AAA" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        {!isSearchVisible ? (
          <>
            <View style={styles.headerLeft}>
                <Image 
                    source={{ uri: getImageUrl(userInfo?.profileImage) }} 
                    style={styles.headerProfileImg} 
                />
                <Text style={styles.headerTitle}>Chats</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle} onPress={() => setIsSearchVisible(true)}>
                <Ionicons name="camera" size={22} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconCircle, { marginLeft: 12 }]} 
                onPress={() => router.push("/FindSellersPage")}
              >
                <Ionicons name="pencil" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setIsSearchVisible(false); setSearchQuery(""); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CHAT LIST */}
      {isLoading ? (
        <View style={styles.loadingCenter}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item._id}
          renderItem={renderChatItem}
          ListHeaderComponent={!searchQuery && renderActiveHeader}
          contentContainerStyle={styles.listPadding}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        />
      )}
    </View>
  ); 
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerProfileImg: { width: 35, height: 35, borderRadius: 17.5, marginRight: 12, backgroundColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#000" },
  headerIcons: { flexDirection: 'row' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center" },
  
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  cancelText: { marginLeft: 10, color: "#000" },

  /* Active Section */
  activeSection: { paddingVertical: 15, paddingLeft: 16 },
  activeUserContainer: { alignItems: 'center', marginRight: 20, width: 65 },
  activeAvatarWrapper: { position: 'relative' },
  activeAvatar: { width: 52, height: 52, borderRadius: 26 },
  yourStory: { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  activeUserName: { fontSize: 12, color: '#555', marginTop: 5, textAlign: 'center' },
  onlineDot: { position: "absolute", right: 2, bottom: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: ONLINE_GREEN, borderWidth: 2, borderColor: "#fff" },

  listPadding: { paddingBottom: 100 },
  chatCard: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  
  contentRight: { flex: 1, marginLeft: 15 },
  rowJustified: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userName: { fontSize: 16, color: "#000" },
  timeText: { fontSize: 13, color: "#888" },
  msgSnippet: { fontSize: 14, color: "#888", flex: 1, marginTop: 2 },
  unreadTextBold: { color: "#000", fontWeight: "700" },
  badgeContainer: { backgroundColor: "#0084ff", width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  loadingCenter: { flex: 1, justifyContent: "center" },
});