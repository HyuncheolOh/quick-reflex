import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme.constants';

export const useThemedColors = () => {
  const { isDark } = useTheme();
  return isDark ? DARK_COLORS : LIGHT_COLORS;
};