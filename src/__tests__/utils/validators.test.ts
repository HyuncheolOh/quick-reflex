import { Validators } from '../../utils/validators';
import { ReactionAttempt, UserProfile } from '../../types';

describe('Validators', () => {
  describe('isValidReactionTime', () => {
    it('should validate reaction times correctly', () => {
      expect(Validators.isValidReactionTime(150)).toBe(true);
      expect(Validators.isValidReactionTime(300)).toBe(true);
      expect(Validators.isValidReactionTime(1500)).toBe(true); // Valid - under 2000ms
      expect(Validators.isValidReactionTime(50)).toBe(false); // Too fast
      expect(Validators.isValidReactionTime(2500)).toBe(false); // Too slow
      expect(Validators.isValidReactionTime(0)).toBe(false);
      expect(Validators.isValidReactionTime(-10)).toBe(false);
    });
  });

  describe('isValidNickname', () => {
    it('should validate correct nicknames', () => {
      const result = Validators.isValidNickname('Player123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty nicknames', () => {
      const result = Validators.isValidNickname('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('validation.nicknameRequired');
    });

    it('should reject whitespace-only nicknames', () => {
      const result = Validators.isValidNickname('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('validation.nicknameRequired');
    });

    it('should reject too short nicknames', () => {
      const result = Validators.isValidNickname('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('validation.nicknameTooShort');
    });

    it('should reject too long nicknames', () => {
      const result = Validators.isValidNickname('ThisNicknameIsWayTooLongToBeValid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('validation.nicknameTooLong');
    });

    it('should reject nicknames with invalid characters', () => {
      const invalidNicknames = ['Player<script>', 'Player"test', "Player'test", 'Player&test'];
      
      invalidNicknames.forEach(nickname => {
        const result = Validators.isValidNickname(nickname);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('validation.nicknameInvalidChars');
      });
    });

    it('should trim nicknames before validation', () => {
      const result = Validators.isValidNickname('  Player  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('isValidUserProfile', () => {
    it('should validate complete user profiles', () => {
      const profile: UserProfile = {
        id: 'user123',
        nickname: 'Player',
        createdAt: Date.now(),
        onboardingCompleted: true,
        preferences: {
          soundEnabled: true,
          vibrationEnabled: true
        }
      };

      const result = Validators.isValidUserProfile(profile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject profiles without ID', () => {
      const profile: Partial<UserProfile> = {
        nickname: 'Player'
      };

      const result = Validators.isValidUserProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('validation.userIdRequired');
    });

    it('should validate nicknames within profile validation', () => {
      const profile: Partial<UserProfile> = {
        id: 'user123',
        nickname: 'A'
      };

      const result = Validators.isValidUserProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('validation.nicknameTooShort');
    });

    it('should accumulate multiple errors', () => {
      const profile: Partial<UserProfile> = {
        nickname: 'A'
      };

      const result = Validators.isValidUserProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('validation.userIdRequired');
      expect(result.errors).toContain('validation.nicknameTooShort');
    });
  });

  describe('isValidAttempt', () => {
    const validAttempt: ReactionAttempt = {
      attemptNumber: 1,
      reactionTime: 250,
      isValid: true,
      timestamp: Date.now()
    };

    it('should validate correct attempts', () => {
      expect(Validators.isValidAttempt(validAttempt)).toBe(true);
    });

    it('should reject attempts with invalid attempt numbers', () => {
      expect(Validators.isValidAttempt({ ...validAttempt, attemptNumber: 0 })).toBe(false);
      expect(Validators.isValidAttempt({ ...validAttempt, attemptNumber: -1 })).toBe(false);
      expect(Validators.isValidAttempt({ ...validAttempt, attemptNumber: 'string' as any })).toBe(false);
    });

    it('should reject attempts with invalid reaction times', () => {
      expect(Validators.isValidAttempt({ ...validAttempt, reactionTime: -1 })).toBe(false);
      expect(Validators.isValidAttempt({ ...validAttempt, reactionTime: 'string' as any })).toBe(false);
    });

    it('should reject attempts with invalid isValid flag', () => {
      expect(Validators.isValidAttempt({ ...validAttempt, isValid: 'string' as any })).toBe(false);
    });

    it('should reject attempts with invalid timestamps', () => {
      expect(Validators.isValidAttempt({ ...validAttempt, timestamp: 0 })).toBe(false);
      expect(Validators.isValidAttempt({ ...validAttempt, timestamp: -1 })).toBe(false);
      expect(Validators.isValidAttempt({ ...validAttempt, timestamp: 'string' as any })).toBe(false);
    });
  });

  describe('sanitizeNickname', () => {
    it('should trim and limit nicknames', () => {
      expect(Validators.sanitizeNickname('  Player  ')).toBe('Player');
      expect(Validators.sanitizeNickname('ThisNicknameIsWayTooLongToBeValid')).toBe('ThisNicknameIsWayToo');
      expect(Validators.sanitizeNickname('  ThisNicknameIsWayTooLongToBeValid  ')).toBe('ThisNicknameIsWayToo');
    });

    it('should handle empty strings', () => {
      expect(Validators.sanitizeNickname('')).toBe('');
      expect(Validators.sanitizeNickname('   ')).toBe('');
    });
  });

  describe('isValidGameSessionId', () => {
    it('should validate correct session IDs', () => {
      expect(Validators.isValidGameSessionId('session_1234567890_abc123def')).toBe(true);
      expect(Validators.isValidGameSessionId('session_9876543210_xyz789abc')).toBe(true);
    });

    it('should reject invalid session ID formats', () => {
      expect(Validators.isValidGameSessionId('invalid')).toBe(false);
      expect(Validators.isValidGameSessionId('session_123_abc')).toBe(false); // Too short ID
      expect(Validators.isValidGameSessionId('session_abc_123456789')).toBe(false); // Non-numeric timestamp
      expect(Validators.isValidGameSessionId('game_1234567890_abc123def')).toBe(false); // Wrong prefix
    });
  });

  describe('isValidTimestamp', () => {
    const now = Date.now();

    it('should validate recent timestamps', () => {
      expect(Validators.isValidTimestamp(now)).toBe(true);
      expect(Validators.isValidTimestamp(now - 1000 * 60 * 60)).toBe(true); // 1 hour ago
      expect(Validators.isValidTimestamp(now + 1000 * 60 * 30)).toBe(true); // 30 minutes from now
    });

    it('should reject very old timestamps', () => {
      const twoYearsAgo = now - (2 * 365 * 24 * 60 * 60 * 1000);
      expect(Validators.isValidTimestamp(twoYearsAgo)).toBe(false);
    });

    it('should reject future timestamps', () => {
      const twoHoursFromNow = now + (2 * 60 * 60 * 1000);
      expect(Validators.isValidTimestamp(twoHoursFromNow)).toBe(false);
    });

    it('should reject invalid timestamp values', () => {
      expect(Validators.isValidTimestamp(0)).toBe(false);
      expect(Validators.isValidTimestamp(-1)).toBe(false);
    });
  });
});