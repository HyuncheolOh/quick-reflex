// Game Configuration
export const GAME_CONFIG = {
  TOTAL_ROUNDS: 3, // Reduced from 5 to 3 rounds
  MIN_WAIT_TIME: 1000, // 1 second - shortened for quick gameplay
  MAX_WAIT_TIME: 2500, // 2.5 seconds - reduced for tighter gameplay
  COUNTDOWN_DURATION: 3000, // 3 seconds (3, 2, 1)
  READY_TIMEOUT: 2000, // 2 seconds timeout for tapping after green - shortened
  ROUND_DELAY: 500, // Reduced from 800ms to 500ms for tighter gameplay
  RESULT_DISPLAY_TIME: 800, // Reduced from 1200ms to 800ms for faster transitions
} as const;

// Validation Constants
export const VALIDATION = {
  HUMAN_MIN_REACTION_TIME: 100, // 100ms
  HUMAN_MAX_REACTION_TIME: 2000, // 2 seconds
} as const;

// Colors
export const GAME_COLORS = {
  WAITING: '#FF0000', // Red
  READY: '#00FF00', // Green
  BACKGROUND: '#000000', // Black
  TEXT_PRIMARY: '#FFFFFF', // White
  TEXT_SECONDARY: '#CCCCCC', // Light Gray
} as const;

// Note: Game messages have been moved to localization system (translations.ts)

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: '@quickreflex:user_profile',
  GAME_SESSIONS: '@quickreflex:game_sessions',
  ONBOARDING_COMPLETED: '@quickreflex:onboarding_completed',
} as const;