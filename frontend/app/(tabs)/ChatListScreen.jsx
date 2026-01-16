import React, { useCallback } from "react"; // Add useCallback
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
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; // Add useFocusEffect
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
import { useSelector } from "react-redux";
import { useGetMyChatsQuery } from "../../slices/chatApiSlice";

const ChatListScreen = () => {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  // --- ADD REDIRECT LOGIC HERE ---
  useFocusEffect(
    useCallback(() => {
      if (!userInfo) {
        // We use a tiny timeout to ensure the navigation tree is mounted
        const timer = setTimeout(() => {
          router.replace("/LoginScreen");  
        }, 0);
        return () => clearTimeout(timer); 
      }
    }, [userInfo])
  );
  // -------------------------------

  const { data: conversations, isLoading, refetch } = useGetMyChatsQuery(undefined, {
    skip: !userInfo, // Don't run query if not logged in
    pollingInterval: 5000,
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  // Guard: If userInfo isn't there, show a loader while the redirect triggers
  if (!userInfo) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderChatItem = ({ item }) => {
    // Logic to find the "Other Person"
    const otherUser = item.participants.find((p) => p._id !== userInfo?._id);
    const displayName = otherUser ? `${otherUser.FirstName} ${otherUser.LastName}` : "User";
    const displayImage = otherUser?.profileImage;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() =>
          router.push({
            pathname: "/ChatScreen",
            params: {
              chatId: item._id,
              receiverId: otherUser?._id,
              receiverName: displayName,
            },
          })
        }
      >
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: getImageUrl(displayImage) }} style={styles.avatar} />
        </View>

        <View style={styles.contentRight}>
          <View style={styles.rowJustified}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.timeText}>
              {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.rowJustified}>
            <Text style={styles.msgSnippet} numberOfLines={1}>
              {item.lastMessage || "Start a conversation..."}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.iconCircle} onPress={() => refetch()}>
          <Ionicons name="refresh-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={50} color="#CCC" />
              </View>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySub}>Messages with sellers will appear here.</Text>
            </View>
          }
        />
      )}
    </View>
  ); 
};

export default ChatListScreen;

// ... (Existing styles remain the same)

const styles = StyleSheet.create({
  // ... Keep all your existing styles from the previous message ...
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }, 
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100, // Space for the tab bar
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F0F0F0",
  },
  activeIndicator: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  contentRight: {
    flex: 1,
    marginLeft: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
    paddingBottom: 10,
  },
  rowJustified: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    maxWidth: '70%',
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  msgSnippet: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    maxWidth: '85%',
  },
  unreadBold: {
    color: "#000",
    fontWeight: "600",
  },
  badgeContainer: {
    backgroundColor: Colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20, 
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
  },
  emptySub: {
    fontSize: 14,
    color: "#999",
    marginTop: 6,
    textAlign: "center",
  },
}); 