// Game Configuration
export const GAME_CONFIG = {
  TOTAL_ROUNDS: 5,
  MIN_WAIT_TIME: 1000, // 1 second (빠른 게임을 위해 단축)
  MAX_WAIT_TIME: 3000, // 3 seconds (빠른 게임을 위해 단축)
  COUNTDOWN_DURATION: 3000, // 3 seconds (3, 2, 1)
  READY_TIMEOUT: 2000, // 2 seconds timeout for tapping after green (단축)
  ROUND_DELAY: 800, // 라운드 간 딜레이 (새로 추가)
  RESULT_DISPLAY_TIME: 1200, // 결과 표시 시간 (새로 추가)
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

// Game Messages
export const GAME_MESSAGES = {
  TAP_TO_START: '탭해서 시작',
  WAIT_FOR_GREEN: '초록색이 될 때까지 기다리세요',
  TAP_NOW: '지금 탭!',
  TOO_EARLY: '너무 빨랐습니다!',
  TOO_SLOW: '시간 초과!',
  ROUND_COMPLETE: '라운드 완료',
  GAME_COMPLETE: '게임 완료!',
  GET_READY: '준비하세요...',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: '@quickreflex:user_profile',
  GAME_SESSIONS: '@quickreflex:game_sessions',
  ONBOARDING_COMPLETED: '@quickreflex:onboarding_completed',
} as const;