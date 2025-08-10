import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING;
  touchable?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'MD',
  touchable = false,
  variant = 'default',
  ...touchableProps
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: SPACING[padding] },
    style,
  ];

  if (touchable) {
    return (
      <TouchableOpacity style={cardStyle} activeOpacity={0.8} {...touchableProps}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.LG,
  },
  
  default: {
    backgroundColor: COLORS.CARD,
  },
  
  elevated: {
    backgroundColor: COLORS.CARD,
    ...SHADOWS.MEDIUM,
  },
  
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.TEXT_TERTIARY,
  },
});