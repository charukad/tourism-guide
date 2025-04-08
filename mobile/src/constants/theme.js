import { DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#1E88E5', // Blue
  primaryDark: '#1565C0',
  primaryLight: '#64B5F6',
  accent: '#FF9800', // Orange
  accentDark: '#F57C00',
  accentLight: '#FFB74D',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  error: '#B00020',
  text: '#000000',
  textLight: '#757575',
  disabled: '#9E9E9E',
  placeholder: '#BDBDBD',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  divider: '#EEEEEE',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: colors.backdrop,
  },
  roundness: 8,
};

export const typography = {
  headline1: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  headline2: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  headline3: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  headline4: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  subtitle1: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  subtitle2: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  body1: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  body2: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  button: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
  overline: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: 'normal',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export default {
  colors,
  theme,
  typography,
  spacing,
};