import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
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

const DELETED_SPOTS_STORAGE_KEY = 'ecoscan_deleted_spots_v5';

// Track deleted spot IDs locally and in localStorage so listener snapshots never re-add them
export function getDeletedSpotIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_SPOTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch {
    // fallback
  }
  return new Set();
}

export function markSpotAsDeleted(spotId: string): void {
  try {
    const deleted = getDeletedSpotIds();
    deleted.add(spotId);
    localStorage.setItem(DELETED_SPOTS_STORAGE_KEY, JSON.stringify([...deleted]));
  } catch (err) {
    console.warn('Failed to save deleted spot blacklist:', err);
  }
}

export function isSpotDeleted(spotId: string): boolean {
  return getDeletedSpotIds().has(spotId);
}

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
 * and any spots that have been permanently deleted by the user.
 */
function isRealUserSpot(spot: Spot): boolean {
  if (!spot || !spot.id) return false;
  if (isSpotDeleted(spot.id)) return false;
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
          if (isRealUserSpot(data) && !isSpotDeleted(data.id)) {
            cloudSpots.push(data);
          }
        });

        // Retain any pending locally submitted spots created in the last 3 minutes
        // while strictly excluding any spot that was deleted
        const localCached = loadSpots().filter((s) => isRealUserSpot(s) && !isSpotDeleted(s.id));
        const cloudIds = new Set(cloudSpots.map((s) => s.id));
        const now = Date.now();
        const pendingLocal = localCached.filter((s) => {
          if (cloudIds.has(s.id) || isSpotDeleted(s.id)) return false;
          const createdTime = new Date(s.createdAt).getTime();
          return !isNaN(createdTime) && now - createdTime < 180000;
        });

        const merged = [...pendingLocal, ...cloudSpots];
        saveSpots(merged);
        onUpdate(merged);
      },
      (error) => {
        console.warn('Firestore real-time listener error, falling back to local storage:', error);
        const fallback = loadSpots().filter((s) => isRealUserSpot(s) && !isSpotDeleted(s.id));
        onUpdate(fallback);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Failed to set up Firestore listener:', err);
    const fallback = loadSpots().filter((s) => isRealUserSpot(s) && !isSpotDeleted(s.id));
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
  const current = loadSpots().filter((s) => isRealUserSpot(s) && !isSpotDeleted(s.id));
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
  const current = loadSpots().filter((s) => isRealUserSpot(s) && !isSpotDeleted(s.id));
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
  const current = loadSpots().filter((s) => isRealUserSpot(s) && !isSpotDeleted(s.id));
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
  const current = loadSpots().filter((s) => isRealUserSpot(s) && !isSpotDeleted(s.id));
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

/**
 * Permanently delete a spot from local storage and Cloud Firestore.
 */
export async function deleteSpotCloud(
  spotId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Mark in permanent deletion blacklist
  markSpotAsDeleted(spotId);

  // 2. Immediately remove from local cache
  const current = loadSpots();
  saveSpots(current.filter((s) => s.id !== spotId && !isSpotDeleted(s.id)));

  if (!isFirebaseConfigured || !db) {
    return { success: true };
  }
  const firestore: Firestore = db;

  try {
    const spotRef = doc(firestore, 'spots', spotId);
    await deleteDoc(spotRef);
    console.log('✅ Successfully permanently deleted spot from Firestore:', spotId);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Error deleting spot from Firestore cloud:', err);
    return { success: false, error: err?.message || 'Failed to delete from cloud' };
  }
}

/**
 * Update an existing spot's details (title, description, photos, severity) in local storage & Firestore.
 */
export async function updateSpotCloud(
  spotId: string,
  updates: Partial<Spot>
): Promise<{ success: boolean; error?: string }> {
  // Update local cache immediately
  const current = loadSpots();
  const updated = current.map((s) => (s.id === spotId ? { ...s, ...updates } : s));
  saveSpots(updated);

  if (!isFirebaseConfigured || !db) {
    return { success: true };
  }
  const firestore: Firestore = db;

  try {
    const spotRef = doc(firestore, 'spots', spotId);
    const sanitized = cleanForFirestore(updates);
    await updateDoc(spotRef, sanitized);
    console.log('✅ Successfully updated spot in Firestore cloud:', spotId);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Error updating spot in Firestore cloud:', err);
    return { success: false, error: err?.message || 'Failed to update spot on cloud' };
  }
}
