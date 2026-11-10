import { Spot, UserProfile, LeaderboardItem } from '../types';
import { INITIAL_SPOTS, INITIAL_LEADERBOARD } from '../data/initialSpots';

const SPOTS_STORAGE_KEY = 'ecoscan_spots_v4';
const USER_STORAGE_KEY = 'ecoscan_user_v4';
const LEADERBOARD_STORAGE_KEY = 'ecoscan_leaderboard_v4';

// Purge obsolete dummy mock entries from previous sessions
export function purgeOldDummyStorage(): void {
  try {
    localStorage.removeItem('garbagemedia_spots');
    localStorage.removeItem('garbagemedia_user');
    localStorage.removeItem('garbagemedia_leaderboard');
    localStorage.removeItem('garbagemedia_spots_v2');
    localStorage.removeItem('garbagemedia_user_v2');
    localStorage.removeItem('garbagemedia_leaderboard_v2');
    localStorage.removeItem('garbagemedia_spots_v3');
    localStorage.removeItem('garbagemedia_user_v3');
    localStorage.removeItem('garbagemedia_leaderboard_v3');
    localStorage.removeItem('ecoscan_spots_v3');
    localStorage.removeItem('ecoscan_leaderboard_v3');
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load spots from localStorage', err);
  }
  return INITIAL_SPOTS;
}

export function saveSpots(spots: Spot[]): void {
  try {
    localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(spots));
  } catch (err) {
    console.error('Failed to save spots to localStorage', err);
  }
}

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem('garbagemedia_user_v3');
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
    localStorage.removeItem('garbagemedia_user_v3');
    sessionStorage.removeItem('ecoscan_guest_session');
    sessionStorage.removeItem('garbagemedia_guest_session');
  } catch (err) {
    console.error('Failed to clear user from localStorage', err);
  }
}

export function loadLeaderboard(): LeaderboardItem[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      const parsed: LeaderboardItem[] = JSON.parse(raw);
      const filtered = parsed.filter((item) => item.id !== 'user_current' && item.id !== 'guest');
      if (filtered.length > 0) {
        return filtered;
      }
    }
  } catch (err) {
    console.error('Failed to load leaderboard', err);
  }
  return INITIAL_LEADERBOARD;
}

export function saveLeaderboard(leaderboard: LeaderboardItem[]): void {
  try {
    const clean = leaderboard.filter((item) => item.id !== 'user_current' && item.id !== 'guest');
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
  sessionStorage.removeItem('garbagemedia_guest_session');
}
