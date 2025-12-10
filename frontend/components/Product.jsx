import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import Rating from "./Rating";
import { Colors } from "../constants/Utils";
import { BASE_URL } from "../constants/Urls";
import { timeAgo } from "../utils/timeAgo";

function Product({ product }) {
  // Helper function to ensure we have a full URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    const fullUrl = `${BASE_URL}${imagePath}`;
    return fullUrl;
  };

  return (
    <Link
      href={{ pathname: "/ProductScreen", params: { productId: product._id } }}
      asChild
    >
      <TouchableOpacity activeOpacity={0.8} style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image
            style={styles.image}
            source={{
              uri: getImageUrl(product.image),
            }}
            resizeMode="contain"
            onError={(e) => {
              console.error("Product - Image load error:", e.nativeEvent.error);
              console.error(
                "Product - Failed URL:",
                getImageUrl(product.image)
              );
            }}
          />
        </View>
        <View style={styles.infoArea}>
          <Text
            style={styles.productName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {product.name}
          </Text>

          <View style={styles.pricing}>
            <Text style={styles.currentPrice}>${product.price}</Text>
            <View
              style={[
                styles.availability,
                product.countInStock > 0
                  ? styles.available
                  : styles.unavailable,
              ]}
            >
              <Text style={styles.availabilityText}>
                {product.countInStock > 0 ? "In Stock" : "Sold Out"}
              </Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <Rating 
              value={product.rating}
              text={`${product.numReviews} reviews`}
            />
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.postedBy}>
              Posted by:{" "}
              <Text style={styles.bold}>
                {product?.user
                  ? `${product.user.FirstName || ""} ${
                      product.user.LastName || ""
                    }`.trim()
                  : "Unknown"}
              </Text> 
            </Text>

            <Text style={styles.postedTime}>{timeAgo(product?.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "46%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: "2%",
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  imageWrapper: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 140,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  infoArea: {
    paddingHorizontal: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textColor,
    marginBottom: 10,
    height: 36,
    lineHeight: 20,
  },
  pricing: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  availability: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.white,
  },
  available: {
    backgroundColor: Colors.inStock,
  },
  unavailable: {
    backgroundColor: Colors.soldOut,
  },
  ratingRow: {
    marginTop: 6,
  },
  postedBy: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 4,
  },
  bold: {
    fontWeight: "700",
  },
});

export default Product;
