import { GameSession, GameStatistics, ReactionAttempt } from '../../types';
import { LocalStorageService } from './localStorage';

export class GameStorageService {
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static calculateStatistics(attempts: ReactionAttempt[]): GameStatistics {
    const validAttempts = attempts.filter(attempt => attempt.isValid);
    const reactionTimes = validAttempts.map(attempt => attempt.reactionTime);

    if (reactionTimes.length === 0) {
      return {
        averageTime: 0,
        bestTime: 0,
        worstTime: 0,
        totalAttempts: attempts.length,
        validAttempts: 0,
      };
    }

    const sum = reactionTimes.reduce((total, time) => total + time, 0);
    
    return {
      averageTime: sum / reactionTimes.length,
      bestTime: Math.min(...reactionTimes),
      worstTime: Math.max(...reactionTimes),
      totalAttempts: attempts.length,
      validAttempts: reactionTimes.length,
    };
  }

  static async saveGameSession(
    gameType: 'TAP_TEST' | 'OTHER_GAMES',
    attempts: ReactionAttempt[],
    isCompleted: boolean,
    isFailed: boolean,
    failReason?: 'EARLY_TAP' | 'TIMEOUT'
  ): Promise<GameSession> {
    try {
      const userProfile = await LocalStorageService.getUserProfile();
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const statistics = this.calculateStatistics(attempts);
      
      const gameSession: GameSession = {
        id: this.generateSessionId(),
        gameType,
        userId: userProfile.id,
        timestamp: Date.now(),
        attempts,
        statistics,
        isCompleted,
        isFailed,
        failReason,
      };

      await LocalStorageService.addGameSession(gameSession);

      // Update user statistics
      if (isCompleted && !isFailed) {
        await this.updateUserStatistics(statistics);
      }

      return gameSession;
    } catch (error) {
      console.error('Error saving game session:', error);
      throw error;
    }
  }

  private static async updateUserStatistics(newStatistics: GameStatistics): Promise<void> {
    try {
      const userProfile = await LocalStorageService.getUserProfile();
      if (!userProfile) return;

      const currentStats = userProfile.statistics || {
        totalGamesPlayed: 0,
        bestReactionTime: undefined,
        averageReactionTime: undefined,
      };

      const updatedStats = {
        totalGamesPlayed: currentStats.totalGamesPlayed + 1,
        bestReactionTime: currentStats.bestReactionTime 
          ? Math.min(currentStats.bestReactionTime, newStatistics.bestTime)
          : newStatistics.bestTime,
        averageReactionTime: currentStats.averageReactionTime
          ? (currentStats.averageReactionTime + newStatistics.averageTime) / 2
          : newStatistics.averageTime,
      };

      await LocalStorageService.updateUserProfile({
        statistics: updatedStats,
      });
    } catch (error) {
      console.error('Error updating user statistics:', error);
    }
  }

  static async getPersonalBest(): Promise<number | null> {
    try {
      const bestSession = await LocalStorageService.getBestSession();
      return bestSession ? bestSession.statistics.bestTime : null;
    } catch (error) {
      console.error('Error getting personal best:', error);
      return null;
    }
  }

  static async getGameHistory(limit: number = 10): Promise<GameSession[]> {
    try {
      return await LocalStorageService.getRecentSessions(limit);
    } catch (error) {
      console.error('Error getting game history:', error);
      return [];
    }
  }
}