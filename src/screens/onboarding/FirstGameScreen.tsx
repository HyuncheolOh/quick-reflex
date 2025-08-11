import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { TapButton, CountdownTimer, GameResult } from '../../components/game';
import { Button } from '../../components/common';
import { SPACING, TYPOGRAPHY, GAME_CONFIG } from '../../constants';
import { OnboardingStackParamList, GameState, ReactionAttempt, TapGameState } from '../../types';
import { GameLogic } from '../../utils';
import { LocalStorageService, GameStorageService } from '../../services/storage';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

type FirstGameScreenProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'FirstGame'>;
};

export const FirstGameScreen: React.FC<FirstGameScreenProps> = ({ navigation }) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  const [gameState, setGameState] = useState<TapGameState>({
    currentState: GameState.IDLE,
    currentRound: 0,
    totalRounds: 3, // Shortened for first game
    waitStartTime: 0,
    readyStartTime: 0,
    results: [],
    randomDelay: 0,
  });
  
  const [attempts, setAttempts] = useState<ReactionAttempt[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstGame = useRef(true);

  useEffect(() => {
    // Set initial message
    setMessage(t.game.tapToStart);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [t]);

  const startGame = () => {
    if (gameState.currentState === GameState.IDLE) {
      setGameState(prev => ({
        ...prev,
        currentState: GameState.COUNTDOWN,
        currentRound: 0,
      }));
      setAttempts([]);
      setMessage(t.game.getReady);
    }
  };

  const onCountdownComplete = () => {
    startRound();
  };

  const startRound = () => {
    const delay = GameLogic.generateRandomDelay();
    
    setGameState(prev => ({
      ...prev,
      currentState: GameState.WAITING,
      waitStartTime: Date.now(),
      randomDelay: delay,
    }));
    
    setMessage(t.game.waitForGreen);

    timeoutRef.current = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        currentState: GameState.READY,
        readyStartTime: Date.now(),
      }));
      setMessage(t.game.tapNow);

      // Auto timeout after ready state
      timeoutRef.current = setTimeout(() => {
        handleTimeout();
      }, GAME_CONFIG.READY_TIMEOUT);
    }, delay);
  };

  const handleTap = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const now = Date.now();

    switch (gameState.currentState) {
      case GameState.IDLE:
        startGame();
        break;

      case GameState.COUNTDOWN:
        // Ignore taps during countdown
        break;

      case GameState.WAITING:
        // Too early - failed attempt
        const failedAttempt = GameLogic.createAttempt(
          gameState.currentRound + 1,
          0,
          false
        );
        
        setAttempts(prev => [...prev, failedAttempt]);
        setMessage(t.game.tooEarly);
        
        setTimeout(() => {
          nextRound();
        }, 1000);
        break;

      case GameState.READY:
        // Successful tap
        const reactionTime = now - gameState.readyStartTime!;
        const isValid = GameLogic.validateReactionTime(reactionTime);
        
        const attempt = GameLogic.createAttempt(
          gameState.currentRound + 1,
          reactionTime,
          isValid
        );
        
        setAttempts(prev => [...prev, attempt]);
        setMessage(isValid ? 
          `${GameLogic.formatTime(reactionTime)}!` : 
          t.game.tooEarly
        );
        
        setTimeout(() => {
          nextRound();
        }, 1000);
        break;

      case GameState.GAME_COMPLETE:
        finishOnboarding();
        break;
    }
  };

  const handleTimeout = () => {
    const timeoutAttempt = GameLogic.createAttempt(
      gameState.currentRound + 1,
      GAME_CONFIG.READY_TIMEOUT,
      false
    );
    
    setAttempts(prev => [...prev, timeoutAttempt]);
    setMessage(t.game.tooSlow);
    
    setTimeout(() => {
      nextRound();
    }, 1000);
  };

  const nextRound = () => {
    const newRound = gameState.currentRound + 1;
    
    if (newRound >= gameState.totalRounds) {
      completeGame();
    } else {
      setGameState(prev => ({
        ...prev,
        currentState: GameState.ROUND_COMPLETE,
        currentRound: newRound,
      }));
      
      setTimeout(() => {
        startRound();
      }, 1000);
    }
  };

  const completeGame = async () => {
    setGameState(prev => ({
      ...prev,
      currentState: GameState.GAME_COMPLETE,
    }));
    
    setMessage(t.game.gameComplete);
    
    try {
      // Save the first game session
      await GameStorageService.saveGameSession(
        'TAP_TEST',
        attempts,
        true,
        false
      );
      
      setShowResult(true);
    } catch (error) {
      console.error('Error saving first game:', error);
      setShowResult(true);
    }
  };

  const finishOnboarding = async () => {
    try {
      // Create initial user profile
      const userProfile = {
        id: `user_${Date.now()}`,
        createdAt: Date.now(),
        onboardingCompleted: true,
        preferences: {
          soundEnabled: true,
          vibrationEnabled: true,
        },
      };

      await LocalStorageService.setUserProfile(userProfile);
      await LocalStorageService.setOnboardingCompleted(true);

      Alert.alert(
        t.onboarding.firstGame.congratulations,
        t.onboarding.firstGame.message,
        [
          {
            text: t.onboarding.firstGame.gameStart,
            onPress: () => {
              // Navigate to main app
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                })
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      Alert.alert(t.common.error, t.onboarding.firstGame.error);
    }
  };

  const statistics = GameLogic.calculateStatistics(attempts);

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.TEXT_TERTIARY }]}>
        <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>{t.onboarding.firstGame.title}</Text>
        <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
          {gameState.currentRound + 1}/{gameState.totalRounds} {t.game.round}
        </Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {gameState.currentState === GameState.COUNTDOWN ? (
          <CountdownTimer
            duration={GAME_CONFIG.COUNTDOWN_DURATION}
            onComplete={onCountdownComplete}
          />
        ) : showResult ? (
          <GameResult
            statistics={statistics}
            attempts={attempts}
            showDetailedResults={true}
          />
        ) : (
          <TapButton
            gameState={gameState.currentState}
            onPress={handleTap}
            message={message}
            disabled={false}
          />
        )}
      </View>

      {/* Footer */}
      {showResult && (
        <View style={styles.footer}>
          <Text style={[styles.encouragement, { color: colors.SUCCESS }]}>
            {isFirstGame.current ? t.onboarding.firstGame.encouragement.first : t.onboarding.firstGame.encouragement.normal}
          </Text>
          <Button
            title={t.onboarding.firstGame.complete}
            onPress={finishOnboarding}
            style={styles.finishButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    padding: SPACING.LG,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    marginBottom: SPACING.XS,
  },
  
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
  },
  
  gameArea: {
    flex: 1,
  },
  
  footer: {
    padding: SPACING.LG,
    alignItems: 'center',
  },
  
  encouragement: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },
  
  finishButton: {
    minWidth: 200,
  },
});