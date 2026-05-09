export const uploadPolicy = {
  profile: {
    maxFileSizeBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png"],
    extensionPattern: /\.(jpg|jpeg|png)$/i,
    folder: "uploadsprofile",
  },
};
