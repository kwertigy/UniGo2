import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from './store/appStore';
import { OnboardingModal } from './components/OnboardingModal';
import { RiderDashboard } from './components/RiderDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { PaymentModal } from './components/PaymentModal';
import { VibeCheckModal } from './components/VibeCheckModal';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOW_STYLES } from './constants/theme';
import { SubscriptionTier, Rating } from './types';

export default function Index() {
  const { user, isOnboarded, mode, setOnboarded, setMode, loadPersistedData } = useAppStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [showVibeCheck, setShowVibeCheck] = useState(false);
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPersistedData().then(() => {
      if (!isOnboarded) {
        setTimeout(() => setShowOnboarding(true), 300);
      }
    });
  }, []);

  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: mode === 'rider' ? 0 : 1,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [mode]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboarded(true);
  };

  const handleSubscribe = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedTier(null);
  };

  const handleRatingSubmit = (rating: Rating) => {
    console.log('Rating submitted:', rating);
    setShowVibeCheck(false);
  };

  const toggleLeft = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['4%', '52%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="car-sport" size={26} color={COLORS.orange} />
          <View>
            <Text style={styles.logoText}>CampusPool</Text>
            {user?.college && (
              <Text style={styles.collegeText}>@ {user.college.short}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Floating Mode Toggle */}
      <View style={styles.toggleContainer}>
        <View style={[styles.togglePill, SHADOW_STYLES.subtle]}>
          <Animated.View
            style={[
              styles.toggleIndicator,
              {
                left: toggleLeft,
                backgroundColor: COLORS.orange,
              },
            ]}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setMode('rider')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, mode === 'rider' && styles.toggleTextActive]}>
              Rider
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setMode('driver')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, mode === 'driver' && styles.toggleTextActive]}>
              Driver
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dashboard Content */}
      <View style={styles.content}>
        {mode === 'rider' ? (
          <RiderDashboard onSubscribe={handleSubscribe} />
        ) : (
          <DriverDashboard />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, SHADOW_STYLES.elevated]}
        onPress={() => setShowVibeCheck(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="star" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modals */}
      <OnboardingModal
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
      <PaymentModal
        visible={showPayment}
        tier={selectedTier}
        onSuccess={handlePaymentSuccess}
        onClose={() => setShowPayment(false)}
      />
      <VibeCheckModal
        visible={showVibeCheck}
        driverName="Rahul"
        onSubmit={handleRatingSubmit}
        onClose={() => setShowVibeCheck(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  collegeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  toggleContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardSurface,
    borderRadius: BORDER_RADIUS.pill,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  toggleIndicator: {
    position: 'absolute',
    width: '46%',
    height: '86%',
    borderRadius: BORDER_RADIUS.pill,
    top: '7%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.semibold,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
