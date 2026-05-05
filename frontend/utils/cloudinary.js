/**
 * Transforms a Cloudinary URL to apply automatic format (f_auto),
 * quality (q_auto), and optional width resizing (w_{width}).
 *
 * Usage:
 *   transformCloudinaryUrl(product.image, 400)
 *   → https://res.cloudinary.com/.../upload/f_auto,q_auto,w_400/...
 *
 * Falls back gracefully if the URL is not a Cloudinary URL.
 */
export const transformCloudinaryUrl = (url, width) => {
  if (!url || typeof url !== "string") return url;

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;

  const transformations = ["f_auto", "q_auto"];
  if (width && typeof width === "number") {
    transformations.push(`w_${width}`);
  }

  const transformStr = transformations.join(",");

  // Insert transformation after /upload/
  return url.replace("/upload/", `/upload/${transformStr}/`);
};

/**
 * Returns a thumbnail-sized Cloudinary URL.
 */
export const getCloudinaryThumbnail = (url) => transformCloudinaryUrl(url, 200);

/**
 * Returns a medium-sized Cloudinary URL for card views.
 */
export const getCloudinaryCard = (url) => transformCloudinaryUrl(url, 400);

/**
 * Returns a full-size optimized Cloudinary URL.
 */
export const getCloudinaryFull = (url) => transformCloudinaryUrl(url, 800);
