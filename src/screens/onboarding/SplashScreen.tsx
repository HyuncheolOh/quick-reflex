import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TYPOGRAPHY, SPACING } from '../../constants';
import { OnboardingStackParamList } from '../../types';
import { LocalStorageService } from '../../services/storage';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

type SplashScreenProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Splash'>;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Check onboarding status after animation
    const timer = setTimeout(async () => {
      try {
        const isOnboardingCompleted = await LocalStorageService.isOnboardingCompleted();
        
        if (isOnboardingCompleted) {
          // Navigate to main app
          navigation.navigate('Tutorial'); // For now, always show tutorial
        } else {
          // Navigate to tutorial
          navigation.navigate('Tutorial');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        navigation.navigate('Tutorial');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>⚡</Text>
        <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>QuickReflex</Text>
        <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>{t.app.subtitle}</Text>
      </Animated.View>
      
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={[styles.version, { color: colors.TEXT_TERTIARY }]}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logo: {
    fontSize: 80,
    marginBottom: SPACING.LG,
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.GIANT,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.EXTRABOLD,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
  },
  
  footer: {
    position: 'absolute',
    bottom: SPACING.XXL,
  },
  
  version: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    textAlign: 'center',
  },
});