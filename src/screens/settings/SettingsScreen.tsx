import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Button } from '../../components/common';
import { SPACING, TYPOGRAPHY } from '../../constants';
import { MainStackParamList } from '../../types';
import { useTheme, useLocalization } from '../../contexts';
import { useThemedColors } from '../../hooks';

type SettingsScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Settings'>;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { themeMode, setThemeMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLocalization();
  const colors = useThemedColors();

  const themeOptions = [
    { value: 'system', label: t.settings.themeOptions.system, icon: '⚙️' },
    { value: 'light', label: t.settings.themeOptions.light, icon: '☀️' },
    { value: 'dark', label: t.settings.themeOptions.dark, icon: '🌙' },
  ];

  const languageOptions = [
    { value: 'ko', label: t.settings.languageOptions.korean, icon: '🇰🇷' },
    { value: 'en', label: t.settings.languageOptions.english, icon: '🇺🇸' },
  ];

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
});