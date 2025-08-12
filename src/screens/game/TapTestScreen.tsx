import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, BackHandler } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TapButton, CountdownTimer } from "../../components/game";
import { Button, ConfirmModal } from "../../components/common";
import { SPACING, TYPOGRAPHY, GAME_CONFIG } from "../../constants";
import { useThemedColors } from "../../hooks";
import { useLocalization } from "../../contexts";
import {
  MainStackParamList,
  GameState,
  ReactionAttempt,
  TapGameState,
} from "../../types";
import { GameLogic } from "../../utils";
import { GameStorageService } from "../../services/storage";

type TapTestScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, "TapTest">;
};

export const TapTestScreen: React.FC<TapTestScreenProps> = ({ navigation }) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  const [gameState, setGameState] = useState<TapGameState>({
    currentState: GameState.IDLE,
    currentRound: 0,
    totalRounds: GAME_CONFIG.TOTAL_ROUNDS,
    waitStartTime: 0,
    readyStartTime: 0,
    results: [],
    randomDelay: 0,
  });

  const [attempts, setAttempts] = useState<ReactionAttempt[]>([]);
  const [message, setMessage] = useState<string>("");
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
    };
  }, [gameState.currentState]);

  useEffect(() => {
    // Set initial message
    setMessage(t.game.tapToStart);
  }, [t]);

  useEffect(() => {
    // Clean up timers when component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleBackPress = (): boolean => {
    if (
      gameState.currentState === GameState.IDLE ||
      gameState.currentState === GameState.GAME_COMPLETE
    ) {
      return false; // Allow default back behavior
    }

    // Pause the game when back is pressed during gameplay
    pauseGame();
    setShowExitModal(true);
    return true; // Prevent default back behavior
  };

  const startGame = () => {
    if (gameState.currentState === GameState.IDLE) {
      setGameState((prev) => ({
        ...prev,
        currentState: GameState.COUNTDOWN,
        currentRound: 0,
      }));
      setAttempts([]);
      setMessage(t.game.getReady);
      setIsPaused(false);
    }
  };

  const pauseGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPaused(true);
  };

  const resumeGame = () => {
    setIsPaused(false);
    if (
      gameState.currentState === GameState.WAITING ||
      gameState.currentState === GameState.READY
    ) {
      startRound();
    }
  };

  const onCountdownComplete = () => {
    startRound();
  };

  const handleTimeout = () => {
    const timeoutAttempt = GameLogic.createAttempt(
      gameState.currentRound + 1,
      GAME_CONFIG.READY_TIMEOUT,
      false
    );

    console.log("timeout", timeoutAttempt);

    setAttempts((prev) => {
      const newAttempts = [...prev, timeoutAttempt];
      console.log("timeout", newAttempts);
      return newAttempts;
    });

    setGameState((prev) => ({ ...prev, currentState: GameState.FAILED }));
    setMessage(t.game.tooSlow);

    setTimeout(() => {
      nextRound();
    }, GAME_CONFIG.RESULT_DISPLAY_TIME);
  };

  const startRound = () => {
    if (isPaused) return;

    const delay = GameLogic.generateRandomDelay();

    setGameState((prev) => ({
      ...prev,
      currentState: GameState.WAITING,
      waitStartTime: Date.now(),
      randomDelay: delay,
    }));

    setMessage(t.game.waitForGreen);

    // Clear previous timers first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Timer to switch from WAITING to READY
    timeoutRef.current = setTimeout(() => {
      if (isPaused) {
        console.log("Timer interrupted: Game is paused");
        return;
      }

      const now = Date.now();
      console.log("Attempting to switch to READY state:", {
        currentState: gameState.currentState,
        timestamp: now,
        isPaused,
      });

      // Switch to READY state
      setGameState((prev) => {
        console.log("State update:", prev.currentState, "->", GameState.READY);
        return {
          ...prev,
          currentState: GameState.READY,
          readyStartTime: now,
        };
      });

      console.log("Message changed:", t.game.tapNow);
      setMessage(t.game.tapNow);

      // Timer waiting for reaction in READY state
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        console.log("Timeout occurred - Game ended");
        handleTimeout();
      }, GAME_CONFIG.READY_TIMEOUT);
    }, delay);
  };

  const handleTap = () => {
    if (isPaused) return;

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
        // Too early - end game immediately
        const failedAttempt = GameLogic.createAttempt(
          gameState.currentRound + 1,
          0,
          false
        );

        setAttempts((prev) => [...prev, failedAttempt]);
        setGameState((prev) => ({ ...prev, currentState: GameState.FAILED }));
        setMessage(t.game.tooEarly);

        setTimeout(() => {
          completeGame();
        }, GAME_CONFIG.RESULT_DISPLAY_TIME);
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

        setAttempts((prev) => [...prev, attempt]);
        setGameState((prev) => ({
          ...prev,
          currentState: GameState.TAP_DETECTED,
        }));
        setMessage(
          isValid
            ? t.game.excellentReaction(GameLogic.formatTime(reactionTime))
            : t.game.tooEarly
        );

        setTimeout(() => {
          nextRound();
        }, GAME_CONFIG.RESULT_DISPLAY_TIME);
        break;

      case GameState.GAME_COMPLETE:
      case GameState.FAILED:
        // Navigate to results
        navigateToResults();
        break;
    }
  };

  const nextRound = () => {
    setAttempts((currentAttempts) => {
      const totalAttempts = currentAttempts.length;
      console.log(
        "totalAttempts / totalRounds",
        totalAttempts,
        gameState.totalRounds
      );

      if (totalAttempts >= gameState.totalRounds) {
        // Call completeGame in the next render cycle
        setTimeout(() => {
          completeGame();
        }, 0);
      } else {
        const newRound = totalAttempts;

        setGameState((prev) => ({
          ...prev,
          currentState: GameState.ROUND_COMPLETE,
          currentRound: newRound,
        }));

        setMessage(t.game.roundReady(newRound + 1));

        setTimeout(() => {
          if (!isPaused) {
            startRound();
          }
        }, GAME_CONFIG.ROUND_DELAY);
      }

      return currentAttempts; // Don't modify attempts state
    });
  };

  const completeGame = async () => {
    setAttempts((currentAttempts) => {
      const successfulAttempts = currentAttempts.filter(
        (a) => a.isValid
      ).length;
      const finalState =
        successfulAttempts === 0 ? GameState.FAILED : GameState.GAME_COMPLETE;

      setGameState((prev) => ({
        ...prev,
        currentState: finalState,
      }));

      setMessage(t.game.gameComplete);

      // Handle async operations separately
      (async () => {
        try {
          const gameSession = await GameStorageService.saveGameSession(
            "TAP_TEST",
            currentAttempts,
            true,
            successfulAttempts === 0
          );

          setTimeout(() => {
            navigateToResults(gameSession);
          }, 2000);
        } catch (error) {
          console.error("Error saving game session:", error);
          setTimeout(() => {
            navigateToResults();
          }, 2000);
        }
      })();

      return currentAttempts; // Don't modify attempts state
    });
  };

  const navigateToResults = (gameSession?: any) => {
    if (gameSession) {
      navigation.navigate("Result", { gameSession });
    } else {
      // Create temporary session for navigation
      setAttempts((currentAttempts) => {
        const tempSession = {
          id: "temp",
          gameType: "TAP_TEST" as const,
          userId: "temp",
          timestamp: Date.now(),
          attempts: currentAttempts,
          statistics: GameLogic.calculateStatistics(currentAttempts),
          isCompleted: true,
          isFailed: currentAttempts.every((a) => !a.isValid),
        };
        navigation.navigate("Result", { gameSession: tempSession });
        return currentAttempts;
      });
    }
  };

  const exitGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    navigation.goBack();
  };

  const stopGame = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setShowExitModal(false);

    // Save incomplete game session
    try {
      const gameSession = await GameStorageService.saveGameSession(
        "TAP_TEST",
        attempts,
        false, // Game not completed
        true // Game was stopped/failed
      );

      // Navigate to results with the stopped game session
      navigation.navigate("Result", { gameSession });
    } catch (error) {
      console.error("Error saving incomplete game session:", error);
      // Create temporary session for navigation if save fails
      const tempSession = {
        id: "temp",
        gameType: "TAP_TEST" as const,
        userId: "temp",
        timestamp: Date.now(),
        attempts: attempts,
        statistics: GameLogic.calculateStatistics(attempts),
        isCompleted: false,
        isFailed: true,
      };
      navigation.navigate("Result", { gameSession: tempSession });
    }
  };

  const getProgressPercentage = () => {
    // Automatically recalculated when attempts state is updated
    return (attempts.length / gameState.totalRounds) * 100;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: colors.TEXT_TERTIARY }]}
      >
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBackground,
              { backgroundColor: colors.TEXT_TERTIARY },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: colors.PRIMARY,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.TEXT_PRIMARY }]}>
            {attempts.length}/{gameState.totalRounds}
          </Text>
        </View>

        {gameState.currentState !== GameState.IDLE &&
          gameState.currentState !== GameState.GAME_COMPLETE && (
            <View style={styles.controlButtons}>
              <Button
                title={isPaused ? t.game.resume : t.game.pause}
                onPress={isPaused ? resumeGame : pauseGame}
                variant="ghost"
                size="small"
                style={styles.controlButton}
              />
              <Button
                title={t.game.stop}
                onPress={() => setShowExitModal(true)}
                variant="ghost"
                size="small"
                style={styles.controlButton}
                textStyle={{ color: colors.TEXT_RED }}
              />
            </View>
          )}
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {gameState.currentState === GameState.COUNTDOWN ? (
          <CountdownTimer
            duration={GAME_CONFIG.COUNTDOWN_DURATION}
            onComplete={onCountdownComplete}
          />
        ) : (
          <TapButton
            gameState={gameState.currentState}
            onPress={handleTap}
            message={isPaused ? t.game.pausedMessage : message}
            disabled={isPaused}
          />
        )}
      </View>

      {/* Quick Stats */}
      {attempts.length > 0 && (
        <View
          style={[styles.quickStats, { borderTopColor: colors.TEXT_TERTIARY }]}
        >
          <Text
            style={[styles.quickStatsTitle, { color: colors.TEXT_SECONDARY }]}
          >
            {t.game.currentProgress}
          </Text>
          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: colors.TEXT_PRIMARY }]}>
              {t.game.successful}: {attempts.filter((a) => a.isValid).length}
            </Text>
            <Text style={[styles.statText, { color: colors.TEXT_PRIMARY }]}>
              {t.game.failed}: {attempts.filter((a) => !a.isValid).length}
            </Text>
            {attempts.filter((a) => a.isValid).length > 0 && (
              <Text style={[styles.statText, { color: colors.TEXT_PRIMARY }]}>
                {t.game.average}:{" "}
                {GameLogic.formatTime(
                  GameLogic.calculateStatistics(attempts).averageTime
                )}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        visible={showExitModal}
        onClose={() => {
          setShowExitModal(false);
          if (isPaused) resumeGame(); // Resume if game was paused
        }}
        onConfirm={stopGame}
        title={t.modals.exitGame.title}
        message={t.modals.exitGame.message}
        confirmText={t.modals.exitGame.confirm}
        cancelText={t.modals.exitGame.cancel}
        variant="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.LG,
    borderBottomWidth: 1,
  },

  progressContainer: {
    flex: 1,
    marginRight: SPACING.MD,
    alignItems: "center",
  },

  progressBackground: {
    width: "100%",
    height: 10,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: SPACING.SM,
  },

  progressFill: {
    height: "100%",
    borderRadius: 8,
  },

  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  gameArea: {
    flex: 1,
  },

  quickStats: {
    padding: SPACING.LG,
    borderTopWidth: 1,
    alignItems: "center",
  },

  quickStatsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    marginBottom: SPACING.XS,
    textAlign: "center",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  statText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },

  controlButtons: {
    flexDirection: "row",
    gap: SPACING.SM,
  },

  controlButton: {
    minWidth: 60,
  },
});
