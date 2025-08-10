import { ReactionAttempt, GameStatistics } from '../types';
import { VALIDATION, GAME_CONFIG } from '../constants';

export class GameLogic {
  static validateReactionTime(reactionTime: number): boolean {
    return reactionTime >= VALIDATION.HUMAN_MIN_REACTION_TIME && 
           reactionTime <= VALIDATION.HUMAN_MAX_REACTION_TIME;
  }

  static generateRandomDelay(): number {
    const min = GAME_CONFIG.MIN_WAIT_TIME;
    const max = GAME_CONFIG.MAX_WAIT_TIME;
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
      averageTime: Math.round(sum / reactionTimes.length),
      bestTime: Math.min(...reactionTimes),
      worstTime: Math.max(...reactionTimes),
      totalAttempts: attempts.length,
      validAttempts: reactionTimes.length,
    };
  }

  static formatTime(milliseconds: number): string {
    return `${Math.round(milliseconds)}ms`;
  }

  static getPerformanceRating(averageTime: number, hasValidAttempts: boolean = true): {
    rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'SLOW' | 'NO_DATA';
    message: string;
    color: string;
  } {
    // 유효한 시도가 없는 경우
    if (!hasValidAttempts || averageTime <= 0) {
      return {
        rating: 'NO_DATA',
        message: '유효한 기록이 없습니다',
        color: '#8E8E93',
      };
    }

    if (averageTime <= 200) {
      return {
        rating: 'EXCELLENT',
        message: '뛰어난 반응속도!',
        color: '#00FF00',
      };
    } else if (averageTime <= 300) {
      return {
        rating: 'GOOD',
        message: '좋은 반응속도!',
        color: '#34C759',
      };
    } else if (averageTime <= 500) {
      return {
        rating: 'AVERAGE',
        message: '평균적인 반응속도',
        color: '#FF9500',
      };
    } else {
      return {
        rating: 'SLOW',
        message: '연습이 필요합니다',
        color: '#FF3B30',
      };
    }
  }

  static createAttempt(
    attemptNumber: number,
    reactionTime: number,
    isValid: boolean = true
  ): ReactionAttempt {
    return {
      attemptNumber,
      reactionTime,
      isValid,
      timestamp: Date.now(),
    };
  }

  static shouldGameEnd(attempts: ReactionAttempt[]): boolean {
    return attempts.length >= GAME_CONFIG.TOTAL_ROUNDS;
  }

  static getCompletionPercentage(currentRound: number): number {
    return (currentRound / GAME_CONFIG.TOTAL_ROUNDS) * 100;
  }
}