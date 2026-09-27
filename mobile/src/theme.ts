import type { ViewStyle } from 'react-native';

export const colors = {
  bg: '#101010',
  card: '#1C1C1E',
  accent: '#0A84FF',
  accentDark: '#64B5F6',
  accentSoft: '#152538',
  text: '#F4F4F5',
  textBody: '#9A9AA0',
  textMuted: '#8E8E93',
  border: 'rgba(255, 255, 255, 0.10)',
  success: '#30D158',
  successSoft: '#12271A',
  successText: '#32D74B',
  amber: '#FF9F0A',
  amberSoft: '#2C220E',
  red: '#FF453A',
  bubbleBot: '#2C2C2E',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  pill: 999,
};

export const cardShadow: ViewStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.4,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
