import { StatisticsUtils } from '../../utils/statistics';
import { GameSession, ReactionAttempt, GameStatistics } from '../../types';

describe('StatisticsUtils', () => {
  const createMockSession = (
    averageTime: number,
    bestTime: number = averageTime - 50,
    worstTime: number = averageTime + 50,
    isCompleted: boolean = true,
    isFailed: boolean = false,
    attempts: ReactionAttempt[] = []
  ): GameSession => ({
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: 'testUser',
    gameType: 'tap',
    startTime: Date.now() - 60000,
    endTime: Date.now(),
    isCompleted,
    isFailed,
    attempts,
    statistics: {
      averageTime,
      bestTime,
      worstTime,
      totalAttempts: attempts.length,
      validAttempts: attempts.filter(a => a.isValid).length,
    } as GameStatistics,
  });

  const createMockAttempt = (reactionTime: number, isValid: boolean = true): ReactionAttempt => ({
    attemptNumber: 1,
    reactionTime,
    isValid,
    timestamp: Date.now(),
  });

  describe('calculateImprovementTrend', () => {
    it('should return STABLE for less than 2 sessions', () => {
      const sessions = [createMockSession(300)];
      const result = StatisticsUtils.calculateImprovementTrend(sessions);
      
      expect(result.trend).toBe('STABLE');
      expect(result.percentage).toBe(0);
    });

    it('should calculate IMPROVING trend correctly', () => {
      const sessions = [
        createMockSession(200), // Recent (better)
        createMockSession(300), // Older (worse)
      ];

      const result = StatisticsUtils.calculateImprovementTrend(sessions);
      
      expect(result.trend).toBe('IMPROVING');
      expect(result.percentage).toBeGreaterThan(0);
    });

    it('should calculate DECLINING trend correctly', () => {
      const sessions = [
        createMockSession(400), // Recent (worse)
        createMockSession(300), // Older (better)
      ];

      const result = StatisticsUtils.calculateImprovementTrend(sessions);
      
      expect(result.trend).toBe('DECLINING');
      expect(result.percentage).toBeGreaterThan(0);
    });

    it('should return STABLE for small changes', () => {
      const sessions = [
        createMockSession(300), // Recent
        createMockSession(310), // Older - only 3.2% difference
      ];

      const result = StatisticsUtils.calculateImprovementTrend(sessions);
      
      expect(result.trend).toBe('STABLE');
    });

    it('should filter out incomplete sessions', () => {
      const sessions = [
        createMockSession(200, 150, 250, true, false), // Complete
        createMockSession(400, 350, 450, false, false), // Incomplete
        createMockSession(300, 250, 350, true, false), // Complete
      ];

      const result = StatisticsUtils.calculateImprovementTrend(sessions);
      
      expect(result.trend).toBe('IMPROVING');
    });

    it('should handle failed sessions', () => {
      const sessions = [
        createMockSession(200, 150, 250, true, false), // Complete
        createMockSession(0, 0, 0, true, true), // Failed
        createMockSession(300, 250, 350, true, false), // Complete
      ];

      const result = StatisticsUtils.calculateImprovementTrend(sessions);
      
      expect(result.trend).toBe('IMPROVING');
    });
  });

  describe('getConsistencyScore', () => {
    it('should return low score for inconsistent attempts', () => {
      const attempts = [
        createMockAttempt(100),
        createMockAttempt(500),
        createMockAttempt(800),
        createMockAttempt(200),
        createMockAttempt(1000),
      ];

      const result = StatisticsUtils.getConsistencyScore(attempts);
      
      expect(result.score).toBeLessThan(40);
      expect(result.rating).toBe('INCONSISTENT');
    });

    it('should return high score for consistent attempts', () => {
      const attempts = [
        createMockAttempt(250),
        createMockAttempt(255),
        createMockAttempt(245),
        createMockAttempt(252),
      ];

      const result = StatisticsUtils.getConsistencyScore(attempts);
      
      expect(result.score).toBeGreaterThan(80);
      expect(result.rating).toBe('VERY_CONSISTENT');
    });

    it('should handle single attempt', () => {
      const attempts = [createMockAttempt(250)];
      const result = StatisticsUtils.getConsistencyScore(attempts);
      
      expect(result.score).toBe(0);
      expect(result.rating).toBe('INCONSISTENT');
    });

    it('should filter out invalid attempts', () => {
      const attempts = [
        createMockAttempt(250, true),
        createMockAttempt(50, false), // Invalid
        createMockAttempt(255, true),
        createMockAttempt(245, true),
      ];

      const result = StatisticsUtils.getConsistencyScore(attempts);
      
      expect(result.score).toBeGreaterThan(50);
    });

    it('should assign correct ratings', () => {
      const veryConsistent = [
        createMockAttempt(250),
        createMockAttempt(252),
        createMockAttempt(248),
      ];
      
      const consistent = [
        createMockAttempt(250),
        createMockAttempt(270),
        createMockAttempt(230),
      ];

      expect(StatisticsUtils.getConsistencyScore(veryConsistent).rating).toBe('VERY_CONSISTENT');
      expect(StatisticsUtils.getConsistencyScore(consistent).rating).toMatch(/CONSISTENT|MODERATE/);
    });
  });

  describe('getSessionSummary', () => {
    it('should calculate summary for completed sessions', () => {
      const sessions = [
        createMockSession(200, 150, 250),
        createMockSession(300, 250, 350),
        createMockSession(0, 0, 0, true, true), // Failed session
      ];

      const summary = StatisticsUtils.getSessionSummary(sessions);
      
      expect(summary.totalGames).toBe(3);
      expect(summary.completedGames).toBe(2);
      expect(summary.averageReactionTime).toBe(250); // (200 + 300) / 2
      expect(summary.bestReactionTime).toBe(150);
      expect(summary.worstReactionTime).toBe(350);
      expect(summary.successRate).toBe(67); // 2/3 * 100
      expect(summary.totalPlayTime).toBe(180000); // 3 * 60000
    });

    it('should handle no completed sessions', () => {
      const sessions = [
        createMockSession(0, 0, 0, false, false), // Incomplete
        createMockSession(0, 0, 0, true, true),   // Failed
      ];

      const summary = StatisticsUtils.getSessionSummary(sessions);
      
      expect(summary.totalGames).toBe(2);
      expect(summary.completedGames).toBe(0);
      expect(summary.averageReactionTime).toBe(0);
      expect(summary.bestReactionTime).toBe(0);
      expect(summary.worstReactionTime).toBe(0);
      expect(summary.successRate).toBe(0);
    });

    it('should handle empty session list', () => {
      const summary = StatisticsUtils.getSessionSummary([]);
      
      expect(summary.totalGames).toBe(0);
      expect(summary.completedGames).toBe(0);
      expect(summary.averageReactionTime).toBe(0);
      expect(summary.successRate).toBe(0);
    });
  });

  describe('getProgressInsights', () => {
    it('should suggest playing more for no sessions', () => {
      const insights = StatisticsUtils.getProgressInsights([]);
      
      expect(insights).toHaveLength(1);
      expect(insights[0].key).toBe('playMore');
    });

    it('should provide improvement insights', () => {
      const attempts = [createMockAttempt(250), createMockAttempt(255)];
      const sessions = [
        createMockSession(200, 150, 250, true, false, attempts), // Recent (better)
        createMockSession(300, 250, 350, true, false, attempts), // Older (worse)
      ];

      const insights = StatisticsUtils.getProgressInsights(sessions);
      
      const improvementInsight = insights.find(i => i.key === 'improved');
      expect(improvementInsight).toBeDefined();
      expect(improvementInsight?.params.percentage).toBeGreaterThan(0);
    });

    it('should provide declining performance insights', () => {
      const attempts = [createMockAttempt(400), createMockAttempt(410)];
      const sessions = [
        createMockSession(400, 350, 450, true, false, attempts), // Recent (worse)
        createMockSession(300, 250, 350, true, false, attempts), // Older (better)
      ];

      const insights = StatisticsUtils.getProgressInsights(sessions);
      
      const decliningInsight = insights.find(i => i.key === 'declined');
      expect(decliningInsight).toBeDefined();
    });

    it('should provide consistency insights', () => {
      const veryConsistentAttempts = [
        createMockAttempt(250),
        createMockAttempt(252),
        createMockAttempt(248),
      ];
      
      const sessions = [
        createMockSession(250, 200, 300, true, false, veryConsistentAttempts),
      ];

      const insights = StatisticsUtils.getProgressInsights(sessions);
      
      const consistencyInsight = insights.find(i => i.key === 'consistent');
      expect(consistencyInsight).toBeDefined();
    });

    it('should provide performance insights', () => {
      const attempts = [createMockAttempt(200)];
      
      // Excellent performance
      const excellentSessions = [
        createMockSession(200, 150, 250, true, false, attempts),
      ];

      const excellentInsights = StatisticsUtils.getProgressInsights(excellentSessions);
      const excellentInsight = excellentInsights.find(i => i.key === 'excellent');
      expect(excellentInsight).toBeDefined();

      // Needs practice
      const slowSessions = [
        createMockSession(600, 550, 650, true, false, [createMockAttempt(600)]),
      ];

      const slowInsights = StatisticsUtils.getProgressInsights(slowSessions);
      const practiceInsight = slowInsights.find(i => i.key === 'needsPractice');
      expect(practiceInsight).toBeDefined();
    });

    it('should provide stable trend insights', () => {
      const attempts = [createMockAttempt(300)];
      const sessions = [
        createMockSession(300, 250, 350, true, false, attempts),
        createMockSession(305, 255, 355, true, false, attempts), // Very small change
      ];

      const insights = StatisticsUtils.getProgressInsights(sessions);
      
      const stableInsight = insights.find(i => i.key === 'stable');
      expect(stableInsight).toBeDefined();
    });
  });
});