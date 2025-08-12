import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, GameSession } from '../../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@quickreflex:user_profile',
  GAME_SESSIONS: '@quickreflex:game_sessions',
  ONBOARDING_COMPLETED: '@quickreflex:onboarding_completed',
} as const;

export class LocalStorageService {
  // User Profile Management
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async setUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error setting user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const currentProfile = await this.getUserProfile();
      if (!currentProfile) return null;

      const updatedProfile = { ...currentProfile, ...updates };
      await this.setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // Game Sessions Management
  static async getGameSessions(): Promise<GameSession[]> {
    try {
      const sessionsData = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SESSIONS);
      return sessionsData ? JSON.parse(sessionsData) : [];
    } catch (error) {
      console.error('Error getting game sessions:', error);
      return [];
    }
  }

  static async addGameSession(session: GameSession): Promise<void> {
    try {
      const currentSessions = await this.getGameSessions();
      const updatedSessions = [session, ...currentSessions];
      
      // Keep only the last 50 sessions to prevent excessive storage usage
      const limitedSessions = updatedSessions.slice(0, 50);
      
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(limitedSessions));
    } catch (error) {
      console.error('Error adding game session:', error);
      throw error;
    }
  }

  static async getRecentSessions(limit: number = 10): Promise<GameSession[]> {
    try {
      const sessions = await this.getGameSessions();
      return sessions.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      return [];
    }
  }

  static async getBestSession(): Promise<GameSession | null> {
    try {
      const sessions = await this.getGameSessions();
      const completedSessions = sessions.filter(s => s.isCompleted && !s.isFailed);
      
      if (completedSessions.length === 0) return null;
      
      return completedSessions.reduce((best, current) => 
        current.statistics.bestTime < best.statistics.bestTime ? current : best
      );
    } catch (error) {
      console.error('Error getting best session:', error);
      return null;
    }
  }

  // Onboarding Management
  static async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  static async setOnboardingCompleted(completed: boolean = true): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  }

  // Clear all data (for reset functionality)
  static async clearAllData(): Promise<void> {
    try {
      // Get all keys with our prefix
      const allKeys = await AsyncStorage.getAllKeys();
      const quickReflexKeys = allKeys.filter(key => key.startsWith('@quickreflex:'));
      
      // Remove all app-related data
      await AsyncStorage.multiRemove(quickReflexKeys);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Generic storage methods for theme preferences and other settings
  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`@quickreflex:${key}`);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`@quickreflex:${key}`, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`@quickreflex:${key}`);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }
}