import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { Spot, CleanVerification, SpotComment } from '../types';
import { loadSpots, saveSpots } from '../utils/storage';
import { INITIAL_SPOTS } from '../data/initialSpots';

let hasAttemptedSeed = false;

/**
 * Real-time subscription to the global community spots feed.
 * All reported spots from any user or device appear in real-time.
 */
export function subscribeToSpots(onUpdate: (spots: Spot[]) => void): () => void {
  if (!isFirebaseConfigured || !db) {
    // Local storage fallback when offline or no credentials
    const initial = loadSpots();
    onUpdate(initial.length > 0 ? initial : INITIAL_SPOTS);
    return () => {};
  }

  try {
    const spotsCol = collection(db, 'spots');
    const q = query(spotsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && !hasAttemptedSeed) {
          hasAttemptedSeed = true;
          // Seed the initial community spots to Firestore so all new users share them
          INITIAL_SPOTS.forEach((spot) => {
            setDoc(doc(db, 'spots', spot.id), spot).catch((err) => {
              console.warn('Seeding spot error:', err);
            });
          });
          saveSpots(INITIAL_SPOTS);
          onUpdate(INITIAL_SPOTS);
          return;
        }

        const cloudSpots: Spot[] = [];
        snapshot.forEach((docSnap) => {
          cloudSpots.push(docSnap.data() as Spot);
        });

        if (cloudSpots.length > 0) {
          saveSpots(cloudSpots);
          onUpdate(cloudSpots);
        } else {
          const fallback = loadSpots();
          onUpdate(fallback.length > 0 ? fallback : INITIAL_SPOTS);
        }
      },
      (error) => {
        console.warn('Firestore real-time listener error, falling back to cached storage:', error);
        const fallback = loadSpots();
        onUpdate(fallback.length > 0 ? fallback : INITIAL_SPOTS);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Failed to set up Firestore listener:', err);
    const fallback = loadSpots();
    onUpdate(fallback.length > 0 ? fallback : INITIAL_SPOTS);
    return () => {};
  }
}

/**
 * Save a newly reported spot to the shared global cloud database.
 */
export async function saveSpotCloud(spot: Spot): Promise<void> {
  // Always update local cache immediately for snappy UI
  const current = loadSpots();
  saveSpots([spot, ...current]);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'spots', spot.id), spot);
      return;
    } catch (err) {
      console.error('Error saving spot to Firestore cloud:', err);
    }
  }
}

/**
 * Save a verified cleanup to the shared global cloud database.
 */
export async function saveCleanVerificationCloud(
  spotId: string,
  verification: CleanVerification
): Promise<void> {
  // Update local cache immediately
  const current = loadSpots();
  const updated = current.map((s) =>
    s.id === spotId ? { ...s, status: 'cleaned' as const, verification } : s
  );
  saveSpots(updated);

  if (isFirebaseConfigured && db) {
    try {
      const spotRef = doc(db, 'spots', spotId);
      await updateDoc(spotRef, {
        status: 'cleaned',
        verification,
      });
      return;
    } catch (err) {
      console.error('Error updating spot in Firestore cloud:', err);
    }
  }
}

/**
 * Sync like increments to the shared global cloud database.
 */
export async function saveSpotLikeCloud(spotId: string): Promise<void> {
  const current = loadSpots();
  const updated = current.map((s) =>
    s.id === spotId ? { ...s, likesCount: (s.likesCount || 0) + 1, hasLiked: true } : s
  );
  saveSpots(updated);

  if (isFirebaseConfigured && db) {
    try {
      const spotRef = doc(db, 'spots', spotId);
      await updateDoc(spotRef, {
        likesCount: increment(1),
      });
    } catch (err) {
      console.warn('Failed to increment like on Firestore:', err);
    }
  }
}

/**
 * Sync a new comment to the shared global cloud database.
 */
export async function saveSpotCommentCloud(
  spotId: string,
  comment: SpotComment
): Promise<void> {
  const current = loadSpots();
  const updated = current.map((s) =>
    s.id === spotId ? { ...s, comments: [...(s.comments || []), comment] } : s
  );
  saveSpots(updated);

  if (isFirebaseConfigured && db) {
    try {
      const spotRef = doc(db, 'spots', spotId);
      await updateDoc(spotRef, {
        comments: arrayUnion(comment),
      });
    } catch (err) {
      console.warn('Failed to append comment on Firestore:', err);
    }
  }
}
