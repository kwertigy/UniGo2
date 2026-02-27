import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../constants/theme';
import { Svg, Path, Circle, Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface CampusMapProps {
  mode: 'rider' | 'driver';
}

export const CampusMap: React.FC<CampusMapProps> = ({ mode }) => {
  return (
    <View style={styles.container}>
      <View style={styles.mapCard}>
        <Svg width="100%" height="100%" viewBox="0 0 320 240">
          <Defs>
            <SvgGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#0A84FF" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#0A84FF" stopOpacity="0.3" />
            </SvgGradient>
          </Defs>

          {/* Background grid */}
          {[...Array(8)].map((_, i) => (
            <Line
              key={`v${i}`}
              x1={i * 40}
              y1="0"
              x2={i * 40}
              y2="240"
              stroke={COLORS.cardBorder}
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <Line
              key={`h${i}`}
              x1="0"
              y1={i * 40}
              x2="320"
              y2={i * 40}
              stroke={COLORS.cardBorder}
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}

          {/* Possible Routes (dashed gray) */}
          <Path
            d="M 40,180 L 100,160 L 160,180 L 220,160"
            stroke={COLORS.textTertiary}
            strokeWidth="2"
            strokeDasharray="4,4"
            fill="none"
            opacity="0.4"
          />
          <Path
            d="M 80,200 L 120,180 L 180,200 L 240,180"
            stroke={COLORS.textTertiary}
            strokeWidth="2"
            strokeDasharray="4,4"
            fill="none"
            opacity="0.4"
          />

          {/* Most Used Routes (glowing blue) */}
          <Path
            d="M 40,120 Q 80,80 160,120 T 280,120"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            fill="none"
            opacity="1"
          />
          <Path
            d="M 60,140 L 140,100 L 220,140 L 260,100"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            fill="none"
            opacity="0.8"
          />

          {/* Campus location */}
          <Circle cx="160" cy="80" r="20" fill={COLORS.orange} opacity="0.2" />
          <Circle cx="160" cy="80" r="12" fill={COLORS.orange} />

          {/* Starting points */}
          <Circle cx="40" cy="120" r="6" fill={COLORS.blue} />
          <Circle cx="60" cy="140" r="6" fill={COLORS.blue} />
          <Circle cx="280" cy="120" r="6" fill={COLORS.blue} />
        </Svg>

        {/* Campus Label */}
        <View style={styles.campusLabel}>
          <Ionicons name="school" size={16} color={COLORS.white} />
          <Text style={styles.campusText}>NHCE Campus</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: COLORS.blue }]} />
            <Text style={styles.legendText}>Most Used Routes</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: COLORS.textTertiary, opacity: 0.5 }]} />
            <Text style={styles.legendText}>Possible Routes</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  mapCard: {
    height: 260,
    backgroundColor: COLORS.cardSurface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    position: 'relative',
  },
  campusLabel: {
    position: 'absolute',
    top: 60,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.orange,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  campusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  legend: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.cardSurface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: FONTS.weights.medium,
  },
});