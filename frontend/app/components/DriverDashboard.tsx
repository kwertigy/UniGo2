import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassContainer } from './GlassContainer';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useAppStore } from '../store/appStore';
import { apiService, DriverRoute, RideRequest as ApiRideRequest, PickupPoint } from '../services/api';

// Common pickup points in Bangalore
const COMMON_PICKUP_POINTS = [
  { name: 'Indiranagar Metro', landmark: 'Near 100ft Road' },
  { name: 'Koramangala BDA Complex', landmark: 'Near Forum Mall' },
  { name: 'MG Road Metro', landmark: 'Exit Gate 1' },
  { name: 'Silk Board Junction', landmark: 'Near Flyover' },
  { name: 'Marathahalli Bridge', landmark: 'Near ORR' },
  { name: 'Whitefield ITPL', landmark: 'Near Main Gate' },
  { name: 'Electronic City Toll', landmark: 'Near Phase 1' },
  { name: 'HSR Layout BDA', landmark: 'Sector 7' },
  { name: 'Bellandur Gate', landmark: 'Near Signal' },
  { name: 'Sarjapur Road Junction', landmark: 'Near Total Mall' },
];

export const DriverDashboard: React.FC = () => {
  const { user } = useAppStore();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('NHCE Campus Gate A');
  const [departureTime, setDepartureTime] = useState('8:30 AM');
  const [availableSeats, setAvailableSeats] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState(50);
  const [selectedPickups, setSelectedPickups] = useState<PickupPoint[]>([]);
  const [showPickupSelector, setShowPickupSelector] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [myActiveRoute, setMyActiveRoute] = useState<DriverRoute | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ApiRideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const driverStreak = 12;
  const totalRides = 47;
  const rating = 4.8;

  // Fetch pending ride requests
  const fetchPendingRequests = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await apiService.getDriverRequests(user.id);
      setPendingRequests(response.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, [user?.id]);

  // Fetch my active route
  const fetchMyActiveRoute = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const routes = await apiService.getActiveRoutes();
      const myRoute = routes.find(r => r.driver_id === user.id);
      setMyActiveRoute(myRoute || null);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPendingRequests(), fetchMyActiveRoute()]);
    setRefreshing(false);
  }, [fetchPendingRequests, fetchMyActiveRoute]);

  useEffect(() => {
    fetchPendingRequests();
    fetchMyActiveRoute();
    
    // Poll for new requests every 10 seconds
    const interval = setInterval(() => {
      fetchPendingRequests();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchPendingRequests, fetchMyActiveRoute]);

  // Add pickup point
  const addPickupPoint = (point: { name: string; landmark?: string }) => {
    // Calculate estimated time based on departure and position
    const baseHour = parseInt(departureTime.split(':')[0]) || 8;
    const baseMin = parseInt(departureTime.split(':')[1]?.split(' ')[0]) || 30;
    const estimatedMinutes = baseMin - (selectedPickups.length + 1) * 10;
    const adjustedHour = estimatedMinutes < 0 ? baseHour - 1 : baseHour;
    const adjustedMin = estimatedMinutes < 0 ? 60 + estimatedMinutes : estimatedMinutes;
    const period = adjustedHour >= 12 ? 'PM' : 'AM';
    const displayHour = adjustedHour > 12 ? adjustedHour - 12 : adjustedHour;
    
    const newPickup: PickupPoint = {
      id: `pickup-${Date.now()}`,
      name: point.name,
      landmark: point.landmark,
      estimatedTime: `${displayHour}:${adjustedMin.toString().padStart(2, '0')} ${period}`,
    };
    
    setSelectedPickups([...selectedPickups, newPickup]);
    setShowPickupSelector(false);
  };

  // Remove pickup point
  const removePickupPoint = (id: string) => {
    setSelectedPickups(selectedPickups.filter(p => p.id !== id));
  };

  // Publish route
  const handlePublishRoute = async () => {
    if (!user?.id || !origin || !departureTime) {
      Alert.alert('Missing Info', 'Please fill in your starting location and departure time');
      return;
    }
    
    if (selectedPickups.length === 0) {
      Alert.alert('Add Pickups', 'Please add at least one pickup point for riders');
      return;
    }
    
    setIsPublishing(true);
    
    try {
      const route = await apiService.createDriverRoute({
        driver_id: user.id,
        driver_name: user.name,
        origin,
        destination,
        departure_time: departureTime,
        direction: 'to_college',
        available_seats: availableSeats,
        price_per_seat: pricePerSeat,
        amenities: ['AC', 'Music'],
        pickup_points: selectedPickups,
      });
      
      setMyActiveRoute(route);
      Alert.alert('Success!', 'Your route has been published. Riders can now see your pickup points!');
      
      // Reset form
      setOrigin('');
      setSelectedPickups([]);
    } catch (error) {
      console.error('Error publishing route:', error);
      Alert.alert('Error', 'Failed to publish route. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Accept ride request
  const handleAcceptRequest = async (request: ApiRideRequest) => {
    try {
      await apiService.acceptRideRequest(request.id);
      Alert.alert('Accepted!', `You accepted ${request.rider_name}'s ride request. Pick them up at ${request.pickup_location}`);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  // Reject ride request
  const handleRejectRequest = async (request: ApiRideRequest) => {
    try {
      await apiService.rejectRideRequest(request.id);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  // Deactivate route
  const handleDeactivateRoute = async () => {
    if (!myActiveRoute) return;
    
    try {
      await apiService.deactivateRoute(myActiveRoute.id);
      setMyActiveRoute(null);
      Alert.alert('Route Cancelled', 'Your route has been deactivated');
    } catch (error) {
      console.error('Error deactivating route:', error);
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
      {/* Driver Profile & Stats */}
      <GlassContainer style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={COLORS.emeraldGreen} />
            <View style={styles.eliteBadge}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Elite Host'}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color={COLORS.warning} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              <Text style={styles.rideCount}>• {totalRides} rides</Text>
            </View>
          </View>
        </View>

        {/* Incentive Tracker */}
        <View style={styles.incentiveSection}>
          <View style={styles.incentiveHeader}>
            <Text style={styles.incentiveTitle}>VIP Campus Parking Progress</Text>
            <Text style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color={COLORS.warning} />
              {' '}{driverStreak} day streak
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(driverStreak / 30) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{driverStreak}/30 days to unlock VIP parking</Text>
        </View>
      </GlassContainer>

      {/* Active Route Status */}
      {myActiveRoute && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Active Route</Text>
          <GlassContainer style={styles.activeRouteCard}>
            <View style={styles.activeRouteHeader}>
              <View style={styles.statusBadge}>
                <View style={styles.liveIndicator} />
                <Text style={styles.statusText}>LIVE</Text>
              </View>
              <TouchableOpacity onPress={handleDeactivateRoute} style={styles.cancelButton}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.routeDetails}>
              <View style={styles.routePoint}>
                <Ionicons name="location" size={18} color={COLORS.emeraldGreen} />
                <Text style={styles.routeText}>{myActiveRoute.origin}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <Ionicons name="flag" size={18} color={COLORS.orange} />
                <Text style={styles.routeText}>{myActiveRoute.destination}</Text>
              </View>
            </View>
            
            <View style={styles.routeInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color={COLORS.whiteAlpha60} />
                <Text style={styles.infoText}>{myActiveRoute.departure_time}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people" size={16} color={COLORS.whiteAlpha60} />
                <Text style={styles.infoText}>{myActiveRoute.available_seats} seats</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.priceText}>₹{myActiveRoute.price_per_seat}/seat</Text>
              </View>
            </View>
            
            {myActiveRoute.pickup_points && myActiveRoute.pickup_points.length > 0 && (
              <View style={styles.pickupsPreview}>
                <Text style={styles.pickupsLabel}>Pickup Points:</Text>
                {myActiveRoute.pickup_points.map((pickup, index) => (
                  <View key={pickup.id} style={styles.pickupPreviewItem}>
                    <Text style={styles.pickupNumber}>{index + 1}</Text>
                    <Text style={styles.pickupPreviewText}>{pickup.name} • {pickup.estimatedTime}</Text>
                  </View>
                ))}
              </View>
            )}
          </GlassContainer>
        </View>
      )}

      {/* Pending Ride Requests */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ride Requests</Text>
          <Text style={styles.sectionSubtitle}>{pendingRequests.length} riders want to join</Text>
          
          {pendingRequests.map((request) => (
            <GlassContainer key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.riderInfo}>
                  <View style={styles.riderAvatar}>
                    <Ionicons name="person" size={24} color={COLORS.electricBlue} />
                  </View>
                  <View>
                    <Text style={styles.riderName}>{request.rider_name}</Text>
                    <Text style={styles.requestPickup}>
                      <Ionicons name="location" size={12} color={COLORS.emeraldGreen} />
                      {' '}{request.pickup_location}
                    </Text>
                  </View>
                </View>
                <Text style={styles.requestTime}>{request.pickup_time || 'Soon'}</Text>
              </View>
              
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => handleRejectRequest(request)}
                >
                  <Ionicons name="close" size={20} color={COLORS.error} />
                  <Text style={styles.rejectText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(request)}
                >
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </GlassContainer>
          ))}
        </View>
      )}

      {/* Route Publisher - Only show if no active route */}
      {!myActiveRoute && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publish Your Route</Text>
          <Text style={styles.sectionSubtitle}>Set your pickup points for riders to join</Text>
          
          <GlassContainer style={styles.routeForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Starting Location</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="home" size={20} color={COLORS.emeraldGreen} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Indiranagar"
                  placeholderTextColor={COLORS.whiteAlpha40}
                  value={origin}
                  onChangeText={setOrigin}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus Destination</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="school" size={20} color={COLORS.orange} />
                <TextInput
                  style={styles.input}
                  placeholder="Campus Gate A"
                  placeholderTextColor={COLORS.whiteAlpha40}
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.label}>Departure Time</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="time" size={20} color={COLORS.electricBlue} />
                  <TextInput
                    style={styles.input}
                    placeholder="8:30 AM"
                    placeholderTextColor={COLORS.whiteAlpha40}
                    value={departureTime}
                    onChangeText={setDepartureTime}
                  />
                </View>
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Seats Available</Text>
                <View style={styles.seatsContainer}>
                  <TouchableOpacity 
                    style={styles.seatButton}
                    onPress={() => setAvailableSeats(Math.max(1, availableSeats - 1))}
                  >
                    <Ionicons name="remove" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                  <Text style={styles.seatsText}>{availableSeats}</Text>
                  <TouchableOpacity 
                    style={styles.seatButton}
                    onPress={() => setAvailableSeats(Math.min(6, availableSeats + 1))}
                  >
                    <Ionicons name="add" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Price per seat */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price per Seat (₹)</Text>
              <View style={styles.priceContainer}>
                {[30, 50, 75, 100].map((price) => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.priceOption,
                      pricePerSeat === price && styles.priceOptionActive,
                    ]}
                    onPress={() => setPricePerSeat(price)}
                  >
                    <Text style={[
                      styles.priceOptionText,
                      pricePerSeat === price && styles.priceOptionTextActive,
                    ]}>
                      ₹{price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pickup Points Section */}
            <View style={styles.pickupsSection}>
              <View style={styles.pickupsHeader}>
                <Text style={styles.label}>Pickup Points Along Your Route</Text>
                <TouchableOpacity 
                  style={styles.addPickupButton}
                  onPress={() => setShowPickupSelector(true)}
                >
                  <Ionicons name="add-circle" size={24} color={COLORS.emeraldGreen} />
                  <Text style={styles.addPickupText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {selectedPickups.length === 0 ? (
                <View style={styles.emptyPickups}>
                  <Ionicons name="location-outline" size={32} color={COLORS.whiteAlpha40} />
                  <Text style={styles.emptyPickupsText}>
                    Add pickup points where riders can join
                  </Text>
                </View>
              ) : (
                <View style={styles.pickupsList}>
                  {selectedPickups.map((pickup, index) => (
                    <View key={pickup.id} style={styles.pickupItem}>
                      <View style={styles.pickupLeft}>
                        <View style={styles.pickupNumberBadge}>
                          <Text style={styles.pickupNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.pickupDetails}>
                          <Text style={styles.pickupName}>{pickup.name}</Text>
                          <Text style={styles.pickupTime}>
                            <Ionicons name="time-outline" size={12} color={COLORS.emeraldGreen} />
                            {' '}{pickup.estimatedTime}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removePickupPoint(pickup.id)}>
                        <Ionicons name="close-circle" size={24} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]} 
              onPress={handlePublishRoute}
              disabled={isPublishing}
              activeOpacity={0.8}
            >
              {isPublishing ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <MaterialCommunityIcons name="publish" size={20} color={COLORS.white} />
                  <Text style={styles.publishButtonText}>Publish Route</Text>
                </>
              )}
            </TouchableOpacity>
          </GlassContainer>
        </View>
      )}

      {/* Pickup Point Selector Modal */}
      {showPickupSelector && (
        <View style={styles.modalOverlay}>
          <GlassContainer style={styles.pickupModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Pickup Point</Text>
              <TouchableOpacity onPress={() => setShowPickupSelector(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.pickupOptions}>
              {COMMON_PICKUP_POINTS.filter(
                p => !selectedPickups.find(sp => sp.name === p.name)
              ).map((point) => (
                <TouchableOpacity
                  key={point.name}
                  style={styles.pickupOption}
                  onPress={() => addPickupPoint(point)}
                >
                  <Ionicons name="location" size={20} color={COLORS.emeraldGreen} />
                  <View style={styles.pickupOptionInfo}>
                    <Text style={styles.pickupOptionName}>{point.name}</Text>
                    {point.landmark && (
                      <Text style={styles.pickupOptionLandmark}>{point.landmark}</Text>
                    )}
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color={COLORS.orange} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </GlassContainer>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  profileCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate800,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eliteBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.slate900,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  rideCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
  },
  incentiveSection: {
    marginTop: SPACING.md,
  },
  incentiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  incentiveTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  streakBadge: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warning,
    fontWeight: '600' as const,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.slate800,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.emeraldGreen,
  },
  progressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
  },
  activeRouteCard: {
    marginHorizontal: SPACING.md,
    padding: SPACING.lg,
  },
  activeRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emeraldGreen + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.pill,
    gap: SPACING.xs,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emeraldGreen,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold' as const,
    color: COLORS.emeraldGreen,
  },
  cancelButton: {
    padding: SPACING.xs,
  },
  routeDetails: {
    marginBottom: SPACING.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.slate700,
    marginLeft: 8,
    marginVertical: SPACING.xs,
  },
  routeText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
  },
  priceText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold' as const,
    color: COLORS.emeraldGreen,
  },
  pickupsPreview: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  pickupsLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
    marginBottom: SPACING.sm,
  },
  pickupPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  pickupNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.emeraldGreen,
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold' as const,
    textAlign: 'center',
    lineHeight: 20,
  },
  pickupPreviewText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
  },
  requestCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.electricBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginBottom: 2,
  },
  requestPickup: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
  },
  requestTime: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600' as const,
    color: COLORS.orange,
  },
  requestActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  rejectText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.emeraldGreen,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  acceptButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  routeForm: {
    marginHorizontal: SPACING.md,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha80,
    marginBottom: SPACING.sm,
    fontWeight: '600' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate900,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  input: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.slate900,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  seatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatsText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priceOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  priceOptionActive: {
    backgroundColor: COLORS.emeraldGreen + '20',
    borderColor: COLORS.emeraldGreen,
  },
  priceOptionText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600' as const,
    color: COLORS.whiteAlpha60,
  },
  priceOptionTextActive: {
    color: COLORS.emeraldGreen,
  },
  pickupsSection: {
    marginTop: SPACING.md,
  },
  pickupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addPickupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addPickupText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.emeraldGreen,
    fontWeight: '600' as const,
  },
  emptyPickups: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.slate900,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
  },
  emptyPickupsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha40,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  pickupsList: {
    gap: SPACING.sm,
  },
  pickupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.slate900,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.emeraldGreen + '40',
  },
  pickupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  pickupNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.emeraldGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupNumberText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  pickupDetails: {
    flex: 1,
  },
  pickupName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  pickupTime: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.emeraldGreen,
    marginTop: 2,
  },
  publishButton: {
    backgroundColor: COLORS.emeraldGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  pickupModal: {
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  pickupOptions: {
    maxHeight: 300,
  },
  pickupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.slate900,
    marginBottom: SPACING.sm,
  },
  pickupOptionInfo: {
    flex: 1,
  },
  pickupOptionName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  pickupOptionLandmark: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
    marginTop: 2,
  },
});
