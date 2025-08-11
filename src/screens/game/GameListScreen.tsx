import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Button, ConfirmModal } from '../../components/common';
import { SPACING, TYPOGRAPHY } from '../../constants';
import { MainStackParamList, UserProfile } from '../../types';
import { LocalStorageService, GameStorageService } from '../../services/storage';
import { StatisticsUtils } from '../../utils';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

type GameListScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'GameList'>;
};

export const GameListScreen: React.FC<GameListScreenProps> = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [recentAverage, setRecentAverage] = useState<number | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const colors = useThemedColors();
  const { t } = useLocalization();

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
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>{t.app.title}</Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>{t.app.subtitle}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: colors.SURFACE }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* User Stats */}
        {userProfile && (
          <Card style={[styles.statsCard, { backgroundColor: colors.CARD }]}>
            <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>{t.statistics.myRecords}</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                  {userProfile.statistics?.totalGamesPlayed || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>{t.statistics.totalGames}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                  {personalBest ? `${Math.round(personalBest)}ms` : '-'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>{t.statistics.bestRecord}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                  {recentAverage ? `${Math.round(recentAverage)}ms` : '-'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>{t.statistics.averageRecord}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Game Modes */}
        <View style={styles.gameSection}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>{t.navigation.gameList}</Text>
          
          <Card style={[styles.gameCard, { backgroundColor: colors.CARD }]} touchable onPress={startTapTest}>
            <View style={styles.gameInfo}>
              <View style={[styles.gameIcon, { backgroundColor: colors.PRIMARY }]}>
                <Text style={styles.gameIconText}>⚡</Text>
              </View>
              <View style={styles.gameDetails}>
                <Text style={[styles.gameTitle, { color: colors.TEXT_PRIMARY }]}>{t.gameModes.tapTest.title}</Text>
                <Text style={[styles.gameDescription, { color: colors.TEXT_SECONDARY }]}>
                  {t.gameModes.tapTest.description}
                </Text>
                <Text style={[styles.gameStats, { color: colors.TEXT_TERTIARY }]}>{t.gameModes.tapTest.stats}</Text>
              </View>
            </View>
          </Card>

          {/* Coming Soon Games */}
          <Card style={[styles.gameCard, styles.comingSoonCard, { backgroundColor: colors.CARD }] as any}>
            <View style={styles.gameInfo}>
              <View style={[styles.gameIcon, { backgroundColor: colors.TEXT_TERTIARY }]}>
                <Text style={styles.gameIconText}>🎵</Text>
              </View>
              <View style={styles.gameDetails}>
                <Text style={[styles.gameTitle, styles.comingSoonText, { color: colors.TEXT_SECONDARY }]}>
                  {t.gameModes.audioTest.title}
                </Text>
                <Text style={[styles.gameDescription, styles.comingSoonText, { color: colors.TEXT_TERTIARY }]}>
                  {t.gameModes.audioTest.description}
                </Text>
                <Text style={[styles.gameStats, styles.comingSoonText, { color: colors.TEXT_TERTIARY }]}>
                  {t.gameModes.audioTest.stats}
                </Text>
              </View>
            </View>
          </Card>

          <Card style={[styles.gameCard, styles.comingSoonCard, { backgroundColor: colors.CARD }] as any}>
            <View style={styles.gameInfo}>
              <View style={[styles.gameIcon, { backgroundColor: colors.TEXT_TERTIARY }]}>
                <Text style={styles.gameIconText}>🎯</Text>
              </View>
              <View style={styles.gameDetails}>
                <Text style={[styles.gameTitle, styles.comingSoonText, { color: colors.TEXT_SECONDARY }]}>
                  {t.gameModes.goNoGoTest.title}
                </Text>
                <Text style={[styles.gameDescription, styles.comingSoonText, { color: colors.TEXT_TERTIARY }]}>
                  {t.gameModes.goNoGoTest.description}
                </Text>
                <Text style={[styles.gameStats, styles.comingSoonText, { color: colors.TEXT_TERTIARY }]}>
                  {t.gameModes.goNoGoTest.stats}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>{t.navigation.settings}</Text>
          
          <Button
            title={t.settings.dataReset}
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
        title={t.modals.resetData.title}
        message={t.modals.resetData.message}
        confirmText={t.modals.resetData.confirm}
        cancelText={t.modals.resetData.cancel}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.EXTRABOLD,
    marginBottom: SPACING.XS,
  },
  
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
  },
  
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  settingsIcon: {
    fontSize: 20,
  },
  
  statsCard: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
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
    marginBottom: SPACING.XS,
  },
  
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
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
    marginBottom: SPACING.XS,
  },
  
  gameDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    lineHeight: 18,
    marginBottom: SPACING.XS,
  },
  
  gameStats: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
  },
  
  comingSoonText: {
    opacity: 0.7,
  },
  
  settingsSection: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XXL,
  },
});