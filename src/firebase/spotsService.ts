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
  type Firestore,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { Spot, CleanVerification, SpotComment } from '../types';
import { loadSpots, saveSpots } from '../utils/storage';

/**
 * Strips undefined properties recursively so Firestore does not reject documents.
 */
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === undefined) continue;
    if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      result[key] = cleanForFirestore(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Filter out legacy dummy spots (e.g. mock spots created during early testing)
 */
function isRealUserSpot(spot: Spot): boolean {
  if (!spot || !spot.id) return false;
  if (
    spot.id === 'spot-101' ||
    spot.id === 'spot-102' ||
    spot.id === 'spot-103' ||
    spot.id === 'spot-104'
  ) {
    return false;
  }
  if (spot.title === 'Miramar Coastal Walkway & Dunes Restoration') {
    return false;
  }
  return true;
}

/**
 * Real-time subscription to the global community spots feed.
 * All reported spots from any user or device appear in real-time.
 */
export function subscribeToSpots(onUpdate: (spots: Spot[]) => void): () => void {
  if (!isFirebaseConfigured || !db) {
    const initial = loadSpots().filter(isRealUserSpot);
    onUpdate(initial);
    return () => {};
  }

  const firestore: Firestore = db;

  try {
    const spotsCol = collection(firestore, 'spots');
    const q = query(spotsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudSpots: Spot[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Spot;
          if (isRealUserSpot(data)) {
            cloudSpots.push(data);
          }
        });

        // Retain any pending locally submitted spots created in the last 3 minutes
        // so that new uploads never flash or vanish while cloud transactions commit
        const localCached = loadSpots().filter(isRealUserSpot);
        const cloudIds = new Set(cloudSpots.map((s) => s.id));
        const now = Date.now();
        const pendingLocal = localCached.filter((s) => {
          if (cloudIds.has(s.id)) return false;
          const createdTime = new Date(s.createdAt).getTime();
          return !isNaN(createdTime) && now - createdTime < 180000;
        });

        const merged = [...pendingLocal, ...cloudSpots];
        saveSpots(merged);
        onUpdate(merged);
      },
      (error) => {
        console.warn('Firestore real-time listener error, falling back to local storage:', error);
        const fallback = loadSpots().filter(isRealUserSpot);
        onUpdate(fallback);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Failed to set up Firestore listener:', err);
    const fallback = loadSpots().filter(isRealUserSpot);
    onUpdate(fallback);
    return () => {};
  }
}

/**
 * Save a newly reported spot to the shared global cloud database.
 */
export async function saveSpotCloud(
  spot: Spot
): Promise<{ success: boolean; error?: string }> {
  // Always update local cache immediately for snappy UI
  const current = loadSpots().filter(isRealUserSpot);
  saveSpots([spot, ...current.filter((s) => s.id !== spot.id)]);

  if (!isFirebaseConfigured || !db) {
    return { success: true };
  }
  const firestore: Firestore = db;

  try {
    const spotRef = doc(firestore, 'spots', spot.id);
    const sanitized = cleanForFirestore(spot);
    await setDoc(spotRef, sanitized, { merge: true });
    console.log('✅ Successfully published spot to Firestore cloud:', spot.id);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Error saving spot to Firestore cloud:', err);
    return { success: false, error: err?.message || 'Failed to sync to cloud' };
  }
}

/**
 * Save a verified cleanup to the shared global cloud database.
 */
export async function saveCleanVerificationCloud(
  spotId: string,
  verification: CleanVerification
): Promise<{ success: boolean; error?: string }> {
  const current = loadSpots().filter(isRealUserSpot);
  const updated = current.map((s) =>
    s.id === spotId ? { ...s, status: 'cleaned' as const, verification } : s
  );
  saveSpots(updated);

  if (!isFirebaseConfigured || !db) {
    return { success: true };
  }
  const firestore: Firestore = db;

  try {
    const spotRef = doc(firestore, 'spots', spotId);
    const sanitizedVerification = cleanForFirestore(verification);
    await updateDoc(spotRef, {
      status: 'cleaned',
      verification: sanitizedVerification,
    });
    console.log('✅ Successfully updated clean verification on Firestore:', spotId);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Error updating clean verification in Firestore:', err);
    return { success: false, error: err?.message || 'Failed to sync to cloud' };
  }
}

/**
 * Sync like increments to the shared global cloud database.
 */
export async function saveSpotLikeCloud(spotId: string): Promise<void> {
  const current = loadSpots().filter(isRealUserSpot);
  const updated = current.map((s) =>
    s.id === spotId ? { ...s, likesCount: (s.likesCount || 0) + 1, hasLiked: true } : s
  );
  saveSpots(updated);

  if (!isFirebaseConfigured || !db) return;
  const firestore: Firestore = db;

  try {
    const spotRef = doc(firestore, 'spots', spotId);
    await updateDoc(spotRef, {
      likesCount: increment(1),
    });
  } catch (err) {
    console.warn('Failed to increment like on Firestore:', err);
  }
}

/**
 * Sync a new comment to the shared global cloud database.
 */
export async function saveSpotCommentCloud(
  spotId: string,
  comment: SpotComment
): Promise<void> {
  const current = loadSpots().filter(isRealUserSpot);
  const updated = current.map((s) =>
    s.id === spotId ? { ...s, comments: [...(s.comments || []), comment] } : s
  );
  saveSpots(updated);

  if (!isFirebaseConfigured || !db) return;
  const firestore: Firestore = db;

  try {
    const spotRef = doc(firestore, 'spots', spotId);
    const sanitizedComment = cleanForFirestore(comment);
    await updateDoc(spotRef, {
      comments: arrayUnion(sanitizedComment),
    });
  } catch (err) {
    console.warn('Failed to append comment on Firestore:', err);
  }
}
