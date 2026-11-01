import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './config';
import type { UserProfile } from '../types';
import { loadUserProfile, saveUserProfile } from '../utils/storage';
import { getUserLevel } from '../utils/rewards';

interface AuthContextType {
  user: User | null;
  profile: UserProfile;
  loading: boolean;
  isFirebaseActive: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginAsGuest: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  awardCleanupReward: (points: number, wasteKg: number) => Promise<void>;
  recordSpotReported: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [loading, setLoading] = useState(true);

  // Sync profile to localStorage whenever it changes
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    const firestore = db;
    if (!isFirebaseConfigured || !auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          } else {
            // First time sign-in: create user profile in Firestore
            const initialProf: UserProfile = {
              id: currentUser.uid,
              name: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Civic Scout'),
              handle: `@${(currentUser.displayName || 'scout').toLowerCase().replace(/\s+/g, '_')}`,
              avatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              points: 0,
              level: 'Civic Scout',
              spotsReported: 0,
              spotsCleaned: 0,
              wasteClearedKg: 0,
              badges: [],
            };
            await setDoc(userDocRef, initialProf);
            setProfile(initialProf);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth not configured');
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth not configured');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) throw new Error('Firebase Auth not configured');
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
  };

  const loginAsGuest = async (name = 'Guest Scout') => {
    if (auth && isFirebaseConfigured) {
      const res = await signInAnonymously(auth);
      await updateProfile(res.user, { displayName: name });
    } else {
      // Local fallback
      const guestProfile: UserProfile = {
        id: `guest_${Date.now()}`,
        name,
        handle: `@${name.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        points: 0,
        level: 'Civic Scout',
        spotsReported: 0,
        spotsCleaned: 0,
        wasteClearedKg: 0,
        badges: [],
      };
      setProfile(guestProfile);
    }
  };

  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
    setUser(null);
  };

  const awardCleanupReward = async (pointsEarned: number, wasteKg: number) => {
    const newPoints = profile.points + pointsEarned;
    const levelInfo = getUserLevel(newPoints);
    const updatedProfile: UserProfile = {
      ...profile,
      points: newPoints,
      level: levelInfo.levelTitle,
      spotsCleaned: profile.spotsCleaned + 1,
      wasteClearedKg: profile.wasteClearedKg + wasteKg,
    };

    setProfile(updatedProfile);

    // Save to Firestore if authenticated
    const firestore = db;
    if (firestore && user && isFirebaseConfigured) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), {
          points: newPoints,
          level: levelInfo.levelTitle,
          spotsCleaned: updatedProfile.spotsCleaned,
          wasteClearedKg: updatedProfile.wasteClearedKg,
        });
      } catch (err) {
        console.error('Error updating Firestore user points:', err);
      }
    }
  };

  const recordSpotReported = async () => {
    const updatedProfile: UserProfile = {
      ...profile,
      spotsReported: profile.spotsReported + 1,
    };
    setProfile(updatedProfile);

    const firestore = db;
    if (firestore && user && isFirebaseConfigured) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), {
          spotsReported: updatedProfile.spotsReported,
        });
      } catch (err) {
        console.error('Error updating Firestore user spots reported:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginAsGuest,
        logout,
        awardCleanupReward,
        recordSpotReported,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
