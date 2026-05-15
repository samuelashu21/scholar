import { Dimensions, Platform } from "react-native";
 
const { width } = Dimensions.get("window");

export const colors = {
  primary: "#FF4747",
  secondary: "#D93D3D",
  accent: "#1E88E5",

  white: "#FFFFFF",
  offWhite: "#F8F9FB",
  surface: "#FFFFFF",
  surfaceMuted: "#F4F6FA",
  lightGray: "#E8ECF3",
  gray: "#7E8596",
  darkGray: "#1C2230",

  textColor: "#1C2230",
  secondaryTextColor: "#6D7383",
  textRed: "#B83232",

  starGold: "#FFC83D",
  success: "#166534",
  successLight: "#DCFCE7",
  successBorder: "#86EFAC",
  danger: "#B42318",
  error: "#FEEAEA",
  errorLight: "#FEE2E2",
  errorBorder: "#F9A8A8",
  info: "#1D4ED8",
  infoLight: "#E8F0FF",
  infoBorder: "#9AB5FF",

  inStock: "#1A7F37",
  soldOut: "#E2E8F0",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 16,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
  },
};

export const shadows = {
  sm: {
    shadowColor: "#0B1020",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  md: {
    shadowColor: "#0B1020",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0B1020",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const layout = {
  screenPadding: spacing.screen,
  maxContentWidth: 680,
  tabBarHeight: Platform.OS === "ios" ? 82 : 66,
  isSmallDevice: width < 360,
};

export const responsive = {
  scale: (size) => {
    const base = 375;
    const factor = Math.min(Math.max(width / base, 0.9), 1.2);
    return Math.round(size * factor);
  },
}; 