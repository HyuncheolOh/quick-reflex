import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Share } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { GameResult } from "../../components/game";
import { Button, Card } from "../../components/common";
import { SPACING, TYPOGRAPHY } from "../../constants";
import { MainStackParamList, GameSession } from "../../types";
import { GameStorageService } from "../../services/storage";
import { StatisticsUtils, GameLogic } from "../../utils";
import { useThemedColors } from "../../hooks";
import { useLocalization } from "../../contexts";

type ResultScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, "Result">;
  route: RouteProp<MainStackParamList, "Result">;
};

export const ResultScreen: React.FC<ResultScreenProps> = ({
  navigation,
  route,
}) => {
  const { gameSession } = route.params;
  const colors = useThemedColors();
  const { t } = useLocalization();
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [previousAverage, setPreviousAverage] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [insights, setInsights] = useState<Array<{ key: string; params: any }>>(
    []
  );

  useEffect(() => {
    loadComparisonData();
  }, []);

  const loadComparisonData = async () => {
    try {
      // Get personal best
      const best = await GameStorageService.getPersonalBest();
      setPersonalBest(best);

      // Check if this is a new record (only if game wasn't failed and has valid attempts)
      if (
        best &&
        !gameSession.isFailed &&
        gameSession.statistics.validAttempts > 0 &&
        gameSession.statistics.bestTime < best
      ) {
        setIsNewRecord(true);
      }

      // Get recent sessions for comparison
      const recentSessions = await GameStorageService.getGameHistory(10);
      const previousSessions = recentSessions.slice(1); // Exclude current session

      if (previousSessions.length > 0) {
        const previousSession = previousSessions[0];
        setPreviousAverage(previousSession.statistics.averageTime);
      }

      // Get insights
      const sessionInsights =
        StatisticsUtils.getProgressInsights(recentSessions);
      setInsights(sessionInsights);
    } catch (error) {
      console.error("Error loading comparison data:", error);
    }
  };

  const playAgain = () => {
    navigation.navigate("TapTest");
  };

  const goToHome = () => {
    navigation.navigate("GameList");
  };

  const shareResult = async () => {
    try {
      const performance = GameLogic.getPerformanceRating(
        gameSession.statistics.averageTime,
        gameSession.statistics.validAttempts > 0
      );
      const accuracy =
        gameSession.statistics.totalAttempts > 0
          ? Math.round(
              (gameSession.statistics.validAttempts /
                gameSession.statistics.totalAttempts) *
                100
            )
          : 0;
      const shareText =
        `${t.share.resultTitle}\n\n` +
        `${t.share.averageTime}: ${GameLogic.formatTime(
          gameSession.statistics.averageTime
        )}\n` +
        `${t.share.bestTime}: ${GameLogic.formatTime(
          gameSession.statistics.bestTime
        )}\n` +
        `${t.share.accuracy}: ${accuracy}%\n\n` +
        `${t.game[performance.message as keyof typeof t.game]} 🎉\n\n` +
        `${t.share.challenge}`;

      await Share.share({
        message: shareText,
        title: t.share.title,
      });
    } catch (error) {
      console.error("Error sharing result:", error);
      Alert.alert(t.common.error, t.messages.shareError);
    }
  };

  const renderComparisonCard = () => {
    const improvements: string[] = [];
    const declines: string[] = [];

    // Only show comparisons if current game was successful (not failed and has valid attempts)
    if (!gameSession.isFailed && gameSession.statistics.validAttempts > 0) {
      if (personalBest && gameSession.statistics.bestTime < personalBest) {
        const improvement = personalBest - gameSession.statistics.bestTime;
        improvements.push(
          t.results.improvement(GameLogic.formatTime(improvement))
        );
      }

      if (
        previousAverage &&
        previousAverage > 0 &&
        gameSession.statistics.averageTime > 0
      ) {
        const diff = previousAverage - gameSession.statistics.averageTime;
        if (Math.abs(diff) > 10) {
          // Only show if significant difference
          if (diff > 0) {
            improvements.push(
              t.results.averageImprovement(GameLogic.formatTime(diff))
            );
          } else {
            declines.push(
              t.results.averageDecline(GameLogic.formatTime(Math.abs(diff)))
            );
          }
        }
      }
    }

    if (improvements.length === 0 && declines.length === 0) {
      return null;
    }

    return (
      <Card style={styles.comparisonCard}>
        <Text style={[styles.comparisonTitle, { color: colors.TEXT_PRIMARY }]}>
          {t.results.comparison}
        </Text>

        {improvements.map((improvement, index) => (
          <View key={`improvement-${index}`} style={styles.comparisonItem}>
            <Text style={styles.improvementIcon}>📈</Text>
            <Text style={[styles.comparisonText, { color: colors.SUCCESS }]}>
              {improvement}
            </Text>
          </View>
        ))}

        {declines.map((decline, index) => (
          <View key={`decline-${index}`} style={styles.comparisonItem}>
            <Text style={styles.declineIcon}>📉</Text>
            <Text style={[styles.comparisonText, { color: colors.WARNING }]}>
              {decline}
            </Text>
          </View>
        ))}
      </Card>
    );
  };

  const renderInsightsCard = () => {
    // Don't show insights for failed games
    if (insights.length === 0 || gameSession.isFailed) return null;

    return (
      <Card style={styles.insightsCard}>
        <Text style={[styles.insightsTitle, { color: colors.TEXT_PRIMARY }]}>
          {t.results.insights}
        </Text>
        {insights.map((insight, index) => {
          const insightText = insight.params
            ? (
                t.statistics.insights[
                  insight.key as keyof typeof t.statistics.insights
                ] as Function
              )(insight.params.percentage || insight.params)
            : (t.statistics.insights[
                insight.key as keyof typeof t.statistics.insights
              ] as string);

          return (
            <View key={index} style={styles.insightItem}>
              <Text style={[styles.insightBullet, { color: colors.PRIMARY }]}>
                •
              </Text>
              <Text
                style={[styles.insightText, { color: colors.TEXT_SECONDARY }]}
              >
                {insightText}
              </Text>
            </View>
          );
        })}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: colors.TEXT_TERTIARY }]}
        >
          <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
            {t.results.gameComplete}
          </Text>
          {isNewRecord && (
            <View
              style={[
                styles.newRecordBadge,
                { backgroundColor: colors.SUCCESS },
              ]}
            >
              <Text
                style={[styles.newRecordText, { color: colors.TEXT_PRIMARY }]}
              >
                {t.results.newRecord}
              </Text>
            </View>
          )}
        </View>

        {/* Main Results */}
        <View style={styles.resultsContainer}>
          <GameResult
            statistics={gameSession.statistics}
            attempts={gameSession.attempts}
            showDetailedResults={true}
          />
        </View>

        {/* Comparison with previous results */}
        {renderComparisonCard()}

        {/* Insights */}
        {renderInsightsCard()}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={t.results.playAgain}
            onPress={playAgain}
            style={styles.primaryButton}
            textStyle={{ color: colors.TEXT_WHITE }}
          />

          <View style={styles.secondaryButtonRow}>
            <Button
              title={t.results.shareResult}
              onPress={shareResult}
              variant="ghost"
              style={styles.secondaryButton}
            />
            <Button
              title={t.results.goHome}
              onPress={goToHome}
              variant="ghost"
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    padding: SPACING.LG,
    alignItems: "center",
    borderBottomWidth: 1,
  },

  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    marginBottom: SPACING.SM,
  },

  newRecordBadge: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: 20,
  },

  newRecordText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },

  resultsContainer: {
    padding: SPACING.LG,
  },

  comparisonCard: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },

  comparisonTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.MD,
  },

  comparisonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.SM,
  },

  improvementIcon: {
    marginRight: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
  },

  declineIcon: {
    marginRight: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
  },

  comparisonText: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },

  // Colors will be applied dynamically

  insightsCard: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },

  insightsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.MD,
  },

  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.SM,
  },

  insightBullet: {
    marginRight: SPACING.SM,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },

  insightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    lineHeight: 18,
  },

  buttonContainer: {
    padding: SPACING.LG,
    paddingBottom: SPACING.XXL,
  },

  primaryButton: {
    marginBottom: SPACING.MD,
  },

  secondaryButtonRow: {
    flexDirection: "row",
    gap: SPACING.MD,
  },

  secondaryButton: {
    flex: 1,
  },
});
