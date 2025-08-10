import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, BackHandler } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TapButton, CountdownTimer } from "../../components/game";
import { Button, ConfirmModal } from "../../components/common";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  GAME_CONFIG,
  GAME_MESSAGES,
} from "../../constants";
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
  const [message, setMessage] = useState<string>(GAME_MESSAGES.TAP_TO_START);
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
    // 컴포넌트가 언마운트될 때 타이머를 정리합니다.
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
      setMessage(GAME_MESSAGES.GET_READY);
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
    setMessage(GAME_MESSAGES.TOO_SLOW);

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

    setMessage(GAME_MESSAGES.WAIT_FOR_GREEN);

    // 먼저 이전 타이머를 모두 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // WAITING -> READY로 전환하는 타이머
    timeoutRef.current = setTimeout(() => {
      if (isPaused) {
        console.log("타이머 중단: 게임이 일시정지됨");
        return;
      }

      const now = Date.now();
      console.log("READY 상태로 전환 시도:", {
        currentState: gameState.currentState,
        timestamp: now,
        isPaused,
      });

      // READY 상태로 전환
      setGameState((prev) => {
        console.log("상태 업데이트:", prev.currentState, "->", GameState.READY);
        return {
          ...prev,
          currentState: GameState.READY,
          readyStartTime: now,
        };
      });

      console.log("메시지 변경:", GAME_MESSAGES.TAP_NOW);
      setMessage(GAME_MESSAGES.TAP_NOW);

      // READY 상태에서 반응 대기 타이머
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        console.log("타임아웃 발생 - 게임 종료");
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
        // Too early - game over
        const failedAttempt = GameLogic.createAttempt(
          gameState.currentRound + 1,
          0,
          false
        );

        setAttempts((prev) => [...prev, failedAttempt]);
        setGameState((prev) => ({ ...prev, currentState: GameState.FAILED }));
        setMessage(GAME_MESSAGES.TOO_EARLY);

        setTimeout(() => {
          nextRound();
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
            ? `훌륭해요! ${GameLogic.formatTime(reactionTime)}`
            : GAME_MESSAGES.TOO_EARLY
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
        // 다음 렌더링 사이클에서 completeGame 호출
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

        setMessage(`라운드 ${newRound + 1} 준비...`);

        setTimeout(() => {
          if (!isPaused) {
            startRound();
          }
        }, GAME_CONFIG.ROUND_DELAY);
      }

      return currentAttempts; // attempts 상태는 변경하지 않음
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

      setMessage(GAME_MESSAGES.GAME_COMPLETE);

      // 비동기 작업을 별도로 처리
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

      return currentAttempts; // attempts 상태는 변경하지 않음
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

  const getProgressPercentage = () => {
    // attempts 상태가 업데이트되면 자동으로 재계산됨
    return (attempts.length / gameState.totalRounds) * 100;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage()}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {attempts.length}/{gameState.totalRounds}
          </Text>
        </View>

        {gameState.currentState !== GameState.IDLE &&
          gameState.currentState !== GameState.GAME_COMPLETE && (
            <Button
              title={isPaused ? "계속" : "일시정지"}
              onPress={isPaused ? resumeGame : pauseGame}
              variant="ghost"
              size="small"
            />
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
            message={
              isPaused ? "일시정지됨\n위에서 계속 버튼을 눌러주세요" : message
            }
            disabled={isPaused}
          />
        )}
      </View>

      {/* Quick Stats */}
      {attempts.length > 0 && (
        <View style={styles.quickStats}>
          <Text style={styles.quickStatsTitle}>현재 진행상황</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              성공: {attempts.filter((a) => a.isValid).length}
            </Text>
            <Text style={styles.statText}>
              실패: {attempts.filter((a) => !a.isValid).length}
            </Text>
            {attempts.filter((a) => a.isValid).length > 0 && (
              <Text style={styles.statText}>
                평균:{" "}
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
        onClose={() => setShowExitModal(false)}
        onConfirm={exitGame}
        title="게임 종료"
        message="진행 중인 게임이 저장되지 않고 종료됩니다.\n정말로 나가시겠습니까?"
        confirmText="나가기"
        variant="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.TEXT_TERTIARY,
  },

  progressContainer: {
    flex: 1,
    marginRight: SPACING.MD,
    alignItems: "center",
  },

  progressBackground: {
    height: 8,
    backgroundColor: COLORS.TEXT_TERTIARY,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: SPACING.XS,
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
  },

  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    textAlign: "center",
  },

  gameArea: {
    flex: 1,
  },

  quickStats: {
    padding: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: COLORS.TEXT_TERTIARY,
    alignItems: "center",
  },

  quickStatsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
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
    color: COLORS.TEXT_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },
});
