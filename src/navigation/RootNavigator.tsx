import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import { LocalStorageService } from '../services/storage';
import { useThemedColors } from '../hooks';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const colors = useThemedColors();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await LocalStorageService.isOnboardingCompleted();
      setIsOnboardingCompleted(completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding if there's an error
      setIsOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ 
          flex: 1, 
          backgroundColor: colors.BACKGROUND, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor={colors.BACKGROUND} 
            translucent={Platform.OS === 'android'}
          />
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={colors.BACKGROUND} 
          translucent={Platform.OS === 'android'}
        />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            cardStyle: { backgroundColor: colors.BACKGROUND },
          }}
          initialRouteName={isOnboardingCompleted ? 'Main' : 'Onboarding'}
        >
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};