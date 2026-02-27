import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../components/GlassContainer';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, COLLEGES } from '../constants/theme';
import { useAppStore } from '../store/appStore';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onComplete }) => {
  const [step, setStep] = useState<'college' | 'email' | 'verifying' | 'success'>('college');
  const [selectedCollege, setSelectedCollege] = useState(COLLEGES[0]);
  const [email, setEmail] = useState('');
  const [showCollegeList, setShowCollegeList] = useState(false);
  const { setUser, setCollege } = useAppStore();
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleVerify = () => {
    setStep('verifying');
    setTimeout(() => {
      setStep('success');
      setUser({
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        college: selectedCollege,
        ecoScore: 0,
        verified: true,
      });
      setCollege(selectedCollege);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 2000);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <GlassContainer style={styles.modal}>
          {step === 'college' && (
            <>
              <View style={styles.header}>
                <Ionicons name="school" size={48} color={COLORS.electricBlue} />
                <Text style={styles.title}>Welcome to CampusPool</Text>
                <Text style={styles.subtitle}>Bangalore's Exclusive College Carpooling</Text>
              </View>

              <View style={styles.content}>
                <Text style={styles.label}>Select Your Campus</Text>
                <TouchableOpacity
                  style={styles.collegeSelector}
                  onPress={() => setShowCollegeList(!showCollegeList)}
                >
                  <Text style={styles.collegeName}>{selectedCollege.name}</Text>
                  <Ionicons
                    name={showCollegeList ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={COLORS.electricBlue}
                  />
                </TouchableOpacity>

                {showCollegeList && (
                  <ScrollView style={styles.collegeList}>
                    {COLLEGES.map((college) => (
                      <TouchableOpacity
                        key={college.id}
                        style={[
                          styles.collegeItem,
                          selectedCollege.id === college.id && styles.selectedCollege,
                        ]}
                        onPress={() => {
                          setSelectedCollege(college);
                          setShowCollegeList(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.collegeItemText,
                            selectedCollege.id === college.id && styles.selectedCollegeText,
                          ]}
                        >
                          {college.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setStep('email')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'email' && (
            <>
              <View style={styles.header}>
                <Ionicons name="mail" size={48} color={COLORS.electricBlue} />
                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>Use your .edu email address</Text>
              </View>

              <View style={styles.content}>
                <Text style={styles.campusBadge}>CampusPool @ {selectedCollege.short}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your.name@college.edu"
                  placeholderTextColor={COLORS.whiteAlpha40}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <TouchableOpacity
                  style={[styles.button, !email && styles.buttonDisabled]}
                  onPress={handleVerify}
                  disabled={!email}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Verify Email</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'verifying' && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={COLORS.electricBlue} />
              <Text style={styles.verifyingText}>Verifying your email...</Text>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.centerContent}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.emeraldGreen} />
              <Text style={styles.successText}>Welcome to CampusPool!</Text>
            </View>
          )}
        </GlassContainer>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modal: {
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha60,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  content: {
    gap: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  collegeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.slate900,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.electricBlue,
  },
  collegeName: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
  },
  collegeList: {
    maxHeight: 200,
    backgroundColor: COLORS.slate900,
    borderRadius: BORDER_RADIUS.md,
  },
  collegeItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate800,
  },
  selectedCollege: {
    backgroundColor: COLORS.electricBlue + '20',
  },
  collegeItemText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.whiteAlpha80,
  },
  selectedCollegeText: {
    color: COLORS.electricBlue,
    fontWeight: '600',
  },
  campusBadge: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.electricBlue,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.slate900,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.electricBlue,
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.electricBlue,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  verifyingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    marginTop: SPACING.lg,
  },
  successText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.lg,
  },
});