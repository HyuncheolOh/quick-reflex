import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { GameState } from '../../types';

const { width, height } = Dimensions.get('window');

interface TapButtonProps {
  gameState: GameState;
  onPress: () => void;
  message: string;
  disabled?: boolean;
}

export const TapButton: React.FC<TapButtonProps> = ({
  gameState,
  onPress,
  message,
  disabled = false,
}) => {
  const getButtonColor = () => {
    switch (gameState) {
      case GameState.WAITING:
        return COLORS.GAME_WAITING;
      case GameState.READY:
        return COLORS.GAME_READY;
      case GameState.COUNTDOWN:
        return COLORS.WARNING;
      case GameState.FAILED:
        return COLORS.ERROR;
      case GameState.GAME_COMPLETE:
        return COLORS.SUCCESS;
      default:
        return COLORS.GAME_IDLE;
    }
  };

  const getTextColor = () => {
    return gameState === GameState.READY ? COLORS.BACKGROUND : COLORS.TEXT_PRIMARY;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getButtonColor() },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.XL,
    margin: 16,
  },
  
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  message: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
    lineHeight: 40,
  },
  
  disabled: {
    opacity: 0.6,
  },
});