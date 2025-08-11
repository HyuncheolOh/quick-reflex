import { GameSession, ReactionAttempt } from '../types';

export class StatisticsUtils {
  static calculateImprovementTrend(sessions: GameSession[]): {
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    percentage: number;
  } {
    if (sessions.length < 2) {
      return { trend: 'STABLE', percentage: 0 };
    }

    const recentSessions = sessions
      .filter(s => s.isCompleted && !s.isFailed && s.statistics.averageTime > 0)
      .slice(0, 5) // Last 5 games
      .reverse(); // Oldest to newest

    if (recentSessions.length < 2) {
      return { trend: 'STABLE', percentage: 0 };
    }

    const firstAverage = recentSessions[0].statistics.averageTime;
    const lastAverage = recentSessions[recentSessions.length - 1].statistics.averageTime;

    if (firstAverage === 0 || lastAverage === 0) {
      return { trend: 'STABLE', percentage: 0 };
    }

    const improvementPercentage = ((firstAverage - lastAverage) / firstAverage) * 100;

    if (Math.abs(improvementPercentage) < 5) {
      return { trend: 'STABLE', percentage: Math.round(improvementPercentage) };
    } else if (improvementPercentage > 0) {
      return { trend: 'IMPROVING', percentage: Math.round(improvementPercentage) };
    } else {
      return { trend: 'DECLINING', percentage: Math.round(Math.abs(improvementPercentage)) };
    }
  }

  static getConsistencyScore(attempts: ReactionAttempt[]): {
    score: number; // 0-100
    rating: 'VERY_CONSISTENT' | 'CONSISTENT' | 'MODERATE' | 'INCONSISTENT';
  } {
    const validAttempts = attempts.filter(a => a.isValid);
    
    if (validAttempts.length < 2) {
      return { score: 0, rating: 'INCONSISTENT' };
    }

    const times = validAttempts.map(a => a.reactionTime);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    // Calculate standard deviation
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate consistency score (lower std dev = higher consistency)
    const consistencyScore = Math.max(0, 100 - (standardDeviation / mean) * 100);
    
    let rating: 'VERY_CONSISTENT' | 'CONSISTENT' | 'MODERATE' | 'INCONSISTENT';
    
    if (consistencyScore >= 80) rating = 'VERY_CONSISTENT';
    else if (consistencyScore >= 60) rating = 'CONSISTENT';
    else if (consistencyScore >= 40) rating = 'MODERATE';
    else rating = 'INCONSISTENT';

    return {
      score: Math.round(consistencyScore),
      rating
    };
  }

  static getSessionSummary(sessions: GameSession[]) {
    const completedSessions = sessions.filter(s => s.isCompleted && !s.isFailed);
    
    if (completedSessions.length === 0) {
      return {
        totalGames: sessions.length,
        completedGames: 0,
        averageReactionTime: 0,
        bestReactionTime: 0,
        worstReactionTime: 0,
        successRate: 0,
        totalPlayTime: 0,
      };
    }

    const allTimes = completedSessions.map(s => s.statistics.averageTime);
    const bestTimes = completedSessions.map(s => s.statistics.bestTime);
    const worstTimes = completedSessions.map(s => s.statistics.worstTime);

    return {
      totalGames: sessions.length,
      completedGames: completedSessions.length,
      averageReactionTime: Math.round(allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length),
      bestReactionTime: Math.min(...bestTimes),
      worstReactionTime: Math.max(...worstTimes),
      successRate: Math.round((completedSessions.length / sessions.length) * 100),
      totalPlayTime: sessions.length * 60000, // Estimate 1 minute per game
    };
  }

  static getProgressInsights(sessions: GameSession[]): Array<{ key: string; params: any }> {
    const insights: Array<{ key: string; params: any }> = [];
    const completedSessions = sessions.filter(s => s.isCompleted && !s.isFailed);

    if (completedSessions.length === 0) {
      return [{ key: 'playMore', params: null }];
    }

    const trend = this.calculateImprovementTrend(completedSessions);
    const lastSession = completedSessions[0];
    const consistency = this.getConsistencyScore(lastSession.attempts);

    // Trend insights
    if (trend.trend === 'IMPROVING') {
      insights.push({ key: 'improved', params: { percentage: trend.percentage } });
    } else if (trend.trend === 'DECLINING') {
      insights.push({ key: 'declined', params: { percentage: trend.percentage } });
    } else {
      insights.push({ key: 'stable', params: null });
    }

    // Consistency insights
    if (consistency.rating === 'VERY_CONSISTENT') {
      insights.push({ key: 'consistent', params: null });
    } else if (consistency.rating === 'INCONSISTENT') {
      insights.push({ key: 'inconsistent', params: null });
    }

    // Performance insights
    const avgTime = lastSession.statistics.averageTime;
    if (avgTime > 0) {
      if (avgTime < 250) {
        insights.push({ key: 'excellent', params: null });
      } else if (avgTime > 500) {
        insights.push({ key: 'needsPractice', params: null });
      }
    }

    return insights;
  }
}