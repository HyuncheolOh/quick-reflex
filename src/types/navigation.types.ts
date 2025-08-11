import { GameSession } from './game.types';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type OnboardingStackParamList = {
  Splash: undefined;
  Tutorial: undefined;
  FirstGame: undefined;
};

export type MainStackParamList = {
  GameList: undefined;
  TapTest: undefined;
  Result: {
    gameSession: GameSession;
  };
  Settings: undefined;
};