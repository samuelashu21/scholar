import { colors, spacing, radius, typography, shadows, layout, responsive } from "./theme";
import { BASE_URL } from "./Urls";

export const Colors = colors;
export const Spacing = spacing;
export const Radius = radius;
export const Typography = typography;
export const Shadows = shadows;
export const Layout = layout;
export const Responsive = responsive;

export const resolveImageUrl = (imagePath, fallback = null) => {
  if (!imagePath) return fallback;

  if (typeof imagePath === "object" && typeof imagePath.uri === "string") {
    return imagePath.uri;
  }

  if (typeof imagePath !== "string") return fallback;

  const normalizedPath = imagePath.trim();
  if (!normalizedPath) return fallback;

  if (
    normalizedPath.startsWith("http") ||
    normalizedPath.startsWith("file:") ||
    normalizedPath.startsWith("content:") ||
    normalizedPath.startsWith("data:")
  ) {
    return normalizedPath;
  }

  return `${BASE_URL}${normalizedPath}`;
};
