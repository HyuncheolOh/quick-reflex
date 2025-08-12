import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Button } from '../../components/common';
import { SPACING, TYPOGRAPHY } from '../../constants';
import { MainStackParamList } from '../../types';
import { useTheme, useLocalization } from '../../contexts';
import { useThemedColors } from '../../hooks';
import { LocalStorageService } from '../../services/storage';
import { CommonActions } from '@react-navigation/native';

// App version
const APP_VERSION = '0.0.1';

type SettingsScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Settings'>;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { themeMode, setThemeMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLocalization();
  const colors = useThemedColors();
  
  // Developer features state
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const versionTapCount = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const themeOptions = [
    { value: 'system', label: t.settings.themeOptions.system, icon: '⚙️' },
    { value: 'light', label: t.settings.themeOptions.light, icon: '☀️' },
    { value: 'dark', label: t.settings.themeOptions.dark, icon: '🌙' },
  ];

  const languageOptions = [
    { value: 'ko', label: t.settings.languageOptions.korean, icon: '🇰🇷' },
    { value: 'en', label: t.settings.languageOptions.english, icon: '🇺🇸' },
  ];

  // Developer features functions
  const handleVersionTap = () => {
    versionTapCount.current += 1;
    
    // Clear previous timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    if (versionTapCount.current >= 10) {
      setIsDeveloperMode(true);
      versionTapCount.current = 0;
      Alert.alert(
        '🛠️ Developer Mode',
        'Developer features enabled!',
        [{ text: 'OK' }]
      );
    } else {
      // Reset counter after 2 seconds of inactivity
      tapTimeoutRef.current = setTimeout(() => {
        versionTapCount.current = 0;
      }, 2000);
    }
  };

  const handleDataReset = () => {
    Alert.alert(
      '⚠️ Data Reset',
      'This will delete all game data, settings, and restart the tutorial. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all local storage
              await LocalStorageService.clearAllData();
              
              Alert.alert(
                '✅ Reset Complete',
                'All data has been cleared. The app will restart.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to onboarding
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: 'Onboarding' }],
                        })
                      );
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRestartTutorial = () => {
    Alert.alert(
      '📚 Restart Tutorial',
      'This will restart the tutorial from the beginning. Your game data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          onPress: async () => {
            try {
              // Mark onboarding as incomplete
              await LocalStorageService.setOnboardingCompleted(false);
              
              // Navigate to onboarding
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Onboarding' }],
                })
              );
            } catch (error) {
              console.error('Error restarting tutorial:', error);
              Alert.alert('Error', 'Failed to restart tutorial. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderThemeOption = (option: typeof themeOptions[0]) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionItem,
        { 
          backgroundColor: themeMode === option.value ? colors.PRIMARY + '20' : 'transparent',
          borderColor: themeMode === option.value ? colors.PRIMARY : colors.TEXT_TERTIARY,
        }
      ]}
      onPress={() => setThemeMode(option.value as any)}
    >
      <Text style={styles.optionIcon}>{option.icon}</Text>
      <Text style={[styles.optionLabel, { color: colors.TEXT_PRIMARY }]}>
        {option.label}
      </Text>
      {themeMode === option.value && (
        <Text style={[styles.checkmark, { color: colors.PRIMARY }]}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderLanguageOption = (option: typeof languageOptions[0]) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionItem,
        { 
          backgroundColor: language === option.value ? colors.PRIMARY + '20' : 'transparent',
          borderColor: language === option.value ? colors.PRIMARY : colors.TEXT_TERTIARY,
        }
      ]}
      onPress={() => setLanguage(option.value as any)}
    >
      <Text style={styles.optionIcon}>{option.icon}</Text>
      <Text style={[styles.optionLabel, { color: colors.TEXT_PRIMARY }]}>
        {option.label}
      </Text>
      {language === option.value && (
        <Text style={[styles.checkmark, { color: colors.PRIMARY }]}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>{t.settings.title}</Text>
        </View>

        {/* Language Settings */}
        <Card style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
            {t.settings.language}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.TEXT_SECONDARY }]}>
            {t.settings.languageDescription}
          </Text>
          
          <View style={styles.optionsContainer}>
            {languageOptions.map(renderLanguageOption)}
          </View>
        </Card>

        {/* Theme Settings */}
        <Card style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
            {t.settings.theme}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.TEXT_SECONDARY }]}>
            {t.settings.themeDescription}
          </Text>
          
          <View style={styles.optionsContainer}>
            {themeOptions.map(renderThemeOption)}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
            {t.settings.quickActions}
          </Text>
          
          <View style={styles.quickActions}>
            <Button
              title={t.settings.themeToggle}
              onPress={toggleTheme}
              variant="ghost"
              style={styles.quickActionButton}
            />
          </View>
        </Card>

        {/* Developer Features */}
        {isDeveloperMode && (
          <Card style={[styles.section, { backgroundColor: colors.WARNING + '20', borderColor: colors.WARNING }]}>
            <Text style={[styles.sectionTitle, { color: colors.WARNING }]}>
              🛠️ Developer Features
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.TEXT_SECONDARY }]}>
              Advanced features for developers and testers.
            </Text>
            
            <View style={styles.developerActions}>
              <Button
                title="📚 Restart Tutorial"
                onPress={handleRestartTutorial}
                variant="ghost"
                style={[styles.developerButton, { borderColor: colors.INFO }]}
                textStyle={{ color: colors.INFO }}
              />
              <Button
                title="⚠️ Reset All Data"
                onPress={handleDataReset}
                variant="ghost"
                style={[styles.developerButton, { borderColor: colors.ERROR }]}
                textStyle={{ color: colors.ERROR }}
              />
            </View>
          </Card>
        )}

        {/* Version Info */}
        <Card style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
            About
          </Text>
          
          <TouchableOpacity onPress={handleVersionTap} style={styles.versionContainer}>
            <Text style={[styles.versionLabel, { color: colors.TEXT_SECONDARY }]}>
              Version
            </Text>
            <Text style={[styles.versionValue, { color: colors.TEXT_PRIMARY }]}>
              {APP_VERSION}
            </Text>
          </TouchableOpacity>
          
          {isDeveloperMode && (
            <Text style={[styles.developerModeIndicator, { color: colors.WARNING }]}>
              🛠️ Developer Mode Active
            </Text>
          )}
        </Card>

        {/* Back Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={t.common.back}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
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
    alignItems: 'center',
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },
  
  section: {
    margin: SPACING.LG,
    marginTop: 0,
  },
  
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    marginBottom: SPACING.SM,
  },
  
  sectionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    marginBottom: SPACING.LG,
    lineHeight: 20,
  },
  
  optionsContainer: {
    gap: SPACING.SM,
  },
  
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  optionIcon: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    marginRight: SPACING.MD,
  },
  
  optionLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },
  
  checkmark: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
  },
  
  quickActions: {
    gap: SPACING.MD,
  },
  
  quickActionButton: {
    alignSelf: 'flex-start',
  },
  
  buttonContainer: {
    padding: SPACING.LG,
  },
  
  backButton: {
    marginBottom: SPACING.XXL,
  },
  
  // Developer features styles
  developerActions: {
    gap: SPACING.MD,
  },
  
  developerButton: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  
  // Version info styles
  versionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.SM,
  },
  
  versionLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },
  
  versionValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    fontFamily: 'monospace',
  },
  
  developerModeIndicator: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
});