export const COLORS = {
  // Primary Colors
  PRIMARY: '#007AFF',
  SECONDARY: '#34C759',
  ACCENT: '#FF3B30',
  
  // Background Colors
  BACKGROUND: '#000000',
  SURFACE: '#1C1C1E',
  CARD: '#2C2C2E',
  
  // Text Colors
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#8E8E93',
  TEXT_TERTIARY: '#48484A',
  
  // Game Colors
  GAME_WAITING: '#FF0000',
  GAME_READY: '#00FF00',
  GAME_IDLE: '#333333',
  
  // Status Colors
  SUCCESS: '#34C759',
  ERROR: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#007AFF',
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
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
    LIGHT: '300' as const,
    REGULAR: '400' as const,
    MEDIUM: '500' as const,
    SEMIBOLD: '600' as const,
    BOLD: '700' as const,
    EXTRABOLD: '800' as const,
  },
} as const;

export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  ROUND: 999,
} as const;

export const SHADOWS = {
  SMALL: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  MEDIUM: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  LARGE: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;