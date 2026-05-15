import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Message from "./Message";
import Rating from "./Rating";
import { Colors, Radius, Shadows, Spacing, Typography } from "../constants/Utils";
import React from "react";

const ProductReviewSection = ({ reviews, userInfo, onAddReviewPress }) => {
  return (
    <View style={styles.reviewSection}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{reviews.length}</Text>
        </View>
      </View>

      {reviews.length === 0 ? (
        <Message variant="info">No reviews yet.</Message>
      ) : (
        <View style={styles.listWrap}>
          {reviews.map((review) => (
            <View style={styles.reviewCard} key={review._id}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <Rating value={review.rating} />
              </View>
              <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      )}

      {userInfo ? (
        <TouchableOpacity style={styles.addReviewButton} onPress={onAddReviewPress}>
          <Text style={styles.addReviewButtonText}>Write a review</Text>
        </TouchableOpacity>
      ) : (
        <Message variant="info">Please login to submit a review</Message>
      )}
    </View>
  );
};

export default ProductReviewSection;

const styles = StyleSheet.create({
  reviewSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.darkGray,
  },
  countPill: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  listWrap: {
    gap: Spacing.sm,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewName: {
    fontWeight: Typography.weight.bold,
    color: Colors.darkGray,
    fontSize: Typography.size.md,
  },
  reviewDate: {
    fontSize: Typography.size.xs,
    color: Colors.secondaryTextColor,
  },
  reviewComment: {
    marginTop: 6,
    fontSize: Typography.size.sm,
    color: Colors.darkGray,
    lineHeight: 20,
  },
  addReviewButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  addReviewButtonText: {
    color: Colors.white,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
  },
});
