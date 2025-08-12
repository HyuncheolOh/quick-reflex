import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useThemedColors } from '../../hooks';

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
  const colors = useThemedColors();
  
  const getContainerStyle = () => {
    const baseStyle = {
      ...styles.base,
      ...styles[`${size}Container`],
    };
    
    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: colors.PRIMARY };
      case 'secondary':
        return { ...baseStyle, backgroundColor: colors.SECONDARY };
      case 'danger':
        return { ...baseStyle, backgroundColor: colors.ERROR };
      case 'ghost':
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: colors.PRIMARY 
        };
      default:
        return { ...baseStyle, backgroundColor: colors.PRIMARY };
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      ...styles.baseText,
      ...styles[`${size}Text`],
    };
    
    switch (variant) {
      case 'ghost':
        return { ...baseStyle, color: colors.PRIMARY };
      default:
        return { ...baseStyle, color: colors.TEXT_PRIMARY };
    }
  };

  const buttonStyle = [
    getContainerStyle(),
    disabled && { opacity: 0.6 },
    style,
  ];

  const titleStyle = [
    getTextStyle(),
    disabled && { opacity: 0.6 },
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
          color={variant === 'ghost' ? colors.PRIMARY : colors.TEXT_PRIMARY}
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
    borderRadius: BORDER_RADIUS.XL,
    ...SHADOWS.SMALL,
  },
  
  // Container sizes
  smallContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    minHeight: 44,
  },
  mediumContainer: {
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.LG,
    minHeight: 52,
  },
  largeContainer: {
    paddingHorizontal: SPACING.XXL,
    paddingVertical: SPACING.XL,
    minHeight: 60,
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