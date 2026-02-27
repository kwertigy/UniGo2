import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from './store/appStore';
import { OnboardingModal } from './components/OnboardingModal';
import { ModeToggle } from './components/ModeToggle';
import { RiderDashboard } from './components/RiderDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { PaymentModal } from './components/PaymentModal';
import { VibeCheckModal } from './components/VibeCheckModal';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from './constants/theme';
import { SubscriptionTier, Rating } from './types';

export default function Index() {
  const { user, isOnboarded, mode, setOnboarded, loadPersistedData } = useAppStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [showVibeCheck, setShowVibeCheck] = useState(false);

  useEffect(() => {
    loadPersistedData().then(() => {
      if (!isOnboarded) {
        setShowOnboarding(true);
      }
    });
  }, []);

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
    // You could show a success toast here
  };

  const handleRatingSubmit = (rating: Rating) => {
    console.log('Rating submitted:', rating);
    setShowVibeCheck(false);
    // You could send this to the backend
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="school" size={28} color={COLORS.electricBlue} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>CampusPool</Text>
            {user?.college && (
              <Text style={styles.headerSubtitle}>@ {user.college.short}</Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Eco Score */}
          <View style={styles.ecoScoreBadge}>
            <Ionicons name="leaf" size={16} color={COLORS.emeraldGreen} />
            <Text style={styles.ecoScoreText}>{user?.ecoScore || 0}</Text>
          </View>
          {/* Profile */}
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={32} color={COLORS.electricBlue} />
            {user?.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Toggle */}
      <ModeToggle />

      {/* Dashboard Content */}
      <View style={styles.content}>
        {mode === 'rider' ? (
          <RiderDashboard onSubscribe={handleSubscribe} />
        ) : (
          <DriverDashboard />
        )}
      </View>

      {/* Floating Test Button for Vibe Check */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowVibeCheck(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="star" size={24} color={COLORS.white} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate900,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerText: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.electricBlue,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  ecoScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.emeraldGreen + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  ecoScoreText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.emeraldGreen,
  },
  profileButton: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.emeraldGreen,
    borderRadius: BORDER_RADIUS.full,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  content: {
    flex: 1,
    marginTop: SPACING.md,
  },
  floatingButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.warning,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});
