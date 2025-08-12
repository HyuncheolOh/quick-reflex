import {
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardRequest,
  SubmitScoreRequest,
  SubmitScoreResponse,
  GameType,
  UserLeaderboardStats,
} from '../types';
import { UserIdentityService } from './UserIdentityService';
import { FirebaseLeaderboardService } from './FirebaseLeaderboardService';

class LeaderboardService {
  private static readonly API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.sprinttap.com';
  private static readonly API_VERSION = 'v1';
  
  private static getApiUrl(endpoint: string): string {
    return `${this.API_BASE_URL}/${this.API_VERSION}/${endpoint}`;
  }

  /**
   * Submit score to leaderboard
   */
  static async submitScore(
    gameType: GameType,
    sessionData: {
      bestTime: number;
      averageTime: number;
      gamesPlayed: number;
      accuracy: number;
      attempts: any[];
      statistics: any;
    }
  ): Promise<SubmitScoreResponse> {
    // Use Firebase implementation
    return FirebaseLeaderboardService.submitScore(gameType, sessionData);
  }

  /**
   * Get leaderboard for specific game type
   */
  static async getLeaderboard(
    gameType: GameType,
    limit: number = 100
  ): Promise<LeaderboardResponse> {
    // Use Firebase implementation
    return FirebaseLeaderboardService.getLeaderboard(gameType, limit);
  }

  /**
   * Get user's leaderboard statistics
   */
  static async getUserStats(gameType: GameType): Promise<UserLeaderboardStats | null> {
    // Use Firebase implementation
    return FirebaseLeaderboardService.getUserStats(gameType);
  }

  /**
   * Check if score qualifies for leaderboard (top 100)
   */
  static async checkScoreQualification(
    gameType: GameType,
    bestTime: number
  ): Promise<{ qualifies: boolean; estimatedRank?: number }> {
    // Use Firebase implementation
    return FirebaseLeaderboardService.checkScoreQualification(gameType, bestTime);
  }

  /**
   * Mock implementation for development/offline mode
   */
  static async getMockLeaderboard(gameType: GameType): Promise<LeaderboardResponse> {
    // Use Firebase implementation's mock data
    return FirebaseLeaderboardService.getMockLeaderboard(gameType);
  }

  /**
   * Health check for leaderboard service
   */
  static async healthCheck(): Promise<boolean> {
    // Check Firebase availability
    return FirebaseLeaderboardService.isAvailable();
  }
}

export { LeaderboardService };