import { GameLogic } from '../../utils/gameLogic';
import { ReactionAttempt } from '../../types/game.types';

describe('GameLogic', () => {
  describe('validateReactionTime', () => {
    it('should return true for valid reaction times', () => {
      expect(GameLogic.validateReactionTime(150)).toBe(true);
      expect(GameLogic.validateReactionTime(300)).toBe(true);
      expect(GameLogic.validateReactionTime(500)).toBe(true);
    });

    it('should return false for invalid reaction times', () => {
      expect(GameLogic.validateReactionTime(50)).toBe(false); // Too fast
      expect(GameLogic.validateReactionTime(2500)).toBe(false); // Too slow
      expect(GameLogic.validateReactionTime(0)).toBe(false);
      expect(GameLogic.validateReactionTime(-10)).toBe(false);
    });
  });

  describe('generateRandomDelay', () => {
    it('should generate delay within valid range', () => {
      for (let i = 0; i < 100; i++) {
        const delay = GameLogic.generateRandomDelay();
        expect(delay).toBeGreaterThanOrEqual(1000);
        expect(delay).toBeLessThanOrEqual(3000);
      }
    });

    it('should generate different values', () => {
      const delays = Array.from({ length: 10 }, () => GameLogic.generateRandomDelay());
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate correct statistics for valid attempts', () => {
      const attempts: ReactionAttempt[] = [
        { attemptNumber: 1, reactionTime: 200, isValid: true, timestamp: Date.now() },
        { attemptNumber: 2, reactionTime: 300, isValid: true, timestamp: Date.now() },
        { attemptNumber: 3, reactionTime: 250, isValid: true, timestamp: Date.now() },
      ];

      const stats = GameLogic.calculateStatistics(attempts);
      
      expect(stats.averageTime).toBe(250); // (200 + 300 + 250) / 3
      expect(stats.bestTime).toBe(200);
      expect(stats.worstTime).toBe(300);
      expect(stats.totalAttempts).toBe(3);
      expect(stats.validAttempts).toBe(3);
    });

    it('should filter out invalid attempts', () => {
      const attempts: ReactionAttempt[] = [
        { attemptNumber: 1, reactionTime: 200, isValid: true, timestamp: Date.now() },
        { attemptNumber: 2, reactionTime: 50, isValid: false, timestamp: Date.now() },
        { attemptNumber: 3, reactionTime: 300, isValid: true, timestamp: Date.now() },
      ];

      const stats = GameLogic.calculateStatistics(attempts);
      
      expect(stats.averageTime).toBe(250); // (200 + 300) / 2
      expect(stats.bestTime).toBe(200);
      expect(stats.worstTime).toBe(300);
      expect(stats.totalAttempts).toBe(3);
      expect(stats.validAttempts).toBe(2);
    });

    it('should handle empty attempts array', () => {
      const stats = GameLogic.calculateStatistics([]);
      
      expect(stats.averageTime).toBe(0);
      expect(stats.bestTime).toBe(0);
      expect(stats.worstTime).toBe(0);
      expect(stats.totalAttempts).toBe(0);
      expect(stats.validAttempts).toBe(0);
    });

    it('should handle all invalid attempts', () => {
      const attempts: ReactionAttempt[] = [
        { attemptNumber: 1, reactionTime: 50, isValid: false, timestamp: Date.now() },
        { attemptNumber: 2, reactionTime: 30, isValid: false, timestamp: Date.now() },
      ];

      const stats = GameLogic.calculateStatistics(attempts);
      
      expect(stats.averageTime).toBe(0);
      expect(stats.bestTime).toBe(0);
      expect(stats.worstTime).toBe(0);
      expect(stats.totalAttempts).toBe(2);
      expect(stats.validAttempts).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('should format milliseconds correctly', () => {
      expect(GameLogic.formatTime(250)).toBe('250ms');
      expect(GameLogic.formatTime(1000)).toBe('1000ms');
      expect(GameLogic.formatTime(150.7)).toBe('151ms'); // Should round
    });

    it('should handle edge cases', () => {
      expect(GameLogic.formatTime(0)).toBe('-');
      expect(GameLogic.formatTime(-10)).toBe('-');
    });
  });

  describe('getPerformanceRating', () => {
    it('should return correct ratings for different times', () => {
      expect(GameLogic.getPerformanceRating(150).rating).toBe('EXCELLENT');
      expect(GameLogic.getPerformanceRating(250).rating).toBe('GOOD');
      expect(GameLogic.getPerformanceRating(400).rating).toBe('AVERAGE');
      expect(GameLogic.getPerformanceRating(600).rating).toBe('SLOW');
    });

    it('should handle no valid attempts', () => {
      const rating = GameLogic.getPerformanceRating(0, false);
      expect(rating.rating).toBe('NO_DATA');
      expect(rating.message).toBe('noValidRecords');
      expect(rating.color).toBe('#8E8E93');
    });

    it('should include appropriate colors', () => {
      expect(GameLogic.getPerformanceRating(150).color).toBe('#00FF00');
      expect(GameLogic.getPerformanceRating(250).color).toBe('#34C759');
      expect(GameLogic.getPerformanceRating(400).color).toBe('#FF9500');
      expect(GameLogic.getPerformanceRating(600).color).toBe('#FF3B30');
    });
  });

  describe('createAttempt', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create valid attempt', () => {
      const attempt = GameLogic.createAttempt(1, 250);
      
      expect(attempt.attemptNumber).toBe(1);
      expect(attempt.reactionTime).toBe(250);
      expect(attempt.isValid).toBe(true);
      expect(attempt.timestamp).toBe(1234567890);
    });

    it('should create invalid attempt', () => {
      const attempt = GameLogic.createAttempt(2, 50, false);
      
      expect(attempt.attemptNumber).toBe(2);
      expect(attempt.reactionTime).toBe(50);
      expect(attempt.isValid).toBe(false);
      expect(attempt.timestamp).toBe(1234567890);
    });
  });

  describe('shouldGameEnd', () => {
    it('should return false for incomplete game', () => {
      const attempts: ReactionAttempt[] = [
        { attemptNumber: 1, reactionTime: 200, isValid: true, timestamp: Date.now() },
        { attemptNumber: 2, reactionTime: 300, isValid: true, timestamp: Date.now() },
      ];
      
      expect(GameLogic.shouldGameEnd(attempts)).toBe(false);
    });

    it('should return true for completed game', () => {
      // TOTAL_ROUNDS는 5로 설정되어 있다고 가정
      const attempts: ReactionAttempt[] = Array.from({ length: 5 }, (_, i) => ({
        attemptNumber: i + 1,
        reactionTime: 200,
        isValid: true,
        timestamp: Date.now(),
      }));
      
      expect(GameLogic.shouldGameEnd(attempts)).toBe(true);
    });
  });

  describe('getCompletionPercentage', () => {
    it('should calculate correct percentages', () => {
      expect(GameLogic.getCompletionPercentage(1)).toBe(20); // 1/5 * 100
      expect(GameLogic.getCompletionPercentage(3)).toBe(60); // 3/5 * 100
      expect(GameLogic.getCompletionPercentage(5)).toBe(100); // 5/5 * 100
    });

    it('should handle edge cases', () => {
      expect(GameLogic.getCompletionPercentage(0)).toBe(0);
    });
  });
});