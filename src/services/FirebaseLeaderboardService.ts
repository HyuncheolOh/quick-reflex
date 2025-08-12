import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import {
  LeaderboardEntry,
  LeaderboardResponse,
  SubmitScoreResponse,
  GameType,
  UserLeaderboardStats,
} from '../types';
import { UserIdentityService } from './UserIdentityService';

class FirebaseLeaderboardService {
  private static readonly COLLECTION_NAME = 'leaderboard';
  private static readonly USER_STATS_COLLECTION = 'user_stats';

  /**
   * Submit score to Firebase Firestore
   */
  static async submitScore(
    gameType: GameType,
    sessionData: {
      bestTime: number;
      averageTime: number;
      gamesPlayed: number;
      accuracy: number;
      attempts: any[];
      statistics: any;
    }
  ): Promise<SubmitScoreResponse> {
    try {
      console.log('FirebaseLeaderboardService.submitScore called with:', { gameType, sessionData });
      
      const userIdentity = await UserIdentityService.getUserIdentity();
      console.log('User identity:', userIdentity);
      
      if (!userIdentity.isOptedIn || !userIdentity.nickname) {
        const error = 'User not opted in to leaderboard or nickname not set';
        console.log('Submission blocked:', error);
        throw new Error(error);
      }

      const entryId = `${userIdentity.uuid}_${gameType}`;
      console.log('Creating document with ID:', entryId);
      
      const docRef = doc(db, this.COLLECTION_NAME, entryId);
      
      // Get existing entry to check if this is an improvement
      console.log('Checking for existing entry...');
      const existingDoc = await getDoc(docRef);
      const existingData = existingDoc.data() as LeaderboardEntry | undefined;
      
      console.log('Existing data:', existingData);
      console.log('New best time:', sessionData.bestTime);
      
      // Only update if this is a new best time or first entry
      if (!existingData || sessionData.bestTime < existingData.bestTime) {
        console.log('Submitting new/improved score...');
        const leaderboardEntry: Omit<LeaderboardEntry, 'id' | 'rank'> = {
          userId: userIdentity.uuid,
          nickname: userIdentity.nickname,
          gameType,
          bestTime: sessionData.bestTime,
          averageTime: sessionData.averageTime,
          gamesPlayed: sessionData.gamesPlayed,
          accuracy: sessionData.accuracy,
          timestamp: Date.now(),
        };

        console.log('Saving to Firestore:', leaderboardEntry);
        
        await setDoc(docRef, {
          ...leaderboardEntry,
          updatedAt: serverTimestamp(),
        });

        console.log('Successfully saved to Firestore');

        // Update user stats
        console.log('Updating user stats...');
        await this.updateUserStats(userIdentity.uuid, gameType, leaderboardEntry);

        // Calculate rank
        console.log('Calculating rank...');
        const rank = await this.calculateRank(gameType, sessionData.bestTime);
        console.log('Calculated rank:', rank);

        const result = {
          success: true,
          rank,
          isNewRecord: !existingData || sessionData.bestTime < existingData.bestTime,
          message: rank <= 100 ? 'Score submitted successfully!' : 'Score recorded but not in top 100',
        };
        
        console.log('Returning result:', result);
        return result;
      }

      return {
        success: false,
        rank: existingData ? await this.calculateRank(gameType, existingData.bestTime) : null,
        isNewRecord: false,
        message: 'Not a new personal best',
      };
    } catch (error) {
      console.error('Error submitting score to Firebase:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard from Firestore
   */
  static async getLeaderboard(
    gameType: GameType,
    limitCount: number = 100
  ): Promise<LeaderboardResponse> {
    try {
      const userIdentity = await UserIdentityService.getUserIdentity();
      
      // Query top players
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('gameType', '==', gameType),
        orderBy('bestTime', 'asc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          ...data,
          rank: index + 1,
        } as LeaderboardEntry);
      });

      // Get user stats if logged in
      let userStats: UserLeaderboardStats | null = null;
      if (userIdentity.uuid && userIdentity.nickname) {
        userStats = await this.getUserStats(gameType);
      }

      // Get total user count
      const allPlayersQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('gameType', '==', gameType)
      );
      const allPlayersSnapshot = await getDocs(allPlayersQuery);
      const totalUsers = allPlayersSnapshot.size;

      return {
        entries,
        userStats,
        totalUsers,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching leaderboard from Firebase:', error);
      // Fallback to mock data if Firebase fails
      return this.getMockLeaderboard(gameType);
    }
  }

  /**
   * Get user's leaderboard statistics
   */
  static async getUserStats(gameType: GameType): Promise<UserLeaderboardStats | null> {
    try {
      const userIdentity = await UserIdentityService.getUserIdentity();
      
      if (!userIdentity.uuid) {
        return null;
      }

      const statsId = `${userIdentity.uuid}_${gameType}`;
      const statsDoc = await getDoc(doc(db, this.USER_STATS_COLLECTION, statsId));
      
      if (!statsDoc.exists()) {
        return null;
      }

      const data = statsDoc.data();
      const currentRank = await this.calculateRank(gameType, data.bestTime);

      return {
        userId: userIdentity.uuid,
        nickname: userIdentity.nickname || 'Unknown',
        bestRank: data.bestRank || currentRank,
        currentRank,
        totalGamesPlayed: data.totalGamesPlayed || 0,
        bestTime: data.bestTime,
        averageTime: data.averageTime,
        accuracy: data.accuracy,
      };
    } catch (error) {
      console.error('Error fetching user stats from Firebase:', error);
      return null;
    }
  }

  /**
   * Update user statistics
   */
  private static async updateUserStats(
    userId: string,
    gameType: GameType,
    entry: Omit<LeaderboardEntry, 'id' | 'rank'>
  ): Promise<void> {
    try {
      const statsId = `${userId}_${gameType}`;
      const statsRef = doc(db, this.USER_STATS_COLLECTION, statsId);
      const existingStats = await getDoc(statsRef);
      
      const currentRank = await this.calculateRank(gameType, entry.bestTime);
      
      if (existingStats.exists()) {
        const data = existingStats.data();
        await setDoc(statsRef, {
          ...entry,
          bestRank: Math.min(data.bestRank || currentRank, currentRank),
          totalGamesPlayed: (data.totalGamesPlayed || 0) + entry.gamesPlayed,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(statsRef, {
          ...entry,
          bestRank: currentRank,
          totalGamesPlayed: entry.gamesPlayed,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  /**
   * Calculate rank for a given score
   */
  private static async calculateRank(
    gameType: GameType,
    bestTime: number
  ): Promise<number> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('gameType', '==', gameType),
        where('bestTime', '<', bestTime)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size + 1;
    } catch (error) {
      console.error('Error calculating rank:', error);
      return 0;
    }
  }

  /**
   * Check if score qualifies for leaderboard (top 100)
   */
  static async checkScoreQualification(
    gameType: GameType,
    bestTime: number
  ): Promise<{ qualifies: boolean; estimatedRank?: number }> {
    try {
      const rank = await this.calculateRank(gameType, bestTime);
      return {
        qualifies: rank <= 100,
        estimatedRank: rank,
      };
    } catch (error) {
      console.error('Error checking score qualification:', error);
      return { qualifies: false };
    }
  }

  /**
   * Mock implementation for development/offline mode
   */
  static async getMockLeaderboard(gameType: GameType): Promise<LeaderboardResponse> {
    // Generate mock data for development
    const mockEntries: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
      id: `mock-${i}`,
      userId: `user-${i}`,
      nickname: `Player ${i + 1}`,
      gameType,
      bestTime: 200 + i * 50 + Math.random() * 100,
      averageTime: 250 + i * 60 + Math.random() * 120,
      gamesPlayed: Math.floor(Math.random() * 50) + 10,
      accuracy: Math.floor(Math.random() * 30) + 70,
      timestamp: Date.now() - i * 86400000, // days ago
      rank: i + 1,
    }));

    const userIdentity = await UserIdentityService.getUserIdentity();
    const userStats: UserLeaderboardStats | null = userIdentity.nickname ? {
      userId: userIdentity.uuid,
      nickname: userIdentity.nickname,
      bestRank: 15,
      currentRank: 25,
      totalGamesPlayed: 45,
      bestTime: 380,
      averageTime: 420,
      accuracy: 82,
    } : null;

    return {
      entries: mockEntries,
      userStats,
      totalUsers: 1500,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Check if Firebase is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Try to access Firestore
      const testQuery = query(
        collection(db, this.COLLECTION_NAME),
        limit(1)
      );
      await getDocs(testQuery);
      return true;
    } catch (error) {
      console.error('Firebase is not available:', error);
      return false;
    }
  }
}

export { FirebaseLeaderboardService };