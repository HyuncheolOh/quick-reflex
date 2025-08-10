import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { GameResult } from '../../components/game';
import { Button, Card } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';
import { MainStackParamList, GameSession } from '../../types';
import { GameStorageService } from '../../services/storage';
import { StatisticsUtils, GameLogic } from '../../utils';

type ResultScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Result'>;
  route: RouteProp<MainStackParamList, 'Result'>;
};

export const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  const { gameSession } = route.params;
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [previousAverage, setPreviousAverage] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadComparisonData();
  }, []);

  const loadComparisonData = async () => {
    try {
      // Get personal best
      const best = await GameStorageService.getPersonalBest();
      setPersonalBest(best);

      // Check if this is a new record
      if (best && gameSession.statistics.bestTime < best) {
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
      const sessionInsights = StatisticsUtils.getProgressInsights(recentSessions);
      setInsights(sessionInsights);
    } catch (error) {
      console.error('Error loading comparison data:', error);
    }
  };

  const playAgain = () => {
    navigation.navigate('TapTest');
  };

  const goToHome = () => {
    navigation.navigate('GameList');
  };

  const shareResult = async () => {
    try {
      const performance = GameLogic.getPerformanceRating(
        gameSession.statistics.averageTime,
        gameSession.statistics.validAttempts > 0
      );
      const shareText = `QuickReflex 순발력 테스트 결과!\n\n` +
        `평균 반응시간: ${GameLogic.formatTime(gameSession.statistics.averageTime)}\n` +
        `최고 반응시간: ${GameLogic.formatTime(gameSession.statistics.bestTime)}\n` +
        `정확도: ${Math.round((gameSession.statistics.validAttempts / gameSession.statistics.totalAttempts) * 100)}%\n\n` +
        `${performance.message} 🎉\n\n` +
        `당신도 도전해보세요! #QuickReflex #순발력테스트`;

      await Share.share({
        message: shareText,
        title: 'QuickReflex 결과 공유',
      });
    } catch (error) {
      console.error('Error sharing result:', error);
      Alert.alert('오류', '결과 공유 중 오류가 발생했습니다.');
    }
  };

  const renderComparisonCard = () => {
    const improvements: string[] = [];
    const declines: string[] = [];

    if (personalBest && gameSession.statistics.bestTime < personalBest) {
      const improvement = personalBest - gameSession.statistics.bestTime;
      improvements.push(`최고 기록이 ${GameLogic.formatTime(improvement)} 향상됐어요!`);
    }

    if (previousAverage) {
      const diff = previousAverage - gameSession.statistics.averageTime;
      if (Math.abs(diff) > 10) { // Only show if significant difference
        if (diff > 0) {
          improvements.push(`평균 반응시간이 ${GameLogic.formatTime(diff)} 빨라졌어요!`);
        } else {
          declines.push(`평균 반응시간이 ${GameLogic.formatTime(Math.abs(diff))} 느려졌어요.`);
        }
      }
    }

    if (improvements.length === 0 && declines.length === 0) {
      return null;
    }

    return (
      <Card style={styles.comparisonCard}>
        <Text style={styles.comparisonTitle}>이전 기록과 비교</Text>
        
        {improvements.map((improvement, index) => (
          <View key={`improvement-${index}`} style={styles.comparisonItem}>
            <Text style={styles.improvementIcon}>📈</Text>
            <Text style={[styles.comparisonText, styles.improvementText]}>
              {improvement}
            </Text>
          </View>
        ))}
        
        {declines.map((decline, index) => (
          <View key={`decline-${index}`} style={styles.comparisonItem}>
            <Text style={styles.declineIcon}>📉</Text>
            <Text style={[styles.comparisonText, styles.declineText]}>
              {decline}
            </Text>
          </View>
        ))}
      </Card>
    );
  };

  const renderInsightsCard = () => {
    if (insights.length === 0) return null;

    return (
      <Card style={styles.insightsCard}>
        <Text style={styles.insightsTitle}>분석 및 인사이트</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={styles.insightBullet}>•</Text>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>게임 완료!</Text>
          {isNewRecord && (
            <View style={styles.newRecordBadge}>
              <Text style={styles.newRecordText}>🏆 신기록!</Text>
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
            title="다시 플레이"
            onPress={playAgain}
            style={styles.primaryButton}
          />
          
          <View style={styles.secondaryButtonRow}>
            <Button
              title="결과 공유"
              onPress={shareResult}
              variant="ghost"
              style={styles.secondaryButton}
            />
            <Button
              title="홈으로"
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
    backgroundColor: COLORS.BACKGROUND,
  },
  
  header: {
    padding: SPACING.LG,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.TEXT_TERTIARY,
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  
  newRecordBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: 20,
  },
  
  newRecordText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  
  improvementText: {
    color: COLORS.SUCCESS,
  },
  
  declineText: {
    color: COLORS.WARNING,
  },
  
  insightsCard: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  
  insightsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  
  insightBullet: {
    marginRight: SPACING.SM,
    marginTop: 2,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },
  
  insightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
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
    flexDirection: 'row',
    gap: SPACING.MD,
  },
  
  secondaryButton: {
    flex: 1,
  },
});