import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { Spot, CleanVerification } from '../types';
import { loadSpots, saveSpots } from '../utils/storage';

export function subscribeToSpots(onUpdate: (spots: Spot[]) => void): () => void {
  if (!isFirebaseConfigured || !db) {
    // Local storage fallback
    const initial = loadSpots();
    onUpdate(initial);
    return () => {};
  }

  try {
    const q = query(collection(db, 'spots'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const spots: Spot[] = [];
        snapshot.forEach((docSnap) => {
          spots.push(docSnap.data() as Spot);
        });
        saveSpots(spots);
        onUpdate(spots);
      },
      (error) => {
        console.warn('Firestore real-time listener error, falling back to local storage:', error);
        onUpdate(loadSpots());
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Failed to set up Firestore listener:', err);
    onUpdate(loadSpots());
    return () => {};
  }
}

export async function saveSpotCloud(spot: Spot): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'spots', spot.id), spot);
      return;
    } catch (err) {
      console.error('Error saving spot to Firestore:', err);
    }
  }

  // Local fallback
  const current = loadSpots();
  saveSpots([spot, ...current]);
}

export async function saveCleanVerificationCloud(
  spotId: string,
  verification: CleanVerification
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const spotRef = doc(db, 'spots', spotId);
      await updateDoc(spotRef, {
        status: 'cleaned',
        verification,
      });
      return;
    } catch (err) {
      console.error('Error updating spot in Firestore:', err);
    }
  }

  // Local fallback
  const current = loadSpots();
  const updated = current.map((s) => (s.id === spotId ? { ...s, status: 'cleaned' as const, verification } : s));
  saveSpots(updated);
}

