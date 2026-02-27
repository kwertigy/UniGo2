import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CampusMap } from './CampusMap';
import { GlassContainer } from './GlassContainer';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOW_STYLES } from '../constants/theme';
import { SubscriptionTier, PickupPoint } from '../types';
import { useAppStore } from '../store/appStore';
import { apiService, DriverRoute } from '../services/api';

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

interface RiderDashboardProps {
  onSubscribe: (tier: SubscriptionTier) => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ onSubscribe }) => {
  const { user } = useAppStore();
  const [pinkPoolEnabled, setPinkPoolEnabled] = useState(false);
  const [availableRides, setAvailableRides] = useState<DriverRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRide, setSelectedRide] = useState<DriverRoute | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // Fetch available rides
  const fetchAvailableRides = useCallback(async () => {
    try {
      setIsLoading(true);
      const routes = await apiService.getActiveRoutes();
      setAvailableRides(routes);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAvailableRides();
    setRefreshing(false);
  }, [fetchAvailableRides]);

  useEffect(() => {
    fetchAvailableRides();
    
    // Poll for new rides every 15 seconds
    const interval = setInterval(fetchAvailableRides, 15000);
    return () => clearInterval(interval);
  }, [fetchAvailableRides]);

  // Request a ride
  const handleRequestRide = async () => {
    if (!user?.id || !selectedRide || !selectedPickup) {
      Alert.alert('Error', 'Please select a pickup point');
      return;
    }

    setIsRequesting(true);
    try {
      await apiService.createRideRequest({
        rider_id: user.id,
        rider_name: user.name,
        driver_id: selectedRide.driver_id,
        driver_name: selectedRide.driver_name,
        route_id: selectedRide.id,
        pickup_location: selectedPickup.name,
        pickup_time: selectedPickup.estimatedTime,
      });

      Alert.alert(
        'Request Sent!',
        `Your ride request has been sent to ${selectedRide.driver_name}. You'll be notified when they accept.`,
        [{ text: 'OK', onPress: () => setSelectedRide(null) }]
      );
    } catch (error) {
      console.error('Error requesting ride:', error);
      Alert.alert('Error', 'Failed to send ride request. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />
      }
    >
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
            <View style={styles.pinkPoolActiveIndicator}>
              <Text style={styles.pinkPoolActiveText}>
                ✓ Showing verified female drivers only
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Section 3: Available Rides */}
      <View style={styles.section}>
        <View style={styles.availableHeader}>
          <Text style={styles.sectionTitle}>Available Rides</Text>
          {isLoading && <ActivityIndicator size="small" color={COLORS.orange} />}
        </View>
        <Text style={styles.sectionSubtitle}>
          {availableRides.length} rides heading to campus • Pull to refresh
        </Text>

        {availableRides.length === 0 ? (
          <GlassContainer style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color={COLORS.whiteAlpha40} />
            <Text style={styles.emptyStateTitle}>No rides available yet</Text>
            <Text style={styles.emptyStateText}>
              Pull down to refresh or check back later
            </Text>
          </GlassContainer>
        ) : (
          availableRides.map((ride) => (
            <GlassContainer key={ride.id} style={styles.rideCard}>
              {/* Driver Info */}
              <View style={styles.rideHeader}>
                <View style={styles.driverInfo}>
                  <View style={styles.driverAvatar}>
                    <Ionicons name="person" size={28} color={COLORS.orange} />
                  </View>
                  <View>
                    <Text style={styles.driverName}>{ride.driver_name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={COLORS.gold} />
                      <Text style={styles.ratingText}>4.8</Text>
                      <Text style={styles.seatsText}>• {ride.available_seats} seats left</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceAmount}>₹{ride.price_per_seat}</Text>
                  <Text style={styles.priceLabel}>/seat</Text>
                </View>
              </View>

              {/* Route */}
              <View style={styles.routeSection}>
                <View style={styles.routePoint}>
                  <Ionicons name="location" size={18} color={COLORS.emeraldGreen} />
                  <Text style={styles.routeText}>{ride.origin}</Text>
                </View>
                <View style={styles.routeLine}>
                  <View style={styles.routeDots} />
                </View>
                <View style={styles.routePoint}>
                  <Ionicons name="school" size={18} color={COLORS.orange} />
                  <Text style={styles.routeText}>{ride.destination}</Text>
                </View>
              </View>

              {/* Departure Time */}
              <View style={styles.departureInfo}>
                <Ionicons name="time" size={16} color={COLORS.electricBlue} />
                <Text style={styles.departureText}>Arrives at campus by {ride.departure_time}</Text>
              </View>

              {/* Pickup Points */}
              {ride.pickup_points && ride.pickup_points.length > 0 && (
                <View style={styles.pickupsSection}>
                  <Text style={styles.pickupsTitle}>Select Your Pickup Point</Text>
                  <View style={styles.pickupsList}>
                    {ride.pickup_points.map((pickup, index) => (
                      <TouchableOpacity
                        key={pickup.id}
                        style={[
                          styles.pickupOption,
                          selectedRide?.id === ride.id && 
                          selectedPickup?.id === pickup.id && 
                          styles.pickupOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedRide(ride);
                          setSelectedPickup(pickup);
                        }}
                      >
                        <View style={styles.pickupLeft}>
                          <View style={[
                            styles.pickupNumber,
                            selectedRide?.id === ride.id && 
                            selectedPickup?.id === pickup.id && 
                            styles.pickupNumberSelected,
                          ]}>
                            <Text style={styles.pickupNumberText}>{index + 1}</Text>
                          </View>
                          <View>
                            <Text style={styles.pickupName}>{pickup.name}</Text>
                            {pickup.landmark && (
                              <Text style={styles.pickupLandmark}>{pickup.landmark}</Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.pickupTime}>
                          <Ionicons name="time-outline" size={14} color={COLORS.emeraldGreen} />
                          <Text style={styles.pickupTimeText}>{pickup.estimatedTime}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Request Button */}
              <TouchableOpacity
                style={[
                  styles.requestButton,
                  selectedRide?.id !== ride.id && styles.requestButtonDisabled,
                  SHADOW_STYLES.card,
                ]}
                onPress={handleRequestRide}
                disabled={selectedRide?.id !== ride.id || isRequesting}
                activeOpacity={0.85}
              >
                {isRequesting && selectedRide?.id === ride.id ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="hand-right" size={20} color={COLORS.white} />
                    <Text style={styles.requestButtonText}>
                      {selectedRide?.id === ride.id && selectedPickup
                        ? `Request Pickup at ${selectedPickup.name}`
                        : 'Select a Pickup Point'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </GlassContainer>
          ))
        )}
      </View>

      {/* Section 4: Most Used Routes Map */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Routes</Text>
        <Text style={styles.sectionSubtitle}>Campus connections and popular paths</Text>
        <CampusMap mode="rider" />
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
    fontWeight: 'bold' as const,
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
  availableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
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
    fontWeight: 'bold' as const,
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
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  tierPrice: {
    fontSize: FONTS.sizes.huge,
    fontWeight: 'bold' as const,
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
    fontWeight: '500' as const,
  },
  subscribeButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold' as const,
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
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  pinkPoolBadge: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.pinkPool,
    fontWeight: '600' as const,
  },
  pinkPoolDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    lineHeight: 22,
  },
  pinkPoolActiveIndicator: {
    marginTop: SPACING.md,
  },
  pinkPoolActiveText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.pinkPool,
    fontWeight: '600' as const,
  },
  emptyState: {
    marginHorizontal: SPACING.md,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  rideCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  seatsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  priceTag: {
    backgroundColor: COLORS.emeraldGreen + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold' as const,
    color: COLORS.emeraldGreen,
  },
  priceLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.emeraldGreen,
  },
  routeSection: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  routeLine: {
    marginLeft: 9,
    paddingVertical: SPACING.xs,
  },
  routeDots: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.slate700,
  },
  routeText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
  },
  departureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  departureText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.electricBlue,
    fontWeight: '500' as const,
  },
  pickupsSection: {
    marginBottom: SPACING.md,
  },
  pickupsTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha80,
    marginBottom: SPACING.sm,
    fontWeight: '600' as const,
  },
  pickupsList: {
    gap: SPACING.sm,
  },
  pickupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.slate900,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  pickupOptionSelected: {
    borderColor: COLORS.emeraldGreen,
    backgroundColor: COLORS.emeraldGreen + '10',
  },
  pickupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  pickupNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupNumberSelected: {
    backgroundColor: COLORS.emeraldGreen,
  },
  pickupNumberText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  pickupName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  pickupLandmark: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.whiteAlpha60,
    marginTop: 2,
  },
  pickupTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pickupTimeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.emeraldGreen,
    fontWeight: '600' as const,
  },
  requestButton: {
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  requestButtonDisabled: {
    backgroundColor: COLORS.cardBorder,
  },
  requestButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
});
