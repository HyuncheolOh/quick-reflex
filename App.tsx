import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation';
import { ThemeProvider, LocalizationProvider, useTheme } from './src/contexts';
import 'react-native-gesture-handler';

const AppContent = () => {
  const { isDark } = useTheme();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={isDark ? "#000000" : "#FFFFFF"} />
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <LocalizationProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LocalizationProvider>
  );
}
