import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,   
  KeyboardAvoidingView, 
  Platform,
  Image, 
  StatusBar,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
import { useSelector } from "react-redux";
import { useGetChatDetailsQuery, useSendMessageMutation } from "../../slices/chatApiSlice";

const ChatScreen = () => {
  const { chatId, receiverId, receiverName, productId, productName, productImage, productPrice } = useLocalSearchParams();
  const router = useRouter();
  
  // Get userInfo from Redux
  const { userInfo } = useSelector((state) => state.auth);
  
  const [messageText, setMessageText] = useState("");

  // 1. Fetch real messages
  const { data: chatData, isLoading, refetch } = useGetChatDetailsQuery(chatId, {
    skip: !chatId, 
    pollingInterval: 3000, 
  });

  // 2. Send Message Mutation
  const [sendMsg, { isLoading: isSending }] = useSendMessageMutation();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  const handleSendMessage = async () => {
    if (messageText.trim().length === 0) return;

    try {
      await sendMsg({
        receiverId: receiverId, 
        text: messageText,
        productId: productId,  
      }).unwrap();
      
      setMessageText("");
      if (chatId) refetch(); 
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Safe extraction of messages
  const messages = chatData?.messages ? [...chatData.messages].reverse() : [];

  // If user is not logged in, prevent the crash by returning early or showing a message
  if (!userInfo) {
    return (
      <View style={styles.centered}>
        <Text>Please log in to continue.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{receiverName || "Seller"}</Text>
            <Text style={styles.statusText}>Active Chat</Text>
          </View>
        </View>

        {/* PRODUCT CONTEXT BAR */}
        {productId && (
          <TouchableOpacity 
            style={styles.productBar}
            onPress={() => router.push({ pathname: "/ProductScreen", params: { productId } })}
          >
            <Image source={{ uri: getImageUrl(productImage) }} style={styles.productThumb} />
            <View style={styles.productInfo}>
              <Text style={styles.productNameText} numberOfLines={1}>{productName}</Text>
              <Text style={styles.productPriceText}>ETB {Number(productPrice).toLocaleString()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}

        {/* CHAT AREA */}
        <View style={styles.chatArea}>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={messages}
              inverted
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                // FIXED: Optional chaining to prevent "Cannot read property _id of null"
                const isMe = item.sender === userInfo?._id; 
                
                return (
                  <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? { color: "#fff" } : { color: "#333" }]}>
                      {item.text}
                    </Text>
                    <Text style={[styles.timeText, isMe ? { color: "#E0E0E0" } : { color: "#999" }]}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* INPUT AREA with Safe Area support */}
        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendBtn, { opacity: (messageText.trim() && !isSending) ? 1 : 0.5 }]} 
                onPress={handleSendMessage}
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="send" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            </View> 
          </View> 
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA",
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    elevation: 3,
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  statusText: { fontSize: 12, color: "green", fontWeight: "500" },
  chatArea: {
    flex: 1, 
  },
  productBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  productThumb: { width: 45, height: 45, borderRadius: 8, backgroundColor: '#F0F0F0' },
  productInfo: { flex: 1, marginLeft: 12 },
  productNameText: { fontSize: 14, fontWeight: '600', color: '#333' },
  productPriceText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  listContent: { 
    paddingHorizontal: 15, 
    paddingBottom: 20,
    paddingTop: 10 
  },
  bubble: { 
    maxWidth: "80%", 
    padding: 12, 
    borderRadius: 18, 
    marginVertical: 4 
  },
  myBubble: { 
    alignSelf: "flex-end", 
    backgroundColor: Colors.primary, 
    borderBottomRightRadius: 2 
  },
  theirBubble: { 
    alignSelf: "flex-start", 
    backgroundColor: "#fff", 
    borderBottomLeftRadius: 2, 
    borderWidth: 1, 
    borderColor: "#E0E0E0" 
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  timeText: { fontSize: 10, alignSelf: "flex-end", marginTop: 4 },
  
  // SAFE AREA FIX
  inputSafeArea: {
    backgroundColor: "#fff",
    borderTopWidth: 1, 
    borderTopColor: "#EEE",
  },
  inputWrapper: {
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 10 : 0, 
  },
  inputContainer: { 
    flexDirection: "row", 
    paddingHorizontal: 12, 
    backgroundColor: "#fff", 
    alignItems: "center", 
    marginBottom: 5
  },
  input: { 
    flex: 1, 
    backgroundColor: "#F1F3F4", 
    borderRadius: 25, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    fontSize: 16, 
    maxHeight: 100 
  },
  sendBtn: { marginLeft: 10, padding: 5 }
});