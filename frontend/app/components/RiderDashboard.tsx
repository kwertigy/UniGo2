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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { GlassContainer } from '../components/GlassContainer';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, NHCE_COORDINATES, COMMON_LOCATIONS } from '../constants/theme';
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
  { id: '1', name: 'Rahul', latitude: 12.9611, longitude: 77.7297 },
  { id: '2', name: 'Priya', latitude: 12.9631, longitude: 77.7337 },
  { id: '3', name: 'Arjun', latitude: 12.9591, longitude: 77.7357 },
];

interface RiderDashboardProps {
  onSubscribe: (tier: SubscriptionTier) => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ onSubscribe }) => {
  const [pinkPoolEnabled, setPinkPoolEnabled] = React.useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Subscription Tiers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SUBSCRIPTION_TIERS.map((tier) => (
            <GlassContainer key={tier.id} style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <Ionicons
                  name={tier.id === '3' ? 'trophy' : tier.id === '2' ? 'star' : 'flash'}
                  size={32}
                  color={COLORS.electricBlue}
                />
                <Text style={styles.tierName}>{tier.name}</Text>
              </View>
              <Text style={styles.tierPrice}>₹{tier.price}</Text>
              <Text style={styles.tierValidity}>{tier.validity}</Text>
              <View style={styles.features}>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.emeraldGreen} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => onSubscribe(tier)}
                activeOpacity={0.8}
              >
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </GlassContainer>
          ))}
        </ScrollView>
      </View>

      {/* Pink Pool Toggle */}
      <GlassContainer style={styles.pinkPoolContainer}>
        <View style={styles.pinkPoolHeader}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.pink} />
          <Text style={styles.pinkPoolTitle}>Pink Pool</Text>
          <Text style={styles.pinkPoolBadge}>Women Only</Text>
        </View>
        <Text style={styles.pinkPoolDescription}>
          Exclusive matching with verified women riders and drivers
        </Text>
        <Switch
          value={pinkPoolEnabled}
          onValueChange={setPinkPoolEnabled}
          trackColor={{ false: COLORS.slate700, true: COLORS.pink }}
          thumbColor={pinkPoolEnabled ? COLORS.white : COLORS.whiteAlpha60}
        />
      </GlassContainer>

      {/* Live Route Matcher */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Rides to Campus</Text>
        <GlassContainer style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: NHCE_COORDINATES.latitude,
              longitude: NHCE_COORDINATES.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            customMapStyle={darkMapStyle}
          >
            {/* Campus Marker */}
            <Marker
              coordinate={NHCE_COORDINATES}
              title="NHCE Campus"
            >
              <View style={styles.campusMarker}>
                <Ionicons name="school" size={24} color={COLORS.white} />
              </View>
            </Marker>

            {/* Driver Markers */}
            {MOCK_DRIVERS.map((driver) => (
              <Marker
                key={driver.id}
                coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
                title={driver.name}
              >
                <View style={styles.driverMarker}>
                  <Ionicons name="car" size={20} color={COLORS.white} />
                </View>
              </Marker>
            ))}

            {/* Route Line */}
            <Polyline
              coordinates={[
                COMMON_LOCATIONS[0],
                NHCE_COORDINATES,
              ]}
              strokeColor={COLORS.electricBlue}
              strokeWidth={3}
            />
          </MapView>
        </GlassContainer>

        {/* Available Drivers */}
        <View style={styles.driversSection}>
          <Text style={styles.driversTitle}>Nearby Drivers</Text>
          {MOCK_DRIVERS.map((driver) => (
            <GlassContainer key={driver.id} style={styles.driverCard}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Ionicons name="person" size={24} color={COLORS.electricBlue} />
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{driver.name}</Text>
                  <View style={styles.driverStats}>
                    <Ionicons name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.driverRating}>4.8</Text>
                    <Text style={styles.driverDistance}>• 2.3 km away</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.requestButton}>
                  <Text style={styles.requestButtonText}>Request</Text>
                </TouchableOpacity>
              </View>
            </GlassContainer>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0c1120' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  tierCard: {
    width: width * 0.75,
    marginLeft: SPACING.md,
    padding: SPACING.lg,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tierName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tierPrice: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.electricBlue,
    marginBottom: SPACING.xs,
  },
  tierValidity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
    marginBottom: SPACING.md,
  },
  features: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha80,
  },
  subscribeButton: {
    backgroundColor: COLORS.electricBlue,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  pinkPoolContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  pinkPoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  pinkPoolTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  pinkPoolBadge: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.pink,
    backgroundColor: COLORS.pink + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    fontWeight: '600',
  },
  pinkPoolDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
    marginBottom: SPACING.md,
  },
  mapContainer: {
    marginHorizontal: SPACING.md,
    height: 300,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  campusMarker: {
    backgroundColor: COLORS.electricBlue,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  driverMarker: {
    backgroundColor: COLORS.emeraldGreen,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  driversSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  driversTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  driverCard: {
    marginBottom: SPACING.sm,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  driverName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  driverRating: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
  },
  driverDistance: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
  },
  requestButton: {
    backgroundColor: COLORS.electricBlue,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  requestButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
});