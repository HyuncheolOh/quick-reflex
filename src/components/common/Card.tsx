import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
} from 'react-native';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useThemedColors } from '../../hooks';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING;
  touchable?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'LG',
  touchable = false,
  variant = 'default',
  ...touchableProps
}) => {
  const colors = useThemedColors();
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return { 
          backgroundColor: colors.CARD,
          ...SHADOWS.SMALL,
        };
      case 'elevated':
        return { 
          backgroundColor: colors.CARD, 
          ...SHADOWS.MEDIUM,
        };
      case 'outlined':
        return { 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: colors.TEXT_TERTIARY,
          ...SHADOWS.NONE,
        };
      case 'ghost':
        return { 
          backgroundColor: colors.SURFACE,
          ...SHADOWS.NONE,
        };
      default:
        return { 
          backgroundColor: colors.CARD,
          ...SHADOWS.SMALL,
        };
    }
  };
  
  const cardStyle = [
    styles.base,
    getVariantStyle(),
    { padding: SPACING[padding] },
    style,
  ];

  if (touchable) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        activeOpacity={0.95}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.XL,
  },
});