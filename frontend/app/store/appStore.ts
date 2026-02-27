import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserMode = 'rider' | 'driver';

interface College {
  id: string;
  name: string;
  short: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  college: College | null;
  ecoScore: number;
  verified: boolean;
}

interface AppState {
  // User & Auth
  user: User | null;
  isOnboarded: boolean;
  mode: UserMode;
  
  // Actions
  setUser: (user: User) => void;
  setOnboarded: (value: boolean) => void;
  setMode: (mode: UserMode) => void;
  setCollege: (college: College) => void;
  
  // Persist
  loadPersistedData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isOnboarded: false,
  mode: 'rider',
  
  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem('user', JSON.stringify(user));
  },
  
  setOnboarded: (value) => {
    set({ isOnboarded: value });
    AsyncStorage.setItem('isOnboarded', JSON.stringify(value));
  },
  
  setMode: (mode) => {
    set({ mode });
    AsyncStorage.setItem('mode', mode);
  },
  
  setCollege: (college) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, college };
      set({ user: updatedUser });
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  },
  
  loadPersistedData: async () => {
    try {
      const [userStr, onboardedStr, mode] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('isOnboarded'),
        AsyncStorage.getItem('mode'),
      ]);
      
      if (userStr) set({ user: JSON.parse(userStr) });
      if (onboardedStr) set({ isOnboarded: JSON.parse(onboardedStr) });
      if (mode) set({ mode: mode as UserMode });
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  },
}));