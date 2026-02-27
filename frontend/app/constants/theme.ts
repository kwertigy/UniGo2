// CampusPool Soft UI Theme

export const COLORS = {
  // Soft UI Light Mode
  background: '#F7F8FA',
  white: '#FFFFFF',
  
  // Primary Accent
  peach: '#F28C68',
  peachLight: '#FFB199',
  peachDark: '#E86D45',
  
  // System Grays (Apple Style)
  gray1: '#1C1C1E',
  gray2: '#3A3A3C',
  gray3: '#48484A',
  gray4: '#8E8E93',
  gray5: '#C7C7CC',
  gray6: '#E5E5EA',
  
  // Functional
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  blue: '#007AFF',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const FONTS = {
  regular: '-apple-system',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 34,
  },
};

export const COLLEGES = [
  { id: '1', name: 'New Horizon College of Engineering (NHCE)', short: 'NHCE' },
  { id: '2', name: 'RV College of Engineering (RVCE)', short: 'RVCE' },
  { id: '3', name: 'PES University (PESU)', short: 'PESU' },
  { id: '4', name: 'BMS College of Engineering (BMSCE)', short: 'BMSCE' },
  { id: '5', name: 'MS Ramaiah Institute of Technology', short: 'MSRIT' },
];

export const SHADOW_STYLES = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};