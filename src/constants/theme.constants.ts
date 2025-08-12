// Light theme colors
export const LIGHT_COLORS = {
  // Primary Colors
  PRIMARY: "#2563EB", // Modern blue
  SECONDARY: "#10B981", // Modern green
  ACCENT: "#F59E0B", // Modern amber

  // Background Colors
  BACKGROUND: "#FAFAFA", // Softer white
  SURFACE: "#F5F5F5", // Light gray
  CARD: "#FFFFFF",

  // Text Colors
  TEXT_PRIMARY: "#111827", // Rich black
  TEXT_SECONDARY: "#6B7280", // Medium gray
  TEXT_TERTIARY: "#9CA3AF", // Light gray
  TEXT_WHITE: "#FFFFFF",
  TEXT_RED: "#EF4444",

  // Game Colors
  GAME_WAITING: "#EF4444", // Modern red
  GAME_READY: "#10B981", // Modern green
  GAME_IDLE: "#E5E7EB",

  // Status Colors
  SUCCESS: "#10B981",
  ERROR: "#EF4444",
  WARNING: "#F59E0B",
  INFO: "#2563EB",
} as const;

// Dark theme colors - Based on reference design
export const DARK_COLORS = {
  // Primary Colors
  PRIMARY: "#3B82F6", // Brighter blue for dark theme
  SECONDARY: "#10B981",
  ACCENT: "#F59E0B",

  // Background Colors
  BACKGROUND: "#15171A", // Reference design background
  SURFACE: "#1F2937", // Darker surface
  CARD: "#374151", // Card background

  // Text Colors
  TEXT_PRIMARY: "#F9FAFB", // Almost white
  TEXT_SECONDARY: "#D1D5DB", // Light gray
  TEXT_TERTIARY: "#9CA3AF", // Medium gray
  TEXT_WHITE: "#FFFFFF",
  TEXT_RED: "#EF4444",

  // Game Colors
  GAME_WAITING: "#EF4444",
  GAME_READY: "#10B981",
  GAME_IDLE: "#4B5563",

  // Status Colors
  SUCCESS: "#10B981",
  ERROR: "#EF4444",
  WARNING: "#F59E0B",
  INFO: "#3B82F6",
} as const;

// Default to dark colors for backward compatibility
export const COLORS = DARK_COLORS;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  XXXL: 64, // Added for larger spacing
} as const;

export const TYPOGRAPHY = {
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
    GIANT: 48,
  },
  FONT_WEIGHT: {
    LIGHT: "300" as const,
    REGULAR: "400" as const,
    MEDIUM: "500" as const,
    SEMIBOLD: "600" as const,
    BOLD: "700" as const,
    EXTRABOLD: "800" as const,
  },
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
    LOOSE: 1.8,
  },
} as const;

export const BORDER_RADIUS = {
  NONE: 0,
  SM: 6,
  MD: 12,
  LG: 16,
  XL: 24,
  ROUND: 999,
} as const;

export const SHADOWS = {
  SMALL: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  MEDIUM: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  LARGE: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  NONE: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
