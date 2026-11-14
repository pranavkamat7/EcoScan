import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  type Firestore,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { UserProfile, LeaderboardItem, Spot } from '../types';
import { loadLeaderboard, saveLeaderboard } from '../utils/storage';

/**
 * Strips undefined values for safe Firestore serialization.
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
 * Sync user profile to Firestore 'users' collection so they appear on all devices' leaderboards.
 */
export async function syncUserToLeaderboard(profile: UserProfile): Promise<void> {
  if (!profile || !profile.id) return;
  if (!isFirebaseConfigured || !db) return;

  const firestore: Firestore = db;
  try {
    const userRef = doc(firestore, 'users', profile.id);
    const sanitized = cleanForFirestore({
      id: profile.id,
      name: profile.name,
      handle: profile.handle || `@${profile.name.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
      avatar: profile.avatar || '',
      points: profile.points || 0,
      spotsCleaned: profile.spotsCleaned || 0,
      cleanupsCount: profile.spotsCleaned || 0,
      wasteClearedKg: profile.wasteClearedKg || 0,
      wasteKg: profile.wasteClearedKg || 0,
      level: profile.level || 'Civic Scout',
      city: profile.city || 'Neighbourhood',
      updatedAt: new Date().toISOString(),
    });
    await setDoc(userRef, sanitized, { merge: true });
  } catch (err) {
    console.warn('Could not sync user to Firestore users collection:', err);
  }
}

/**
 * Real-time subscription to the community leaderboard.
 * Reads all active users from Firestore 'users' collection and aggregates from 'spots'.
 */
export function subscribeToLeaderboard(
  currentUser: UserProfile,
  onUpdate: (items: LeaderboardItem[]) => void
): () => void {
  // If Firebase is not configured, fall back to local storage
  if (!isFirebaseConfigured || !db) {
    const local = loadLeaderboard();
    const withUser = ensureUserInLeaderboard(local, currentUser);
    onUpdate(withUser);
    return () => {};
  }

  const firestore: Firestore = db;

  try {
    const usersCol = collection(firestore, 'users');
    const q = query(usersCol, orderBy('points', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudUsers: LeaderboardItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.name && data.id !== 'user_rohan' && data.id !== 'user_anita') {
            cloudUsers.push({
              id: data.id || docSnap.id,
              name: data.name,
              handle: data.handle || `@${data.name.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
              avatar:
                data.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
              points: data.points || 0,
              spotsCleaned: data.spotsCleaned || data.cleanupsCount || 0,
              cleanupsCount: data.cleanupsCount || data.spotsCleaned || 0,
              wasteKg: data.wasteClearedKg || data.wasteKg || 0,
              wasteClearedKg: data.wasteClearedKg || data.wasteKg || 0,
              rank: 1,
            });
          }
        });

        // Merge with current user to guarantee live responsiveness
        const merged = ensureUserInLeaderboard(cloudUsers, currentUser);
        saveLeaderboard(merged);
        onUpdate(merged);
      },
      (err) => {
        console.warn('Leaderboard Firestore listener error, using local fallback:', err);
        const fallback = ensureUserInLeaderboard(loadLeaderboard(), currentUser);
        onUpdate(fallback);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize leaderboard listener:', err);
    const fallback = ensureUserInLeaderboard(loadLeaderboard(), currentUser);
    onUpdate(fallback);
    return () => {};
  }
}

/**
 * Ensures the current active user is ranked dynamically alongside other community members.
 */
function ensureUserInLeaderboard(
  list: LeaderboardItem[],
  currentUser: UserProfile
): LeaderboardItem[] {
  const map = new Map<string, LeaderboardItem>();

  for (const item of list) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }

  // Inject current user with their up-to-date points & waste
  if (currentUser && currentUser.name) {
    map.set(currentUser.id, {
      id: currentUser.id,
      name: currentUser.name,
      handle: currentUser.handle || `@${currentUser.name.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
      avatar: currentUser.avatar || '',
      points: currentUser.points,
      spotsCleaned: currentUser.spotsCleaned,
      cleanupsCount: currentUser.spotsCleaned,
      wasteKg: currentUser.wasteClearedKg,
      wasteClearedKg: currentUser.wasteClearedKg,
      rank: 1,
      isCurrentUser: true,
    });
  }

  const sorted = Array.from(map.values())
    .filter((item) => item.id !== 'guest' || item.points > 0)
    .sort((a, b) => b.points - a.points);

  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    isCurrentUser: item.id === currentUser.id,
  }));
}
