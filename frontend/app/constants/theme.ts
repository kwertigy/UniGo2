// CampusPool Theme Constants

export const COLORS = {
  // Base
  background: '#020617',
  slate950: '#020617',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  
  // Accent Colors
  electricBlue: '#3b82f6',
  electricBlueDark: '#2563eb',
  emeraldGreen: '#10b981',
  emeraldGreenDark: '#059669',
  
  // UI
  glass: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(0, 0, 0, 0.3)',
  white: '#ffffff',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha60: 'rgba(255, 255, 255, 0.6)',
  whiteAlpha40: 'rgba(255, 255, 255, 0.4)',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  pink: '#ec4899',
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
  full: 9999,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};

export const COLLEGES = [
  { id: '1', name: 'New Horizon College of Engineering (NHCE)', short: 'NHCE' },
  { id: '2', name: 'RV College of Engineering (RVCE)', short: 'RVCE' },
  { id: '3', name: 'PES University (PESU)', short: 'PESU' },
  { id: '4', name: 'BMS College of Engineering (BMSCE)', short: 'BMSCE' },
  { id: '5', name: 'MS Ramaiah Institute of Technology', short: 'MSRIT' },
  { id: '6', name: 'Bangalore Institute of Technology', short: 'BIT' },
];

// NHCE Coordinates (Marathahalli, Bangalore)
export const NHCE_COORDINATES = {
  latitude: 12.9611159,
  longitude: 77.7397419,
};

// Common starting points
export const COMMON_LOCATIONS = [
  { name: 'Indiranagar', latitude: 12.9716, longitude: 77.6412 },
  { name: 'Koramangala', latitude: 12.9352, longitude: 77.6245 },
  { name: 'Whitefield', latitude: 12.9698, longitude: 77.7499 },
  { name: 'Marathahalli', latitude: 12.9591, longitude: 77.7010 },
];