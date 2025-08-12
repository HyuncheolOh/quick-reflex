// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  nickname: string;
  gameType: GameType;
  bestTime: number; // milliseconds
  averageTime: number; // milliseconds
  gamesPlayed: number;
  accuracy: number; // percentage
  timestamp: number; // when this record was achieved
  rank?: number; // assigned by server/client
}

export interface UserLeaderboardStats {
  userId: string;
  nickname: string;
  bestRank: number;
  currentRank: number | null; // null if not in top 100
  totalGamesPlayed: number;
  bestTime: number;
  averageTime: number;
  accuracy: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userStats: UserLeaderboardStats | null;
  totalUsers: number;
  lastUpdated: number;
}

export interface LeaderboardRequest {
  gameType: GameType;
  limit?: number; // default 100
  offset?: number; // for pagination if needed
}

export interface SubmitScoreRequest {
  userId: string;
  nickname: string;
  gameType: GameType;
  bestTime: number;
  averageTime: number;
  gamesPlayed: number;
  accuracy: number;
  sessionData: {
    attempts: ReactionAttempt[];
    statistics: GameStatistics;
    timestamp: number;
  };
}

export interface SubmitScoreResponse {
  success: boolean;
  newRank?: number;
  previousRank?: number;
  isNewRecord: boolean;
  leaderboardEntry: LeaderboardEntry;
}

// Game types for leaderboard categorization
export type GameType = 'TAP_TEST' | 'AUDIO_TEST' | 'GO_NO_GO_TEST';

// Import existing types
import { ReactionAttempt, GameStatistics } from './game.types';