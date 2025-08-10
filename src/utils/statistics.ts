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
      .filter(s => s.isCompleted && !s.isFailed)
      .slice(0, 5) // Last 5 games
      .reverse(); // Oldest to newest

    if (recentSessions.length < 2) {
      return { trend: 'STABLE', percentage: 0 };
    }

    const firstAverage = recentSessions[0].statistics.averageTime;
    const lastAverage = recentSessions[recentSessions.length - 1].statistics.averageTime;

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

  static getProgressInsights(sessions: GameSession[]): string[] {
    const insights: string[] = [];
    const completedSessions = sessions.filter(s => s.isCompleted && !s.isFailed);

    if (completedSessions.length === 0) {
      return ['더 많은 게임을 플레이해보세요!'];
    }

    const trend = this.calculateImprovementTrend(completedSessions);
    const lastSession = completedSessions[0];
    const consistency = this.getConsistencyScore(lastSession.attempts);

    // Trend insights
    if (trend.trend === 'IMPROVING') {
      insights.push(`최근 ${trend.percentage}% 향상되었습니다! 🎉`);
    } else if (trend.trend === 'DECLINING') {
      insights.push(`최근 성과가 ${trend.percentage}% 하락했습니다. 더 집중해보세요! 💪`);
    } else {
      insights.push('안정적인 성과를 유지하고 있습니다 👍');
    }

    // Consistency insights
    if (consistency.rating === 'VERY_CONSISTENT') {
      insights.push('매우 일관된 반응속도를 보입니다! 🎯');
    } else if (consistency.rating === 'INCONSISTENT') {
      insights.push('반응속도의 일관성을 향상시켜보세요 📈');
    }

    // Performance insights
    const avgTime = lastSession.statistics.averageTime;
    if (avgTime < 250) {
      insights.push('뛰어난 반응속도를 가지고 있습니다! ⚡');
    } else if (avgTime > 500) {
      insights.push('더 빠른 반응을 위해 연습해보세요! 🏃‍♂️');
    }

    return insights;
  }
}