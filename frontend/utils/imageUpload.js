import * as ImagePicker from "expo-image-picker";

export const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const resolveFileType = (asset) => {
  const mimeType = (asset?.mimeType || "image/jpeg").toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error("Only JPG, PNG, and WEBP images are supported.");
  }

  const extension = mimeType.split("/")[1] || "jpg";
  return {
    mimeType,
    fileName: asset?.fileName || `upload.${extension}`,
  };
};

export const pickSingleImage = async ({
  allowsEditing = true,
  quality = 0.5,
  aspect,
} = {}) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Media library permission is required to upload images.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing,
    allowsMultipleSelection: false,
    selectionLimit: 1,
    quality,
    aspect,
    exif: false,
    base64: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];

  if (asset.fileSize && asset.fileSize > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Image is too large. Please select an image smaller than 4MB.");
  }

  return asset;
};

export const buildImageFormData = (asset) => {
  if (!asset?.uri) {
    throw new Error("No image selected.");
  }

  const { mimeType, fileName } = resolveFileType(asset);
  const formData = new FormData();

  formData.append("image", {
    uri: asset.uri,
    type: mimeType,
    name: fileName,
  });

  return formData;
};
