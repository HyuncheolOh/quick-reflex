import { UserProfile, ReactionAttempt } from '../types';
import { VALIDATION } from '../constants';

export class Validators {
  static isValidReactionTime(time: number): boolean {
    return time >= VALIDATION.HUMAN_MIN_REACTION_TIME && 
           time <= VALIDATION.HUMAN_MAX_REACTION_TIME;
  }

  static isValidNickname(nickname: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!nickname || nickname.trim().length === 0) {
      return { isValid: false, error: 'validation.nicknameRequired' };
    }

    if (nickname.trim().length < 2) {
      return { isValid: false, error: 'validation.nicknameTooShort' };
    }

    if (nickname.trim().length > 20) {
      return { isValid: false, error: 'validation.nicknameTooLong' };
    }

    // Check for inappropriate characters
    const invalidChars = /[<>\"'&]/;
    if (invalidChars.test(nickname)) {
      return { isValid: false, error: 'validation.nicknameInvalidChars' };
    }

    return { isValid: true };
  }

  static isValidUserProfile(profile: Partial<UserProfile>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!profile.id) {
      errors.push('validation.userIdRequired');
    }

    if (profile.nickname) {
      const nicknameValidation = this.isValidNickname(profile.nickname);
      if (!nicknameValidation.isValid && nicknameValidation.error) {
        errors.push(nicknameValidation.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidAttempt(attempt: ReactionAttempt): boolean {
    return (
      typeof attempt.attemptNumber === 'number' &&
      attempt.attemptNumber > 0 &&
      typeof attempt.reactionTime === 'number' &&
      attempt.reactionTime >= 0 &&
      typeof attempt.isValid === 'boolean' &&
      typeof attempt.timestamp === 'number' &&
      attempt.timestamp > 0
    );
  }

  static sanitizeNickname(nickname: string): string {
    return nickname.trim().slice(0, 20);
  }

  static isValidGameSessionId(sessionId: string): boolean {
    // Basic validation for session ID format
    return /^session_\d+_[a-zA-Z0-9]{9}$/.test(sessionId);
  }

  static isValidTimestamp(timestamp: number): boolean {
    // Check if timestamp is reasonable (not too far in past or future)
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    const oneHourFromNow = now + (60 * 60 * 1000);
    
    return timestamp >= oneYearAgo && timestamp <= oneHourFromNow;
  }
}