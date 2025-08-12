import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Button } from '../../components/common';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { MainStackParamList } from '../../types';
import { UserIdentityService } from '../../services/UserIdentityService';
import { LeaderboardService } from '../../services/LeaderboardService';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

type NicknameSetupScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'NicknameSetup'>;
  route: RouteProp<MainStackParamList, 'NicknameSetup'>;
};

export const NicknameSetupScreen: React.FC<NicknameSetupScreenProps> = ({
  navigation,
  route,
}) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(true);
  const [acknowledgeDataRetention, setAcknowledgeDataRetention] = useState(false);

  const { from, gameSession } = route.params || { from: 'GameList' };

  const validateNickname = (): string | null => {
    if (!nickname.trim()) {
      return t.validation.nicknameRequired;
    }
    if (nickname.length < 2) {
      return t.validation.nicknameTooShort;
    }
    if (nickname.length > 20) {
      return t.validation.nicknameTooLong;
    }
    // Check for valid characters (Korean, English, numbers only)
    const validPattern = /^[가-힣a-zA-Z0-9\s]+$/;
    if (!validPattern.test(nickname)) {
      return t.validation.nicknameInvalidChars;
    }
    return null;
  };

  const submitGameToLeaderboard = async () => {
    if (!gameSession || !isOptedIn) return null;

    try {
      console.log('Submitting previous game to leaderboard after nickname setup...');
      
      const result = await LeaderboardService.submitScore(gameSession.gameType, {
        bestTime: gameSession.statistics.bestTime,
        averageTime: gameSession.statistics.averageTime,
        gamesPlayed: 1,
        accuracy: Math.round(
          (gameSession.statistics.validAttempts / gameSession.statistics.totalAttempts) * 100
        ),
        attempts: gameSession.attempts,
        statistics: gameSession.statistics,
      });

      console.log('Previous game submission result:', result);
      return result;
    } catch (error) {
      console.error('Error submitting previous game to leaderboard:', error);
      return null;
    }
  };

  const handleSetup = async () => {
    const error = validateNickname();
    if (error) {
      Alert.alert(t.common.error, error);
      return;
    }

    if (!acknowledgeDataRetention) {
      Alert.alert(
        t.leaderboard.dataRetention.title,
        t.leaderboard.dataRetention.message,
        [
          { text: t.common.cancel, style: 'cancel' },
          {
            text: t.leaderboard.dataRetention.acknowledge,
            onPress: () => setAcknowledgeDataRetention(true),
          },
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Set nickname and preferences first
      await UserIdentityService.setNickname(nickname.trim());
      await UserIdentityService.setLeaderboardOptIn(isOptedIn);
      
      // Submit previous game to leaderboard if available and opted in
      let leaderboardResult = null;
      if (gameSession && isOptedIn && !gameSession.isFailed && gameSession.statistics.validAttempts > 0) {
        leaderboardResult = await submitGameToLeaderboard();
      }
      
      // Show success message with rank if available
      let successMessage = `${t.leaderboard.nicknameSetup.title} ${t.common.success}`;
      if (leaderboardResult && leaderboardResult.success && leaderboardResult.rank) {
        if (leaderboardResult.rank <= 100) {
          successMessage += `\n\n🏆 ${t.leaderboard.currentRank}: #${leaderboardResult.rank}`;
        }
        if (leaderboardResult.rank <= 10) {
          successMessage += '\n⭐ TOP 10 ⭐';
        }
      }
      
      Alert.alert(
        t.common.success,
        successMessage,
        [
          {
            text: t.common.ok,
            onPress: () => {
              // Navigate back to where we came from
              if (from === 'Result') {
                // If coming from Result screen, go to GameList
                navigation.navigate('GameList');
              } else {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error setting up nickname:', error);
      Alert.alert(t.common.error, t.messages.setupError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (from === 'Result') {
      navigation.navigate('GameList');
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
            {t.leaderboard.nicknameSetup.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
            {t.leaderboard.nicknameSetup.subtitle}
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.TEXT_PRIMARY }]}>
              {t.leaderboard.nickname}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.SURFACE,
                  color: colors.TEXT_PRIMARY,
                  borderColor: colors.BORDER,
                },
              ]}
              placeholder={t.leaderboard.nicknamePlaceholder}
              placeholderTextColor={colors.TEXT_TERTIARY}
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={[styles.helper, { color: colors.TEXT_TERTIARY }]}>
              {t.leaderboard.nicknameHelper}
            </Text>
          </View>

          <View style={styles.consentContainer}>
            <Button
              title={
                isOptedIn
                  ? `✓ ${t.leaderboard.consent.participate}`
                  : `○ ${t.leaderboard.consent.participate}`
              }
              onPress={() => setIsOptedIn(!isOptedIn)}
              variant="ghost"
              style={[
                styles.consentButton,
                isOptedIn && { backgroundColor: colors.PRIMARY + '20' },
              ]}
              textStyle={[
                styles.consentButtonText,
                { color: isOptedIn ? colors.PRIMARY : colors.TEXT_SECONDARY },
              ]}
            />
            <Text style={[styles.consentDescription, { color: colors.TEXT_TERTIARY }]}>
              {t.leaderboard.consent.description}
            </Text>
          </View>

          <View style={styles.dataRetentionContainer}>
            <Button
              title={
                acknowledgeDataRetention
                  ? `✓ ${t.leaderboard.dataRetention.acknowledge}`
                  : `○ ${t.leaderboard.dataRetention.acknowledge}`
              }
              onPress={() => setAcknowledgeDataRetention(!acknowledgeDataRetention)}
              variant="ghost"
              style={[
                styles.consentButton,
                acknowledgeDataRetention && { backgroundColor: colors.WARNING + '20' },
              ]}
              textStyle={[
                styles.consentButtonText,
                { color: acknowledgeDataRetention ? colors.WARNING : colors.TEXT_SECONDARY },
              ]}
            />
            <Text style={[styles.dataRetentionText, { color: colors.TEXT_TERTIARY }]}>
              {t.leaderboard.dataRetention.message}
            </Text>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title={t.leaderboard.setup}
            onPress={handleSetup}
            disabled={!nickname.trim() || !acknowledgeDataRetention || isLoading}
            style={styles.setupButton}
          />
          <Button
            title={t.leaderboard.skipForNow}
            onPress={handleSkip}
            variant="ghost"
            style={styles.skipButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    padding: SPACING.XL,
  },

  header: {
    alignItems: 'center',
    marginBottom: SPACING.XXL,
    marginTop: SPACING.XXL,
  },

  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    marginBottom: SPACING.MD,
  },

  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    textAlign: 'center',
  },

  formCard: {
    marginBottom: SPACING.XL,
  },

  inputContainer: {
    marginBottom: SPACING.XL,
  },

  label: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.SM,
  },

  input: {
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    borderWidth: 1,
  },

  helper: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    marginTop: SPACING.XS,
  },

  consentContainer: {
    marginBottom: SPACING.LG,
  },

  consentButton: {
    justifyContent: 'flex-start',
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
  },

  consentButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },

  consentDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    lineHeight: 20,
    paddingHorizontal: SPACING.SM,
  },

  dataRetentionContainer: {
    paddingTop: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },

  dataRetentionText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    lineHeight: 20,
    paddingHorizontal: SPACING.SM,
  },

  buttonContainer: {
    gap: SPACING.MD,
  },

  setupButton: {
    width: '100%',
  },

  skipButton: {
    width: '100%',
  },
});