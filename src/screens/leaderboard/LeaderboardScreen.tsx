import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Button } from '../../components/common';
import { LeaderboardEntryComponent } from '../../components/leaderboard/LeaderboardEntry';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { MainStackParamList, LeaderboardResponse, GameType, LeaderboardEntry } from '../../types';
import { LeaderboardService } from '../../services/LeaderboardService';
import { UserIdentityService } from '../../services/UserIdentityService';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

type LeaderboardScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Leaderboard'>;
  route: RouteProp<MainStackParamList, 'Leaderboard'>;
};

type FilterType = 'bestSpeed' | 'bestAverage' | 'mostGames';

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { gameType } = route.params;
  const colors = useThemedColors();
  const { t } = useLocalization();
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [filteredData, setFilteredData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserUUID, setCurrentUserUUID] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('bestSpeed');

  useEffect(() => {
    loadLeaderboard();
    loadUserIdentity();
  }, [gameType]);

  useEffect(() => {
    if (leaderboardData?.entries) {
      applyFilter(selectedFilter);
    }
  }, [leaderboardData, selectedFilter]);

  const loadUserIdentity = async () => {
    try {
      const uuid = await UserIdentityService.getUserUUID();
      setCurrentUserUUID(uuid);
    } catch (error) {
      console.error('Error loading user identity:', error);
    }
  };

  const loadLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Try to load from API first, fallback to mock data
      let data: LeaderboardResponse;
      try {
        const isOnline = await LeaderboardService.healthCheck();
        if (isOnline) {
          data = await LeaderboardService.getLeaderboard(gameType);
        } else {
          throw new Error('Service offline');
        }
      } catch (error) {
        console.log('Loading mock leaderboard data');
        data = await LeaderboardService.getMockLeaderboard(gameType);
      }

      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      Alert.alert(t.common.error, t.messages.leaderboardError);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadLeaderboard(true);
  }, [gameType]);

  const applyFilter = (filterType: FilterType) => {
    if (!leaderboardData?.entries) return;
    
    let sorted = [...leaderboardData.entries];
    
    switch (filterType) {
      case 'bestSpeed':
        sorted.sort((a, b) => a.bestTime - b.bestTime);
        break;
      case 'bestAverage':
        sorted.sort((a, b) => a.averageTime - b.averageTime);
        break;
      case 'mostGames':
        sorted.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
        break;
    }
    
    // Re-rank entries based on new sorting
    const rankedData = sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
    
    setFilteredData(rankedData);
  };

  const getGameTypeTitle = (gameType: GameType): string => {
    switch (gameType) {
      case 'TAP_TEST':
        return t.gameModes.tapTest.title;
      case 'AUDIO_TEST':
        return t.gameModes.audioTest.title;
      case 'GO_NO_GO_TEST':
        return t.gameModes.goNoGoTest.title;
      default:
        return t.leaderboard.title;
    }
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <Text style={[styles.filterTitle, { color: colors.TEXT_PRIMARY }]}>
        {t.leaderboard.filters.title}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.SURFACE },
            selectedFilter === 'bestSpeed' && [styles.activeFilter, { backgroundColor: colors.PRIMARY }]
          ]}
          onPress={() => setSelectedFilter('bestSpeed')}
        >
          <Text style={[
            styles.filterButtonText,
            { color: colors.TEXT_PRIMARY },
            selectedFilter === 'bestSpeed' && { color: colors.TEXT_WHITE }
          ]}>
            {t.leaderboard.filters.bestSpeed}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.SURFACE },
            selectedFilter === 'bestAverage' && [styles.activeFilter, { backgroundColor: colors.PRIMARY }]
          ]}
          onPress={() => setSelectedFilter('bestAverage')}
        >
          <Text style={[
            styles.filterButtonText,
            { color: colors.TEXT_PRIMARY },
            selectedFilter === 'bestAverage' && { color: colors.TEXT_WHITE }
          ]}>
            {t.leaderboard.filters.bestAverage}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.SURFACE },
            selectedFilter === 'mostGames' && [styles.activeFilter, { backgroundColor: colors.PRIMARY }]
          ]}
          onPress={() => setSelectedFilter('mostGames')}
        >
          <Text style={[
            styles.filterButtonText,
            { color: colors.TEXT_PRIMARY },
            selectedFilter === 'mostGames' && { color: colors.TEXT_WHITE }
          ]}>
            {t.leaderboard.filters.mostGames}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.SURFACE }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.TEXT_PRIMARY }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
          {getGameTypeTitle(gameType)}
        </Text>
        <View style={styles.placeholder} />
      </View>
      <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
        {t.leaderboard.subtitle}
      </Text>
      
      {leaderboardData?.userStats && (
        <Card style={styles.userStatsCard}>
          <Text style={[styles.userStatsTitle, { color: colors.TEXT_PRIMARY }]}>
            {t.leaderboard.yourRanking}
          </Text>
          <View style={styles.userStatsContent}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>
                {t.leaderboard.bestRank}
              </Text>
              <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                #{leaderboardData.userStats.bestRank}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>
                {t.leaderboard.currentRank}
              </Text>
              <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                {leaderboardData.userStats.currentRank ? 
                  `#${leaderboardData.userStats.currentRank}` : 
                  t.leaderboard.notRanked
                }
              </Text>
            </View>
          </View>
        </Card>
      )}
      
      {renderFilterButtons()}
      
      <Text style={[styles.listHeader, { color: colors.TEXT_PRIMARY }]}>
        {t.leaderboard.topPlayers}
      </Text>
    </View>
  );

  const renderEntry = ({ item, index }: { item: any; index: number }) => (
    <LeaderboardEntryComponent
      entry={item}
      isCurrentUser={item.userId === currentUserUUID}
      showDetails={index < 10} // Show details for top 10
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
        {t.leaderboard.noData}
      </Text>
      <Button
        title={t.common.retry}
        onPress={() => loadLeaderboard()}
        variant="ghost"
        style={styles.retryButton}
      />
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: colors.TEXT_TERTIARY }]}>
        {leaderboardData && 
          t.leaderboard.totalPlayers(leaderboardData.totalUsers)
        }
      </Text>
      <Text style={[styles.footerText, { color: colors.TEXT_TERTIARY }]}>
        {leaderboardData &&
          t.leaderboard.lastUpdated(
            new Date(leaderboardData.lastUpdated).toLocaleString()
          )
        }
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.BACKGROUND }]}>
        <ActivityIndicator size="large" color={colors.PRIMARY} />
        <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>
          {t.leaderboard.loading}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <FlatList
        data={filteredData}
        renderItem={renderEntry}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.PRIMARY]}
            tintColor={colors.PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  listContent: {
    padding: SPACING.LG,
  },
  
  header: {
    marginBottom: SPACING.XL,
  },
  
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
    paddingHorizontal: SPACING.SM,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.LG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },
  
  placeholder: {
    width: 40,
    height: 40,
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
    flex: 1,
  },
  
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  
  userStatsCard: {
    marginBottom: SPACING.XL,
  },
  
  userStatsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  
  userStatsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    marginBottom: SPACING.XS,
  },
  
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },
  
  listHeader: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.LG,
  },
  
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    marginTop: SPACING.MD,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XXL,
  },
  
  emptyText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  
  retryButton: {
    marginTop: SPACING.MD,
  },
  
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
    borderTopWidth: 1,
    marginTop: SPACING.LG,
  },
  
  footerText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    textAlign: 'center',
    marginBottom: SPACING.XS,
  },
  
  filterContainer: {
    marginBottom: SPACING.LG,
  },
  
  filterTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.SM,
  },
  
  filterScroll: {
    flexGrow: 0,
  },
  
  filterButton: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    marginRight: SPACING.SM,
    minWidth: 100,
    alignItems: 'center',
  },
  
  activeFilter: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  filterButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },
});