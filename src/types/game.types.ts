export enum GameState {
  IDLE = 'IDLE',
  COUNTDOWN = 'COUNTDOWN',
  WAITING = 'WAITING',
  READY = 'READY',
  TAP_DETECTED = 'TAP_DETECTED',
  ROUND_COMPLETE = 'ROUND_COMPLETE',
  GAME_COMPLETE = 'GAME_COMPLETE',
  FAILED = 'FAILED'
}

export interface ReactionAttempt {
  attemptNumber: number;
  reactionTime: number; // milliseconds
  isValid: boolean;
  timestamp: number;
}

export interface GameStatistics {
  averageTime: number;
  bestTime: number;
  worstTime: number;
  totalAttempts: number;
  validAttempts: number;
}

export interface GameSession {
  id: string;
  gameType: 'TAP_TEST' | 'OTHER_GAMES';
  userId: string;
  timestamp: number;
  attempts: ReactionAttempt[];
  statistics: GameStatistics;
  isCompleted: boolean;
  isFailed: boolean;
  failReason?: 'EARLY_TAP' | 'TIMEOUT';
}

export interface TapGameState {
  currentState: GameState;
  currentRound: number;
  totalRounds: number;
  waitStartTime?: number;
  readyStartTime?: number;
  results: number[];
  randomDelay: number; // Random delay in milliseconds
}