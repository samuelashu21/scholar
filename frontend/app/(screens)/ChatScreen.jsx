


import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Utils";
import { BASE_URL } from "../../constants/Urls";
import { useSelector } from "react-redux";
import {
  useGetChatDetailsQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useUnsendMessageMutation,
} from "../../slices/chatApiSlice";
import { io } from "socket.io-client";
import * as Haptics from "expo-haptics";

// --- MEMOIZED MESSAGE BUBBLE ---
const MessageBubble = React.memo(({ item, isMe, receiverName, onLongPress, onReplyPress, isHighlighted }) => {
  return (
    <View style={[styles.messageWrapper, isMe ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}>
      <Text style={styles.senderNameText}>{isMe ? "You" : receiverName}</Text>
      <TouchableOpacity
        onLongPress={() => onLongPress(item)}
        activeOpacity={0.8}
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.theirBubble,
          isHighlighted && styles.highlightedBubble,
        ]}
      >
        {item.replyTo && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onReplyPress(item.replyTo.messageId)}
            style={[styles.replyInBubble, isMe ? styles.replyInBubbleMe : styles.replyInBubbleThem]}
          >
            <Text style={styles.replyInBubbleName} numberOfLines={1}>{item.replyTo.senderName}</Text>
            <Text style={styles.replyInBubbleText} numberOfLines={2}>{item.replyTo.text}</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.messageText, isMe ? { color: "#fff" } : { color: "#333" }]}>{item.text}</Text>
        <View style={styles.bubbleFooter}>
          {item.isEdited && <Text style={[styles.editedTag, { color: isMe ? "#E0E0E0" : "#999" }]}>edited </Text>}
          <Text style={[styles.timeText, { color: isMe ? "#E0E0E0" : "#999" }]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          {isMe && (
            <Ionicons
              name={item.isRead ? "checkmark-done" : "checkmark"}
              size={15}
              color={item.isRead ? "#40E0D0" : "#E0E0E0"}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});

const ChatScreen = () => {
  const { chatId, receiverId, receiverName, productId, productName, productImage, productPrice } = useLocalSearchParams();
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOtherTyping, setShowOtherTyping] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({ isOnline: false, lastSeen: null });

  const typingTimeoutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const socket = useRef(null);
  const flatListRef = useRef(null);

  const [editMsg] = useEditMessageMutation();
  const [unsendMsg] = useUnsendMessageMutation();
  const [sendMsg, { isLoading: isSending }] = useSendMessageMutation();

  const { data: chatData, isLoading, refetch } = useGetChatDetailsQuery(chatId, { skip: !chatId });

  // --- SOCKET LOGIC ---
  useEffect(() => {
    socket.current = io(BASE_URL);
    const s = socket.current;

    if (userInfo?._id) s.emit("userOnline", userInfo._id);
    if (chatId) s.emit("joinRoom", chatId);

    s.on("userStatusChanged", (data) => {
      if (data.userId === receiverId) setOnlineStatus({ isOnline: data.isOnline, lastSeen: data.lastSeen });
    });

    const handleSync = () => refetch();
    s.on("messageReceived", () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        handleSync();
    });
    s.on("deleteMessage", handleSync);
    s.on("messageEdited", handleSync);
    s.on("getMessage", handleSync);

    s.on("displayTyping", (data) => {
      if (data.userId !== userInfo?._id) setShowOtherTyping(data.typing);
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      s.off("userStatusChanged");
      s.off("messageReceived");
      s.off("deleteMessage");
      s.off("messageEdited");
      s.off("getMessage");
      s.off("displayTyping");
      s.disconnect();
    };
  }, [chatId, receiverId, refetch, userInfo?._id]);

  // --- DATA FILTERING ---
  const messages = useMemo(() => {
    if (!chatData?.messages) return [];
    return [...chatData.messages]
      .filter((m) => {
        const isDeletedByMe = m.deletedBy?.some((db) => (db._id || db) === userInfo?._id);
        return !isDeletedByMe;
      })
      .reverse();
  }, [chatData, userInfo?._id]);

  // --- ACTIONS ---
  const handleTyping = (text) => {
    setMessageText(text);
    if (!isTyping) {
      setIsTyping(true);
      socket.current.emit("typing", { chatId, userId: userInfo._id, typing: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.current.emit("typing", { chatId, userId: userInfo._id, typing: false });
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      if (editingMessageId) {
        await editMsg({ chatId, messageId: editingMessageId, newText: messageText }).unwrap();
        socket.current.emit("editMessage", { chatId });
        setEditingMessageId(null);
      } else {
        await sendMsg({ receiverId, text: messageText, productId, replyTo: replyingTo }).unwrap();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        socket.current.emit("newMessage", { chatId, senderId: userInfo._id, receiverId, text: messageText });
      }
      setMessageText("");
      setReplyingTo(null);
      refetch();
    } catch (err) {
      Alert.alert("Error", "Action failed.");
    }
  };

  const scrollToOriginalMessage = useCallback((messageId) => {
    const index = messages.findIndex((m) => m._id === messageId);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      setHighlightedId(messageId);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = setTimeout(() => setHighlightedId(null), 2000);
    }
  }, [messages]);

  const onLongPressMessage = useCallback((item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isMe = item.sender === userInfo?._id;
    const options = [
      { text: "Reply", onPress: () => { setReplyingTo({ messageId: item._id, text: item.text, senderName: isMe ? "You" : receiverName }); setEditingMessageId(null); } },
    ];
    if (isMe) {
      options.push({ text: "Edit", onPress: () => { setEditingMessageId(item._id); setMessageText(item.text); setReplyingTo(null); } });
      options.push({ text: "Delete for everyone", style: "destructive", onPress: () => handleDelete(item._id, "everyone") });
    }
    options.push({ text: "Delete for me", style: "destructive", onPress: () => handleDelete(item._id, "me") });
    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Options", "Select action", options);
  }, [userInfo?._id, receiverName]);

  const handleDelete = async (messageId, type) => {
    try {
      await unsendMsg({ chatId, messageId, type }).unwrap();
      if (type === "everyone") socket.current.emit("deleteMessage", { chatId, messageId });
      refetch();
    } catch (error) {
      Alert.alert("Error", error?.data?.message || "Unable to delete message.");
    }
  };

  if (!userInfo) return <View style={styles.centered}><Text>Please log in.</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{receiverName || "User"}</Text>
            <Text style={[styles.statusText, (showOtherTyping || onlineStatus.isOnline) && { color: Colors.primary }]}>
              {showOtherTyping ? "typing..." : onlineStatus.isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* LIST */}
        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <MessageBubble 
              item={item} 
              isMe={item.sender === userInfo._id} 
              receiverName={receiverName}
              onLongPress={onLongPressMessage}
              onReplyPress={scrollToOriginalMessage}
              isHighlighted={highlightedId === item._id}
            />
          )}
        />

        {/* INPUT */}
        <SafeAreaView edges={["bottom"]} style={styles.inputSafeArea}>
          {editingMessageId && (
            <View style={styles.editBar}>
              <Text style={styles.editLabel} numberOfLines={1}>Editing: {messageText}</Text>
              <TouchableOpacity onPress={() => { setEditingMessageId(null); setMessageText(""); }}><Ionicons name="close-circle" size={20} color="#999" /></TouchableOpacity>
            </View>
          )}
          {replyingTo && (
            <View style={styles.replyBar}>
              <View style={{ flex: 1 }}><Text style={styles.replyName}>Replying to {replyingTo.senderName}</Text><Text numberOfLines={1}>{replyingTo.text}</Text></View>
              <TouchableOpacity onPress={() => setReplyingTo(null)}><Ionicons name="close-circle" size={20} color="#999" /></TouchableOpacity>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={handleTyping}
              multiline
            />
            <TouchableOpacity onPress={handleSendMessage} disabled={!messageText.trim() || isSending}>
              <Ionicons name={editingMessageId ? "checkmark-circle" : "send"} size={28} color={Colors.primary} style={{ opacity: messageText.trim() ? 1 : 0.5 }} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { paddingTop: Platform.OS === "android" ? 40 : 60, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  statusText: { fontSize: 12, color: "#999" },
  listContent: { paddingHorizontal: 15, paddingBottom: 20 },
  messageWrapper: { marginVertical: 4, width: '100%' },
  senderNameText: { fontSize: 10, color: '#999', marginBottom: 2, marginHorizontal: 8 },
  bubble: { maxWidth: "80%", padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: "#fff", borderBottomLeftRadius: 2, borderWidth: 1, borderColor: "#E0E0E0" },
  highlightedBubble: { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: Colors.primary },
  messageText: { fontSize: 16 },
  bubbleFooter: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 4 },
  timeText: { fontSize: 10 },
  editedTag: { fontSize: 10, fontStyle: "italic" },
  replyBar: { flexDirection: "row", backgroundColor: "#F0F0F0", padding: 10, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  replyName: { fontSize: 12, fontWeight: "bold", color: Colors.primary },
  replyInBubble: { padding: 8, borderRadius: 10, marginBottom: 6, borderLeftWidth: 3, borderLeftColor: Colors.primary, backgroundColor: 'rgba(0,0,0,0.05)' },
  inputSafeArea: { backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#EEE" },
  inputContainer: { flexDirection: "row", padding: 12, alignItems: "center" },
  input: { flex: 1, backgroundColor: "#F1F3F4", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, maxHeight: 100 },
  editBar: { flexDirection: "row", backgroundColor: "#F8F8F8", padding: 8, alignItems: "center", borderLeftWidth: 4, borderLeftColor: Colors.primary },
  editLabel: { flex: 1, fontSize: 12, color: "#666", marginLeft: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
}); 