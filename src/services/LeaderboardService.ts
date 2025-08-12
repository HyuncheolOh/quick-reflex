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
    try {
      const userIdentity = await UserIdentityService.getUserIdentity();
      
      if (!userIdentity.isOptedIn || !userIdentity.nickname) {
        throw new Error('User not opted in to leaderboard or nickname not set');
      }

      const request: SubmitScoreRequest = {
        userId: userIdentity.uuid,
        nickname: userIdentity.nickname,
        gameType,
        bestTime: sessionData.bestTime,
        averageTime: sessionData.averageTime,
        gamesPlayed: sessionData.gamesPlayed,
        accuracy: sessionData.accuracy,
        sessionData: {
          attempts: sessionData.attempts,
          statistics: sessionData.statistics,
          timestamp: Date.now(),
        },
      };

      const response = await fetch(this.getApiUrl('leaderboard/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard for specific game type
   */
  static async getLeaderboard(
    gameType: GameType,
    limit: number = 100
  ): Promise<LeaderboardResponse> {
    try {
      const userIdentity = await UserIdentityService.getUserIdentity();
      
      const params = new URLSearchParams({
        gameType,
        limit: limit.toString(),
        ...(userIdentity.uuid && { userId: userIdentity.uuid }),
      });

      const response = await fetch(
        this.getApiUrl(`leaderboard?${params.toString()}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user's leaderboard statistics
   */
  static async getUserStats(gameType: GameType): Promise<UserLeaderboardStats | null> {
    try {
      const userIdentity = await UserIdentityService.getUserIdentity();
      
      if (!userIdentity.uuid) {
        return null;
      }

      const params = new URLSearchParams({
        gameType,
        userId: userIdentity.uuid,
      });

      const response = await fetch(
        this.getApiUrl(`leaderboard/user-stats?${params.toString()}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found in leaderboard
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  /**
   * Check if score qualifies for leaderboard (top 100)
   */
  static async checkScoreQualification(
    gameType: GameType,
    bestTime: number
  ): Promise<{ qualifies: boolean; estimatedRank?: number }> {
    try {
      const params = new URLSearchParams({
        gameType,
        bestTime: bestTime.toString(),
      });

      const response = await fetch(
        this.getApiUrl(`leaderboard/check-qualification?${params.toString()}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking score qualification:', error);
      return { qualifies: false };
    }
  }

  /**
   * Mock implementation for development/offline mode
   */
  static async getMockLeaderboard(gameType: GameType): Promise<LeaderboardResponse> {
    // Generate mock data for development
    const mockEntries: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
      id: `mock-${i}`,
      userId: `user-${i}`,
      nickname: `Player ${i + 1}`,
      gameType,
      bestTime: 200 + i * 50 + Math.random() * 100,
      averageTime: 250 + i * 60 + Math.random() * 120,
      gamesPlayed: Math.floor(Math.random() * 50) + 10,
      accuracy: Math.floor(Math.random() * 30) + 70,
      timestamp: Date.now() - i * 86400000, // days ago
      rank: i + 1,
    }));

    const userIdentity = await UserIdentityService.getUserIdentity();
    const userStats: UserLeaderboardStats | null = userIdentity.nickname ? {
      userId: userIdentity.uuid,
      nickname: userIdentity.nickname,
      bestRank: 15,
      currentRank: 25,
      totalGamesPlayed: 45,
      bestTime: 380,
      averageTime: 420,
      accuracy: 82,
    } : null;

    return {
      entries: mockEntries,
      userStats,
      totalUsers: 1500,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Health check for leaderboard service
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('health'), {
        method: 'GET',
        timeout: 5000,
      } as any);

      return response.ok;
    } catch (error) {
      console.error('Leaderboard service health check failed:', error);
      return false;
    }
  }
}

export { LeaderboardService };