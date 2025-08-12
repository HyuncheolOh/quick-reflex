export interface UserProfile {
  id: string;
  uuid: string; // UUID for leaderboard identification
  nickname?: string;
  createdAt: number;
  onboardingCompleted: boolean;
  leaderboardOptIn: boolean; // User consent for leaderboard participation
  preferences: {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  statistics?: {
    totalGamesPlayed: number;
    bestReactionTime?: number;
    averageReactionTime?: number;
  };
}

export interface NicknameSetupData {
  nickname: string;
  consentToLeaderboard: boolean;
  dataRetentionAcknowledged: boolean;
}