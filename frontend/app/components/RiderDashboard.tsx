import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CampusMap } from './CampusMap';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOW_STYLES } from '../constants/theme';
import { SubscriptionTier } from '../types';

const { width } = Dimensions.get('window');

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: '1',
    name: 'Quick Hitch',
    price: 299,
    rides: 10,
    validity: '1 month',
    features: ['10 rides', 'Standard matching', 'Basic support'],
  },
  {
    id: '2',
    name: 'Mid-Terms',
    price: 799,
    rides: 30,
    validity: '3 months',
    features: ['30 rides', 'Priority matching', 'Premium support', 'Pink Pool access'],
  },
  {
    id: '3',
    name: "Dean's List",
    price: 1499,
    rides: 100,
    validity: '6 months',
    features: ['100 rides', 'VIP matching', '24/7 support', 'All amenities', 'Carbon credits'],
  },
];

const MOCK_DRIVERS = [
  { id: '1', name: 'Rahul Kumar', rating: 4.9, distance: '2.3 km', isFemale: false },
  { id: '2', name: 'Priya Sharma', rating: 4.8, distance: '1.8 km', isFemale: true },
  { id: '3', name: 'Arjun Patel', rating: 4.7, distance: '3.1 km', isFemale: false },
];

interface RiderDashboardProps {
  onSubscribe: (tier: SubscriptionTier) => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ onSubscribe }) => {
  const [pinkPoolEnabled, setPinkPoolEnabled] = React.useState(false);

  const filteredDrivers = pinkPoolEnabled
    ? MOCK_DRIVERS.filter((d) => d.isFemale)
    : MOCK_DRIVERS;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Section 1: Choose Your Plan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SUBSCRIPTION_TIERS.map((tier, index) => (
            <View key={tier.id} style={[styles.tierCard, index === 1 && styles.popularCard]}>
              {index === 1 && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <View style={styles.tierHeader}>
                <Ionicons
                  name={tier.id === '3' ? 'trophy' : tier.id === '2' ? 'star' : 'flash'}
                  size={32}
                  color={COLORS.orange}
                />
                <Text style={styles.tierName}>{tier.name}</Text>
              </View>
              <Text style={styles.tierPrice}>₹{tier.price}</Text>
              <Text style={styles.tierValidity}>{tier.validity}</Text>
              <View style={styles.features}>
                {tier.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => onSubscribe(tier)}
                activeOpacity={0.85}
              >
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Section 2: Pink Pool */}
      <View style={styles.pinkPoolContainer}>
        <LinearGradient
          colors={
            pinkPoolEnabled
              ? [COLORS.pinkPoolGlow, 'transparent']
              : ['transparent', 'transparent']
          }
          style={StyleSheet.absoluteFill}
        />
        <View style={[
          styles.pinkPoolCard,
          pinkPoolEnabled && styles.pinkPoolActive,
        ]}>
          <View style={styles.pinkPoolHeader}>
            <View style={styles.pinkPoolTitleRow}>
              <Ionicons name="shield-checkmark" size={28} color={COLORS.pinkPool} />
              <View style={styles.pinkPoolTitles}>
                <Text style={styles.pinkPoolTitle}>Pink Pool</Text>
                <Text style={styles.pinkPoolBadge}>Women-Only Matching</Text>
              </View>
            </View>
            <Switch
              value={pinkPoolEnabled}
              onValueChange={setPinkPoolEnabled}
              trackColor={{ false: COLORS.cardBorder, true: COLORS.pinkPool }}
              thumbColor={pinkPoolEnabled ? COLORS.white : COLORS.textTertiary}
              ios_backgroundColor={COLORS.cardBorder}
            />
          </View>
          <Text style={styles.pinkPoolDescription}>
            I'm a female and looking mainly for female drivers
          </Text>
          {pinkPoolEnabled && (
            <View style={styles.pinkPoolActive}>
              <Text style={styles.pinkPoolActiveText}>
                ✓ Showing verified female drivers only
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Section 3: Most Used Routes Map */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Used Routes</Text>
        <Text style={styles.sectionSubtitle}>Campus connections and popular paths</Text>
        <CampusMap mode="rider" />
      </View>

      {/* Section 4: Nearby Drivers */}
      <View style={styles.section}>
        <View style={styles.driversHeader}>
          <Text style={styles.sectionTitle}>Nearby Drivers</Text>
          {pinkPoolEnabled && (
            <View style={styles.pinkBadge}>
              <Text style={styles.pinkBadgeText}>Pink Pool Active</Text>
            </View>
          )}
        </View>
        <Text style={styles.sectionSubtitle}>
          {filteredDrivers.length} drivers available now
        </Text>

        {filteredDrivers.map((driver) => (
          <View key={driver.id} style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={28} color={COLORS.orange} />
              {pinkPoolEnabled && driver.isFemale && (
                <View style={styles.femaleBadge}>
                  <Ionicons name="checkmark" size={10} color={COLORS.white} />
                </View>
              )}
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <View style={styles.driverStats}>
                <Ionicons name="star" size={14} color={COLORS.gold} />
                <Text style={styles.driverRating}>{driver.rating}</Text>
                <Text style={styles.driverDistance}>• {driver.distance} away</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.requestButton, SHADOW_STYLES.card]}
              activeOpacity={0.85}
            >
              <Text style={styles.requestButtonText}>Request</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  tierCard: {
    width: width * 0.75,
    marginLeft: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.cardSurface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
    position: 'relative',
  },
  popularCard: {
    borderColor: COLORS.orange,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: SPACING.lg,
    backgroundColor: COLORS.orange,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.pill,
  },
  popularText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tierName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  tierPrice: {
    fontSize: FONTS.sizes.huge,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.orange,
    marginBottom: SPACING.xs,
  },
  tierValidity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  features: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: FONTS.weights.medium,
  },
  subscribeButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  pinkPoolContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  pinkPoolCard: {
    backgroundColor: COLORS.cardSurface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
  },
  pinkPoolActive: {
    borderColor: COLORS.pinkPoolBorder,
    borderWidth: 2,
  },
  pinkPoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pinkPoolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  pinkPoolTitles: {
    flex: 1,
  },
  pinkPoolTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  pinkPoolBadge: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.pinkPool,
    fontWeight: FONTS.weights.semibold,
  },
  pinkPoolDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    lineHeight: 22,
  },
  pinkPoolActiveText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.pinkPool,
    fontWeight: FONTS.weights.semibold,
    marginTop: SPACING.md,
  },
  driversHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  pinkBadge: {
    backgroundColor: COLORS.pinkPoolGlow,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  pinkBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.pinkPool,
    fontWeight: FONTS.weights.bold,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  femaleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.pinkPool,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardSurface,
  },
  driverDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  driverName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  driverRating: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.white,
  },
  driverDistance: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  requestButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  requestButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
});