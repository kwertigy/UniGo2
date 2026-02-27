// CampusPool Professional Dark Palette

export const COLORS = {
  // Professional Dark Mode
  background: '#000000',
  cardSurface: '#1C1C1E',
  cardBorder: '#2C2C2E',
  elevated: '#2C2C2E',
  
  // Primary Accent
  orange: '#FF6B35',
  orangeLight: '#FF8C61',
  orangeGlow: 'rgba(255, 107, 53, 0.3)',
  
  // Text (Apple System)
  textPrimary: 'rgba(255, 255, 255, 0.9)',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  white: '#FFFFFF',
  
  // Functional
  success: '#32D74B',
  warning: '#FFD60A',
  error: '#FF453A',
  blue: '#0A84FF',
  
  // Glassmorphism
  glassDark: 'rgba(28, 28, 30, 0.8)',
  glassLight: 'rgba(255, 255, 255, 0.1)',
  
  // Gradients
  meshStart: '#0A0A0A',
  meshEnd: '#1A1A1D',
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
  md: 12,
  lg: 16,
  xl: 24,
  pill: 100,
  full: 9999,
};

export const FONTS = {
  family: '-apple-system, SF Pro Display, system-ui',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    huge: 34,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
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
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  elevated: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
};