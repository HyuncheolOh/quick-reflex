import { GameSession } from './game.types';
import { GameType } from './leaderboard.types';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type OnboardingStackParamList = {
  Splash: undefined;
  Tutorial: undefined;
  FirstGame: undefined;
  NicknameSetup: undefined;
};

export type MainStackParamList = {
  GameList: undefined;
  TapTest: undefined;
  Result: {
    gameSession: GameSession;
  };
  Settings: undefined;
  Leaderboard: {
    gameType: GameType;
  };
  LeaderboardList: undefined;
};