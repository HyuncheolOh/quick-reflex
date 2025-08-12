import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { LeaderboardEntry as LeaderboardEntryType } from '../../types';
import { GameLogic } from '../../utils';
import { useThemedColors } from '../../hooks';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  isCurrentUser?: boolean;
  showDetails?: boolean;
}

export const LeaderboardEntryComponent: React.FC<LeaderboardEntryProps> = ({
  entry,
  isCurrentUser = false,
  showDetails = false,
}) => {
  const colors = useThemedColors();

  const getRankDisplay = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) {
      return { fontSize: TYPOGRAPHY.FONT_SIZE.XXL };
    }
    return { fontSize: TYPOGRAPHY.FONT_SIZE.LG };
  };

  return (
    <Card
      style={[
        styles.container,
        isCurrentUser && [styles.currentUserCard, { backgroundColor: colors.PRIMARY + '20' }],
      ]}
      variant={isCurrentUser ? 'elevated' : 'default'}
    >
      <View style={styles.content}>
        {/* Rank */}
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, getRankStyle(entry.rank || 0), { color: colors.TEXT_PRIMARY }]}>
            {getRankDisplay(entry.rank || 0)}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameSection}>
            <Text style={[styles.nickname, { color: colors.TEXT_PRIMARY }]} numberOfLines={1}>
              {entry.nickname}
            </Text>
            {isCurrentUser && (
              <Text style={[styles.youLabel, { color: colors.PRIMARY }]}>(You)</Text>
            )}
          </View>
          
          <View style={styles.statsSection}>
            <View style={styles.mainStat}>
              <Text style={[styles.bestTime, { color: colors.SUCCESS }]}>
                {GameLogic.formatTime(entry.bestTime)}
              </Text>
            </View>
            
            {showDetails && (
              <View style={styles.detailStats}>
                <Text style={[styles.detailText, { color: colors.TEXT_SECONDARY }]}>
                  Avg: {GameLogic.formatTime(entry.averageTime)}
                </Text>
                <Text style={[styles.detailText, { color: colors.TEXT_SECONDARY }]}>
                  Games: {entry.gamesPlayed}
                </Text>
                <Text style={[styles.detailText, { color: colors.TEXT_SECONDARY }]}>
                  Accuracy: {entry.accuracy}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Achievement Badge */}
        {entry.rank && entry.rank <= 10 && (
          <View style={[styles.badge, { backgroundColor: colors.WARNING }]}>
            <Text style={[styles.badgeText, { color: colors.TEXT_WHITE }]}>
              TOP 10
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.SM,
  },
  
  currentUserCard: {
    borderWidth: 2,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    minHeight: 80,
  },
  
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.MD,
  },
  
  rank: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
  },
  
  userInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  
  nickname: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginRight: SPACING.SM,
  },
  
  youLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },
  
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  mainStat: {
    flex: 1,
  },
  
  bestTime: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },
  
  detailStats: {
    alignItems: 'flex-end',
  },
  
  detailText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT * TYPOGRAPHY.FONT_SIZE.XS,
  },
  
  badge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginLeft: SPACING.SM,
  },
  
  badgeText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },
});