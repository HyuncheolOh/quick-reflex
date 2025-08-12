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
import { Button, Card } from '../../components/common';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { OnboardingStackParamList, NicknameSetupData } from '../../types';
import { UserIdentityService } from '../../services/UserIdentityService';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

type NicknameSetupScreenProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'NicknameSetup'>;
};

export const NicknameSetupScreen: React.FC<NicknameSetupScreenProps> = ({ navigation }) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  const [nickname, setNickname] = useState('');
  const [consentToLeaderboard, setConsentToLeaderboard] = useState(false);
  const [dataRetentionAcknowledged, setDataRetentionAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateNickname = (text: string): boolean => {
    // Nickname validation rules
    const trimmed = text.trim();
    if (trimmed.length < 2) return false;
    if (trimmed.length > 20) return false;
    // Allow letters, numbers, spaces, and some special characters
    const validPattern = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s._-]+$/;
    return validPattern.test(trimmed);
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      
      // User chooses to skip leaderboard setup
      const setupData: NicknameSetupData = {
        nickname: '',
        consentToLeaderboard: false,
        dataRetentionAcknowledged: true,
      };
      
      await UserIdentityService.setupNickname(setupData);
      
      // Navigate to main app
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } catch (error) {
      console.error('Error skipping nickname setup:', error);
      Alert.alert(t.common.error, t.messages.setupError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async () => {
    const trimmedNickname = nickname.trim();
    
    if (!validateNickname(trimmedNickname)) {
      Alert.alert(
        t.validation.invalidNickname,
        t.validation.nicknameRules
      );
      return;
    }

    if (!dataRetentionAcknowledged) {
      Alert.alert(
        t.leaderboard.dataRetentionRequired,
        t.leaderboard.dataRetentionMessage
      );
      return;
    }

    try {
      setIsLoading(true);
      
      const setupData: NicknameSetupData = {
        nickname: trimmedNickname,
        consentToLeaderboard,
        dataRetentionAcknowledged,
      };
      
      await UserIdentityService.setupNickname(setupData);
      
      // Navigate to main app
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } catch (error) {
      console.error('Error setting up nickname:', error);
      Alert.alert(t.common.error, t.messages.setupError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
            {t.leaderboard.nicknameSetup.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
            {t.leaderboard.nicknameSetup.subtitle}
          </Text>
        </View>

        {/* Nickname Input */}
        <Card style={styles.inputCard}>
          <Text style={[styles.label, { color: colors.TEXT_PRIMARY }]}>
            {t.leaderboard.nickname}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.SURFACE,
                color: colors.TEXT_PRIMARY,
                borderColor: colors.TEXT_TERTIARY,
              },
            ]}
            value={nickname}
            onChangeText={setNickname}
            placeholder={t.leaderboard.nicknamePlaceholder}
            placeholderTextColor={colors.TEXT_TERTIARY}
            maxLength={20}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />
          <Text style={[styles.helperText, { color: colors.TEXT_TERTIARY }]}>
            {t.leaderboard.nicknameHelper}
          </Text>
        </Card>

        {/* Leaderboard Consent */}
        <Card style={styles.consentCard}>
          <View style={styles.checkboxContainer}>
            <Button
              title={consentToLeaderboard ? '✓' : ''}
              onPress={() => setConsentToLeaderboard(!consentToLeaderboard)}
              variant="ghost"
              style={[
                styles.checkbox,
                {
                  backgroundColor: consentToLeaderboard ? colors.PRIMARY : 'transparent',
                  borderColor: colors.PRIMARY,
                },
              ]}
              textStyle={{ color: colors.TEXT_WHITE }}
            />
            <Text style={[styles.checkboxLabel, { color: colors.TEXT_PRIMARY }]}>
              {t.leaderboard.consent.participate}
            </Text>
          </View>
          
          <Text style={[styles.consentText, { color: colors.TEXT_SECONDARY }]}>
            {t.leaderboard.consent.description}
          </Text>
        </Card>

        {/* Data Retention Notice */}
        <Card style={styles.noticeCard}>
          <Text style={[styles.noticeTitle, { color: colors.WARNING }]}>
            ⚠️ {t.leaderboard.dataRetention.title}
          </Text>
          <Text style={[styles.noticeText, { color: colors.TEXT_SECONDARY }]}>
            {t.leaderboard.dataRetention.message}
          </Text>
          
          <View style={styles.checkboxContainer}>
            <Button
              title={dataRetentionAcknowledged ? '✓' : ''}
              onPress={() => setDataRetentionAcknowledged(!dataRetentionAcknowledged)}
              variant="ghost"
              style={[
                styles.checkbox,
                {
                  backgroundColor: dataRetentionAcknowledged ? colors.PRIMARY : 'transparent',
                  borderColor: colors.PRIMARY,
                },
              ]}
              textStyle={{ color: colors.TEXT_WHITE }}
            />
            <Text style={[styles.checkboxLabel, { color: colors.TEXT_PRIMARY }]}>
              {t.leaderboard.dataRetention.acknowledge}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={t.leaderboard.setup}
            onPress={handleSetup}
            disabled={isLoading || !dataRetentionAcknowledged}
            loading={isLoading}
            style={styles.setupButton}
          />
          
          <Button
            title={t.leaderboard.skipForNow}
            onPress={handleSkip}
            variant="ghost"
            disabled={isLoading}
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
    padding: SPACING.XL,
    paddingTop: SPACING.XXL,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XXL,
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.RELAXED * TYPOGRAPHY.FONT_SIZE.LG,
  },
  
  inputCard: {
    marginBottom: SPACING.LG,
  },
  
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.SM,
  },
  
  textInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    marginBottom: SPACING.SM,
  },
  
  helperText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL * TYPOGRAPHY.FONT_SIZE.SM,
  },
  
  consentCard: {
    marginBottom: SPACING.LG,
  },
  
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.SM,
    marginRight: SPACING.SM,
    minHeight: 24,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  
  checkboxLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },
  
  consentText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.RELAXED * TYPOGRAPHY.FONT_SIZE.SM,
  },
  
  noticeCard: {
    marginBottom: SPACING.XXL,
  },
  
  noticeTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.MD,
  },
  
  noticeText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.RELAXED * TYPOGRAPHY.FONT_SIZE.SM,
    marginBottom: SPACING.MD,
  },
  
  buttonContainer: {
    gap: SPACING.MD,
  },
  
  setupButton: {
    marginBottom: SPACING.SM,
  },
  
  skipButton: {
    opacity: 0.8,
  },
});