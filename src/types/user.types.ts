export interface UserProfile {
  id: string;
  nickname?: string;
  createdAt: number;
  onboardingCompleted: boolean;
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