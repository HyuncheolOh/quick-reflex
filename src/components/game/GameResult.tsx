import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Card } from '../common';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { GameStatistics, ReactionAttempt } from '../../types';
import { GameLogic } from '../../utils';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

interface GameResultProps {
  statistics: GameStatistics;
  attempts: ReactionAttempt[];
  showDetailedResults?: boolean;
}

export const GameResult: React.FC<GameResultProps> = ({
  statistics,
  attempts,
  showDetailedResults = false,
}) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  const performance = GameLogic.getPerformanceRating(
    statistics.averageTime,
    statistics.validAttempts > 0
  );

  const renderStatCard = (title: string, value: string, subtitle?: string, color?: string) => (
    <Card style={[styles.statCard, { backgroundColor: colors.CARD }]} variant="elevated">
      <Text style={[styles.statTitle, { color: colors.TEXT_SECONDARY }]}>{title}</Text>
      <Text style={[styles.statValue, { color: color || colors.TEXT_PRIMARY }]}>{value}</Text>
      {subtitle && <Text style={[styles.statSubtitle, { color: colors.TEXT_TERTIARY }]}>{subtitle}</Text>}
    </Card>
  );

  const renderAttemptsList = () => (
    <Card style={[styles.attemptsCard, { backgroundColor: colors.CARD }]}>
      <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>{t.results.attemptResults}</Text>
      <View style={styles.attemptsList}>
        {attempts.map((attempt, index) => (
          <View key={index} style={[styles.attemptItem, { borderBottomColor: colors.TEXT_TERTIARY }]}>
            <View style={[styles.attemptNumber, { backgroundColor: colors.PRIMARY }]}>
              <Text style={[styles.attemptNumberText, { color: colors.TEXT_PRIMARY }]}>{index + 1}</Text>
            </View>
            <View style={styles.attemptInfo}>
              <Text style={[
                styles.attemptTime,
                { color: attempt.isValid ? colors.TEXT_PRIMARY : colors.ERROR }
              ]}>
                {attempt.isValid && attempt.reactionTime > 0 
                  ? GameLogic.formatTime(attempt.reactionTime) 
                  : t.results.failed}
              </Text>
              {!attempt.isValid && (
                <Text style={[styles.attemptError, { color: colors.ERROR }]}>
                  {attempt.reactionTime === 0 ? t.results.earlyReaction : t.results.timeout}
                </Text>
              )}
            </View>
            <View style={[
              styles.attemptStatus,
              { backgroundColor: attempt.isValid ? colors.SUCCESS : colors.ERROR }
            ]} />
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Performance Summary */}
      <Card style={[styles.performanceCard, { borderColor: performance.color, backgroundColor: colors.CARD }] as any} variant="outlined">
        <Text style={[styles.performanceRating, { color: performance.color }]}>
          {t.game[performance.message as keyof typeof t.game]}
        </Text>
        <Text style={[styles.performanceAverage, { color: colors.TEXT_SECONDARY }]}>
          {t.results.averageTime}: {statistics.validAttempts > 0 ? GameLogic.formatTime(statistics.averageTime) : '-'}
        </Text>
      </Card>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard(
          t.results.bestTime,
          statistics.validAttempts > 0 ? GameLogic.formatTime(statistics.bestTime) : '-',
          t.results.fastestReaction,
          statistics.validAttempts > 0 ? colors.SUCCESS : colors.TEXT_SECONDARY
        )}
        
        {renderStatCard(
          t.results.averageTime,
          statistics.validAttempts > 0 ? GameLogic.formatTime(statistics.averageTime) : '-',
          t.results.successCount(statistics.validAttempts),
          statistics.validAttempts > 0 ? colors.INFO : colors.TEXT_SECONDARY
        )}
        
        {(() => {
          const accuracy =
            statistics.totalAttempts > 0
              ? Math.round(
                  (statistics.validAttempts / statistics.totalAttempts) * 100
                )
              : 0;
          return renderStatCard(
            t.results.accuracy,
            `${accuracy}%`,
            `${statistics.validAttempts}/${statistics.totalAttempts}`,
            statistics.totalAttempts > 0 &&
            statistics.validAttempts === statistics.totalAttempts
              ? colors.SUCCESS
              : colors.WARNING
          );
        })()}
        
        {statistics.worstTime > 0 && statistics.validAttempts > 1 && renderStatCard(
          t.results.worstTime,
          GameLogic.formatTime(statistics.worstTime),
          t.results.slowestReaction,
          colors.TEXT_SECONDARY
        )}
      </View>

      {/* Detailed Results */}
      {showDetailedResults && renderAttemptsList()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  performanceCard: {
    marginBottom: SPACING.LG,
    alignItems: 'center',
    borderWidth: 2,
  },
  
  performanceRating: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  
  performanceAverage: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    textAlign: 'center',
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  
  statTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    textAlign: 'center',
    marginBottom: SPACING.XS,
  },
  
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
  },
  
  statSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  
  attemptsCard: {
    marginBottom: SPACING.LG,
  },
  
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.MD,
  },
  
  attemptsList: {
    // No height restriction - show all items
  },
  
  attemptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
  },
  
  attemptNumber: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.ROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  
  attemptNumberText: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
  },
  
  attemptInfo: {
    flex: 1,
  },
  
  attemptTime: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
  },
  
  attemptError: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    marginTop: 2,
  },
  
  attemptStatus: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.ROUND,
  },
});