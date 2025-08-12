import { LocalStorageService } from './storage';
import { UserProfile, NicknameSetupData } from '../types';

class UserIdentityService {
  private static readonly UUID_KEY = '@quickreflex:uuid';
  private static readonly NICKNAME_KEY = '@quickreflex:nickname';
  private static readonly LEADERBOARD_OPT_IN_KEY = '@quickreflex:leaderboard_opt_in';

  /**
   * Generate a random UUID for user identification
   */
  private static generateUUID(): string {
    // Simple UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get or create user UUID
   */
  static async getUserUUID(): Promise<string> {
    try {
      let uuid = await LocalStorageService.getItem(this.UUID_KEY);
      
      if (!uuid) {
        uuid = this.generateUUID();
        await LocalStorageService.setItem(this.UUID_KEY, uuid);
      }
      
      return uuid;
    } catch (error) {
      console.error('Error getting user UUID:', error);
      // Fallback to generating a new UUID
      return this.generateUUID();
    }
  }

  /**
   * Get user nickname
   */
  static async getUserNickname(): Promise<string | null> {
    try {
      return await LocalStorageService.getItem(this.NICKNAME_KEY);
    } catch (error) {
      console.error('Error getting user nickname:', error);
      return null;
    }
  }

  /**
   * Set user nickname
   */
  static async setNickname(nickname: string): Promise<void> {
    try {
      await LocalStorageService.setItem(this.NICKNAME_KEY, nickname);

      // Update user profile or create if doesn't exist
      let profile = await LocalStorageService.getUserProfile();
      if (!profile) {
        // Create a basic profile if it doesn't exist
        const uuid = await this.getUserUUID();
        profile = {
          id: `user_${Date.now()}`,
          uuid,
          createdAt: Date.now(),
          onboardingCompleted: true,
          leaderboardOptIn: true,
          preferences: {
            soundEnabled: true,
            vibrationEnabled: true,
          },
        };
      }

      const updatedProfile: UserProfile = {
        ...profile,
        nickname,
      };
      await LocalStorageService.setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error setting nickname:', error);
      throw error;
    }
  }

  /**
   * Set leaderboard opt-in preference
   */
  static async setLeaderboardOptIn(optIn: boolean): Promise<void> {
    try {
      await LocalStorageService.setItem(
        this.LEADERBOARD_OPT_IN_KEY, 
        optIn.toString()
      );

      // Update user profile or create if doesn't exist
      let profile = await LocalStorageService.getUserProfile();
      if (!profile) {
        // Create a basic profile if it doesn't exist
        const uuid = await this.getUserUUID();
        profile = {
          id: `user_${Date.now()}`,
          uuid,
          createdAt: Date.now(),
          onboardingCompleted: true,
          leaderboardOptIn: optIn,
          preferences: {
            soundEnabled: true,
            vibrationEnabled: true,
          },
        };
      }

      const updatedProfile: UserProfile = {
        ...profile,
        leaderboardOptIn: optIn,
      };
      await LocalStorageService.setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error setting leaderboard opt-in:', error);
      throw error;
    }
  }

  /**
   * Set user nickname and leaderboard preferences (legacy method)
   */
  static async setupNickname(data: NicknameSetupData): Promise<void> {
    try {
      await this.setNickname(data.nickname);
      await this.setLeaderboardOptIn(data.consentToLeaderboard);
    } catch (error) {
      console.error('Error setting up nickname:', error);
      throw error;
    }
  }

  /**
   * Check if user has opted into leaderboard
   */
  static async isLeaderboardOptedIn(): Promise<boolean> {
    try {
      const optIn = await LocalStorageService.getItem(this.LEADERBOARD_OPT_IN_KEY);
      return optIn === 'true';
    } catch (error) {
      console.error('Error checking leaderboard opt-in:', error);
      return false;
    }
  }

  /**
   * Update leaderboard opt-in preference
   */
  static async updateLeaderboardOptIn(optIn: boolean): Promise<void> {
    try {
      await LocalStorageService.setItem(
        this.LEADERBOARD_OPT_IN_KEY, 
        optIn.toString()
      );

      // Update user profile
      const profile = await LocalStorageService.getUserProfile();
      if (profile) {
        const updatedProfile: UserProfile = {
          ...profile,
          leaderboardOptIn: optIn,
        };
        await LocalStorageService.setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating leaderboard opt-in:', error);
      throw error;
    }
  }

  /**
   * Get complete user identity for leaderboard submission
   */
  static async getUserIdentity(): Promise<{
    uuid: string;
    nickname: string | null;
    isOptedIn: boolean;
  }> {
    const [uuid, nickname, isOptedIn] = await Promise.all([
      this.getUserUUID(),
      this.getUserNickname(),
      this.isLeaderboardOptedIn(),
    ]);

    return { uuid, nickname, isOptedIn };
  }

  /**
   * Check if user needs to set up nickname for leaderboard
   */
  static async needsNicknameSetup(): Promise<boolean> {
    const nickname = await this.getUserNickname();
    const isOptedIn = await this.isLeaderboardOptedIn();
    
    // User needs setup if they haven't set a nickname and haven't explicitly opted out
    return !nickname && !isOptedIn;
  }

  /**
   * Clear all user identity data (for app reset)
   */
  static async clearUserIdentity(): Promise<void> {
    try {
      await Promise.all([
        LocalStorageService.removeItem(this.UUID_KEY),
        LocalStorageService.removeItem(this.NICKNAME_KEY),
        LocalStorageService.removeItem(this.LEADERBOARD_OPT_IN_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing user identity:', error);
      throw error;
    }
  }
}

export { UserIdentityService };