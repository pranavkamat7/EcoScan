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
import { loadUserProfile, saveUserProfile, clearUserProfile } from '../utils/storage';
import { GUEST_USER } from '../data/initialSpots';
import { getUserLevel } from '../utils/rewards';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginAsGuest: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  awardCleanupReward: (points: number, wasteKg: number) => Promise<void>;
  recordSpotReported: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => loadUserProfile());
  const [loading, setLoading] = useState(true);

  // Sync profile to storage
  useEffect(() => {
    if (profile && profile.id !== 'guest' && profile.id !== 'user_current') {
      saveUserProfile(profile);
    }
  }, [profile]);

  useEffect(() => {
    const firestore = db;
    if (!isFirebaseConfigured || !auth) {
      // If Firebase is not configured or in guest mode, load cached real profile if exists
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser && !currentUser.isAnonymous) {
        try {
          if (firestore) {
            const userDocRef = doc(firestore, 'users', currentUser.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              setProfile(data);
              saveUserProfile(data);
            } else {
              // First time sign-in: create user profile in Firestore
              const cleanName =
                currentUser.displayName ||
                (currentUser.email ? currentUser.email.split('@')[0] : 'Civic Scout');
              const cleanHandle = `@${cleanName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
              const initialProf: UserProfile = {
                id: currentUser.uid,
                name: cleanName,
                handle: cleanHandle,
                avatar:
                  currentUser.photoURL ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.uid)}`,
                points: 0,
                level: 'Civic Scout',
                spotsReported: 0,
                spotsCleaned: 0,
                wasteClearedKg: 0,
                badges: [],
              };
              await setDoc(userDocRef, initialProf);
              setProfile(initialProf);
              saveUserProfile(initialProf);
            }
          } else {
            // Local fallback for authenticated user
            const cleanName =
              currentUser.displayName ||
              (currentUser.email ? currentUser.email.split('@')[0] : 'Civic Scout');
            const fallbackProf: UserProfile = {
              id: currentUser.uid,
              name: cleanName,
              handle: `@${cleanName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
              avatar:
                currentUser.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.uid)}`,
              points: 0,
              level: 'Civic Scout',
              spotsReported: 0,
              spotsCleaned: 0,
              wasteClearedKg: 0,
              badges: [],
            };
            setProfile(fallbackProf);
            saveUserProfile(fallbackProf);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
        }
      } else if (currentUser && currentUser.isAnonymous) {
        // Anonymous Firebase session
        setProfile({
          ...GUEST_USER,
          id: currentUser.uid,
          name: currentUser.displayName || 'Guest Volunteer',
        });
      } else {
        // Logged out
        setProfile(null);
        clearUserProfile();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not configured.');
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
  };

  const loginAsGuest = async (name = 'Guest Volunteer') => {
    sessionStorage.setItem('ecoscan_guest_session', 'true');
    if (auth && isFirebaseConfigured) {
      try {
        const res = await signInAnonymously(auth);
        if (res.user) {
          await updateProfile(res.user, { displayName: name });
          return;
        }
      } catch (err) {
        console.warn('Firebase anonymous auth not enabled; using local guest profile:', err);
      }
    }

    // Check if customized guest profile exists
    try {
      const savedGuest = localStorage.getItem('ecoscan_guest_custom') || localStorage.getItem('garbagemedia_guest_custom');
      if (savedGuest) {
        const parsed = JSON.parse(savedGuest);
        if (parsed && parsed.name) {
          setProfile(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Local guest profile
    const guestProf: UserProfile = {
      ...GUEST_USER,
      id: `guest_${Date.now()}`,
      name,
    };
    setProfile(guestProf);
  };

  const logout = async () => {
    try {
      if (auth && isFirebaseConfigured) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUser(null);
    setProfile(null);
    clearUserProfile();
    sessionStorage.removeItem('ecoscan_guest_session');
    sessionStorage.removeItem('garbagemedia_guest_session');
  };

  const awardCleanupReward = async (pointsEarned: number, wasteKg: number) => {
    if (!profile) return;
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
    if (updatedProfile.id !== 'guest') {
      saveUserProfile(updatedProfile);
    }

    // Save to Firestore if authenticated real user
    const firestore = db;
    if (firestore && user && !user.isAnonymous && isFirebaseConfigured) {
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
    if (!profile) return;
    const updatedProfile: UserProfile = {
      ...profile,
      spotsReported: profile.spotsReported + 1,
    };
    setProfile(updatedProfile);
    if (updatedProfile.id !== 'guest') {
      saveUserProfile(updatedProfile);
    }

    const firestore = db;
    if (firestore && user && !user.isAnonymous && isFirebaseConfigured) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), {
          spotsReported: updatedProfile.spotsReported,
        });
      } catch (err) {
        console.error('Error updating Firestore user spots reported:', err);
      }
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const current = profile || GUEST_USER;
    const formattedHandle = updates.handle
      ? (updates.handle.startsWith('@') ? updates.handle : `@${updates.handle}`)
      : (updates.name ? `@${updates.name.toLowerCase().replace(/[^a-z0-9_]/g, '')}` : current.handle);

    const updatedProfile: UserProfile = {
      ...current,
      ...updates,
      handle: formattedHandle,
    };

    setProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    // Save custom guest profile locally
    if (updatedProfile.id.startsWith('guest') || updatedProfile.id === 'guest') {
      try {
        localStorage.setItem('ecoscan_guest_custom', JSON.stringify(updatedProfile));
        localStorage.setItem('garbagemedia_guest_custom', JSON.stringify(updatedProfile));
      } catch {
        // ignore
      }
    }

    // Sync to Firebase Auth & Firestore if logged in with real account
    if (user && !user.isAnonymous && auth) {
      try {
        const fbUpdates: { displayName?: string; photoURL?: string } = {};
        if (updates.name) fbUpdates.displayName = updates.name;
        if (updates.avatar) fbUpdates.photoURL = updates.avatar;
        if (Object.keys(fbUpdates).length > 0) {
          await updateProfile(user, fbUpdates);
        }
      } catch (err) {
        console.warn('Could not update Firebase user displayName/photoURL:', err);
      }

      const firestore = db;
      if (firestore && isFirebaseConfigured) {
        try {
          await setDoc(doc(firestore, 'users', user.uid), updatedProfile, { merge: true });
        } catch (err) {
          console.error('Could not sync profile to Firestore:', err);
        }
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
        updateUserProfile,
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
