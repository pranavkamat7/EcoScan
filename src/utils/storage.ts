import { Spot, UserProfile, LeaderboardItem } from '../types';

const SPOTS_STORAGE_KEY = 'ecoscan_spots_v5';
const USER_STORAGE_KEY = 'ecoscan_user_v5';
const LEADERBOARD_STORAGE_KEY = 'ecoscan_leaderboard_v5';

// Purge obsolete dummy mock entries from previous versions
export function purgeOldDummyStorage(): void {
  try {
    const obsoleteKeys = [
      'garbagemedia_spots',
      'garbagemedia_user',
      'garbagemedia_leaderboard',
      'garbagemedia_spots_v2',
      'garbagemedia_user_v2',
      'garbagemedia_leaderboard_v2',
      'garbagemedia_spots_v3',
      'garbagemedia_user_v3',
      'garbagemedia_leaderboard_v3',
      'ecoscan_spots_v3',
      'ecoscan_leaderboard_v3',
      'ecoscan_spots_v4',
      'ecoscan_user_v4',
      'ecoscan_leaderboard_v4',
    ];
    obsoleteKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore error in restricted environments
  }
}

// Clean on module load
purgeOldDummyStorage();

export function loadSpots(): Spot[] {
  try {
    const raw = localStorage.getItem(SPOTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (s: Spot) =>
            s &&
            s.id &&
            !s.id.startsWith('spot-10') &&
            s.title !== 'Miramar Coastal Walkway & Dunes Restoration'
        );
      }
    }
  } catch (err) {
    console.error('Failed to load spots from localStorage', err);
  }
  return [];
}

export function saveSpots(spots: Spot[]): void {
  try {
    const clean = spots.filter(
      (s) =>
        s &&
        s.id &&
        !s.id.startsWith('spot-10') &&
        s.title !== 'Miramar Coastal Walkway & Dunes Restoration'
    );
    localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('Failed to save spots to localStorage', err);
  }
}

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.id !== 'user_current' && parsed.id !== 'guest') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user from localStorage', err);
  }
  return null;
}

export function saveUserProfile(user: UserProfile | null): void {
  try {
    if (!user || user.id === 'guest' || user.id === 'user_current') {
      localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Failed to save user to localStorage', err);
  }
}

export function clearUserProfile(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem('ecoscan_guest_session');
  } catch (err) {
    console.error('Failed to clear user from localStorage', err);
  }
}

export function loadLeaderboard(): LeaderboardItem[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      const parsed: LeaderboardItem[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            item &&
            item.id &&
            item.id !== 'user_current' &&
            item.id !== 'guest' &&
            !item.id.startsWith('user_rohan') &&
            !item.id.startsWith('user_anita') &&
            !item.id.startsWith('user_vikram') &&
            !item.id.startsWith('user_priya')
        );
      }
    }
  } catch (err) {
    console.error('Failed to load leaderboard', err);
  }
  return [];
}

export function saveLeaderboard(leaderboard: LeaderboardItem[]): void {
  try {
    const clean = leaderboard.filter(
      (item) =>
        item &&
        item.id &&
        item.id !== 'user_current' &&
        item.id !== 'guest' &&
        !item.id.startsWith('user_rohan') &&
        !item.id.startsWith('user_anita') &&
        !item.id.startsWith('user_vikram') &&
        !item.id.startsWith('user_priya')
    );
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('Failed to save leaderboard', err);
  }
}

export function resetToDemoData(): void {
  purgeOldDummyStorage();
  localStorage.removeItem(SPOTS_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  sessionStorage.removeItem('ecoscan_guest_session');
}
