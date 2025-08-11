import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from '../types';
import { GameListScreen, TapTestScreen, ResultScreen } from '../screens/game';
import { SettingsScreen } from '../screens/settings';
import { useThemedColors } from '../hooks';

const Stack = createStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  const colors = useThemedColors();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: colors.BACKGROUND },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
      initialRouteName="GameList"
    >
      <Stack.Screen name="GameList" component={GameListScreen} />
      <Stack.Screen name="TapTest" component={TapTestScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};