import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    disabled && styles.disabledContainer,
    style,
  ];

  const titleStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' ? COLORS.PRIMARY : COLORS.TEXT_PRIMARY}
        />
      ) : (
        <Text style={titleStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.LG,
    ...SHADOWS.SMALL,
  },
  
  // Container variants
  primaryContainer: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryContainer: {
    backgroundColor: COLORS.SECONDARY,
  },
  dangerContainer: {
    backgroundColor: COLORS.ERROR,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    ...SHADOWS.SMALL,
  },
  
  // Container sizes
  smallContainer: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minHeight: 36,
  },
  mediumContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    minHeight: 44,
  },
  largeContainer: {
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.LG,
    minHeight: 52,
  },
  
  // Disabled state
  disabledContainer: {
    opacity: 0.5,
  },
  
  // Base text
  baseText: {
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
  },
  
  // Text variants
  primaryText: {
    color: COLORS.TEXT_PRIMARY,
  },
  secondaryText: {
    color: COLORS.TEXT_PRIMARY,
  },
  dangerText: {
    color: COLORS.TEXT_PRIMARY,
  },
  ghostText: {
    color: COLORS.PRIMARY,
  },
  
  // Text sizes
  smallText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
  },
  largeText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
  },
  
  // Disabled text
  disabledText: {
    opacity: 0.7,
  },
});