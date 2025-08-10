import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Card } from '../common';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { GameStatistics, ReactionAttempt } from '../../types';
import { GameLogic } from '../../utils';

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
  const performance = GameLogic.getPerformanceRating(
    statistics.averageTime,
    statistics.validAttempts > 0
  );

  const renderStatCard = (title: string, value: string, subtitle?: string, color?: string) => (
    <Card style={styles.statCard} variant="elevated">
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Card>
  );

  const renderAttemptsList = () => (
    <Card style={styles.attemptsCard}>
      <Text style={styles.sectionTitle}>시도별 결과</Text>
      <ScrollView style={styles.attemptsList} showsVerticalScrollIndicator={false}>
        {attempts.map((attempt, index) => (
          <View key={index} style={styles.attemptItem}>
            <View style={styles.attemptNumber}>
              <Text style={styles.attemptNumberText}>{attempt.attemptNumber}</Text>
            </View>
            <View style={styles.attemptInfo}>
              <Text style={[
                styles.attemptTime,
                !attempt.isValid && styles.invalidAttempt
              ]}>
                {attempt.isValid && attempt.reactionTime > 0 
                  ? GameLogic.formatTime(attempt.reactionTime) 
                  : '실패'}
              </Text>
              {!attempt.isValid && (
                <Text style={styles.attemptError}>
                  {attempt.reactionTime === 0 ? '조기 반응' : '시간 초과'}
                </Text>
              )}
            </View>
            <View style={[
              styles.attemptStatus,
              { backgroundColor: attempt.isValid ? COLORS.SUCCESS : COLORS.ERROR }
            ]} />
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Performance Summary */}
      <Card style={[styles.performanceCard, { borderColor: performance.color }] as any} variant="outlined">
        <Text style={[styles.performanceRating, { color: performance.color }]}>
          {performance.message}
        </Text>
        <Text style={styles.performanceAverage}>
          평균 반응시간: {GameLogic.formatTime(statistics.averageTime)}
        </Text>
      </Card>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard(
          '최고 기록',
          statistics.validAttempts > 0 ? GameLogic.formatTime(statistics.bestTime) : '-',
          '가장 빠른 반응',
          statistics.validAttempts > 0 ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY
        )}
        
        {renderStatCard(
          '평균 시간',
          statistics.validAttempts > 0 ? GameLogic.formatTime(statistics.averageTime) : '-',
          `${statistics.validAttempts}번 성공`,
          statistics.validAttempts > 0 ? COLORS.INFO : COLORS.TEXT_SECONDARY
        )}
        
        {renderStatCard(
          '정확도',
          `${Math.round((statistics.validAttempts / statistics.totalAttempts) * 100)}%`,
          `${statistics.validAttempts}/${statistics.totalAttempts}`,
          statistics.validAttempts === statistics.totalAttempts ? COLORS.SUCCESS : COLORS.WARNING
        )}
        
        {statistics.worstTime > 0 && statistics.validAttempts > 1 && renderStatCard(
          '최저 기록',
          GameLogic.formatTime(statistics.worstTime),
          '가장 느린 반응',
          COLORS.TEXT_SECONDARY
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
    color: COLORS.TEXT_SECONDARY,
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
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.XS,
  },
  
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  
  statSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  
  attemptsCard: {
    marginBottom: SPACING.LG,
  },
  
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  
  attemptsList: {
    maxHeight: 200,
  },
  
  attemptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.TEXT_TERTIARY,
  },
  
  attemptNumber: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.ROUND,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  
  attemptNumberText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
  },
  
  attemptInfo: {
    flex: 1,
  },
  
  attemptTime: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  
  invalidAttempt: {
    color: COLORS.ERROR,
  },
  
  attemptError: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.ERROR,
    marginTop: 2,
  },
  
  attemptStatus: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.ROUND,
  },
});