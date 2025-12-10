import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../constants/Utils";

const AddReviewModal = ({
  isVisible,
  onClose,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  isLoading,
}) => {
  const isSubmitDisabled =
    !rating || rating === 0 || !comment.trim() || isLoading;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Ionicons name="close-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Add your review</Text>

          {isLoading && (
            <ActivityIndicator size="small" color={Colors.primary} />
          )}

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Rating</Text>
            <View style={styles.ratingSelection}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setRating(value)}
                  style={styles.ratingStar}
                >
                  <Ionicons
                    name={rating >= value ? "star" : "star-outline"}
                    size={24}
                    color={rating >= value ? Colors.primary : Colors.lightGray}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Comment</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your thoughts on this product..."
              placeholderTextColor={Colors.darkGray}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitReviewButton,
              isSubmitDisabled && styles.disabledButton,
            ]}
            onPress={onSubmit}
            disabled={isSubmitDisabled}
          >
            <Text
              style={[
                styles.submitReviewButtonText,
                isSubmitDisabled && styles.disabledButtonText,
              ]}
            >
              Submit Review
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddReviewModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 25,
    width: "90%",
    maxWidth: 450,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 2, 
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.darkGray,
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGray,
    marginBottom: 8,
  },
  ratingSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 5,
    marginBottom: 10,
  },
  ratingStar: {
    padding: 8,
  },
  commentInput: {
    borderWidth: 1,
    color: Colors.textColor,
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    minHeight: 120,
    fontSize: 16,
    backgroundColor: Colors.offWhite,
  },
  submitReviewButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  submitReviewButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: Colors.lightGray,
    opacity: 0.7,
  },
  disabledButtonText: {
    color: Colors.secondaryTextColor,
  },
});
