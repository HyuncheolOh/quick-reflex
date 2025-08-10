import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Button, ConfirmModal } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';
import { MainStackParamList, UserProfile } from '../../types';
import { LocalStorageService, GameStorageService } from '../../services/storage';
import { StatisticsUtils } from '../../utils';

type GameListScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'GameList'>;
};

export const GameListScreen: React.FC<GameListScreenProps> = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [recentAverage, setRecentAverage] = useState<number | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await LocalStorageService.getUserProfile();
      setUserProfile(profile);

      const best = await GameStorageService.getPersonalBest();
      setPersonalBest(best);

      const sessions = await GameStorageService.getGameHistory(5);
      const summary = StatisticsUtils.getSessionSummary(sessions);
      setRecentAverage(summary.averageReactionTime || null);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const startTapTest = () => {
    navigation.navigate('TapTest');
  };

  const handleResetData = async () => {
    try {
      await LocalStorageService.clearAllData();
      
      // Recreate basic user profile
      const newProfile: UserProfile = {
        id: `user_${Date.now()}`,
        createdAt: Date.now(),
        onboardingCompleted: true,
        preferences: {
          soundEnabled: true,
          vibrationEnabled: true,
        },
      };
      
      await LocalStorageService.setUserProfile(newProfile);
      await LocalStorageService.setOnboardingCompleted(true);
      
      // Reload data
      await loadUserData();
      
      Alert.alert('완료', '모든 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('Error resetting data:', error);
      Alert.alert('오류', '데이터 초기화 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>QuickReflex</Text>
          <Text style={styles.subtitle}>순발력 측정 게임</Text>
        </View>

        {/* User Stats */}
        {userProfile && (
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>나의 기록</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {userProfile.statistics?.totalGamesPlayed || 0}
                </Text>
                <Text style={styles.statLabel}>총 게임 수</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {personalBest ? `${Math.round(personalBest)}ms` : '-'}
                </Text>
                <Text style={styles.statLabel}>최고 기록</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {recentAverage ? `${Math.round(recentAverage)}ms` : '-'}
                </Text>
                <Text style={styles.statLabel}>평균 기록</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Game Modes */}
        <View style={styles.gameSection}>
          <Text style={styles.sectionTitle}>게임 모드</Text>
          
          <Card style={styles.gameCard} touchable onPress={startTapTest}>
            <View style={styles.gameInfo}>
              <View style={styles.gameIcon}>
                <Text style={styles.gameIconText}>⚡</Text>
              </View>
              <View style={styles.gameDetails}>
                <Text style={styles.gameTitle}>순발력 테스트</Text>
                <Text style={styles.gameDescription}>
                  빨간 화면이 초록색으로 바뀌는 순간 탭하세요!
                </Text>
                <Text style={styles.gameStats}>5라운드 • 평균 1분</Text>
              </View>
            </View>
          </Card>

          {/* Coming Soon Games */}
          <Card style={[styles.gameCard, styles.comingSoonCard] as any}>
            <View style={styles.gameInfo}>
              <View style={styles.gameIcon}>
                <Text style={styles.gameIconText}>🎵</Text>
              </View>
              <View style={styles.gameDetails}>
                <Text style={[styles.gameTitle, styles.comingSoonText]}>
                  청각 반응 테스트
                </Text>
                <Text style={[styles.gameDescription, styles.comingSoonText]}>
                  소리가 나는 순간 탭하세요!
                </Text>
                <Text style={[styles.gameStats, styles.comingSoonText]}>
                  곧 출시 예정
                </Text>
              </View>
            </View>
          </Card>

          <Card style={[styles.gameCard, styles.comingSoonCard] as any}>
            <View style={styles.gameInfo}>
              <View style={styles.gameIcon}>
                <Text style={styles.gameIconText}>🎯</Text>
              </View>
              <View style={styles.gameDetails}>
                <Text style={[styles.gameTitle, styles.comingSoonText]}>
                  Go/No-Go 테스트
                </Text>
                <Text style={[styles.gameDescription, styles.comingSoonText]}>
                  특정 신호에만 반응하세요!
                </Text>
                <Text style={[styles.gameStats, styles.comingSoonText]}>
                  곧 출시 예정
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>설정</Text>
          
          <Button
            title="데이터 초기화"
            onPress={() => setShowResetModal(true)}
            variant="danger"
            size="small"
          />
        </View>
      </ScrollView>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        visible={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetData}
        title="데이터 초기화"
        message="모든 게임 기록과 설정이 삭제됩니다.\n정말로 초기화하시겠습니까?"
        confirmText="초기화"
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
    padding: SPACING.LG,
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.EXTRABOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  
  statsCard: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XS,
  },
  
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  
  gameSection: {
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  
  gameCard: {
    marginBottom: SPACING.MD,
  },
  
  comingSoonCard: {
    opacity: 0.6,
  },
  
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  
  gameIconText: {
    fontSize: 24,
  },
  
  gameDetails: {
    flex: 1,
  },
  
  gameTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  
  gameDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: SPACING.XS,
  },
  
  gameStats: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT_TERTIARY,
  },
  
  comingSoonText: {
    opacity: 0.7,
  },
  
  settingsSection: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XXL,
  },
});