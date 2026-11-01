import { Spot, UserProfile, LeaderboardItem } from '../types';
import { INITIAL_SPOTS, INITIAL_USER, INITIAL_LEADERBOARD } from '../data/initialSpots';

const SPOTS_STORAGE_KEY = 'garbagemedia_spots_v2';
const USER_STORAGE_KEY = 'garbagemedia_user_v2';
const LEADERBOARD_STORAGE_KEY = 'garbagemedia_leaderboard_v2';

export function loadSpots(): Spot[] {
  try {
    const raw = localStorage.getItem(SPOTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load spots from localStorage', err);
  }
  saveSpots(INITIAL_SPOTS);
  return INITIAL_SPOTS;
}

export function saveSpots(spots: Spot[]): void {
  try {
    localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(spots));
  } catch (err) {
    console.error('Failed to save spots to localStorage', err);
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load user from localStorage', err);
  }
  saveUserProfile(INITIAL_USER);
  return INITIAL_USER;
}

export function saveUserProfile(user: UserProfile): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user to localStorage', err);
  }
}

export function loadLeaderboard(): LeaderboardItem[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load leaderboard', err);
  }
  return INITIAL_LEADERBOARD;
}

export function saveLeaderboard(leaderboard: LeaderboardItem[]) {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
  } catch (err) {
    console.error('Failed to save leaderboard', err);
  }
}

export function resetToDemoData(): { spots: Spot[]; user: UserProfile; leaderboard: LeaderboardItem[] } {
  localStorage.removeItem(SPOTS_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  return {
    spots: INITIAL_SPOTS,
    user: INITIAL_USER,
    leaderboard: INITIAL_LEADERBOARD,
  };
}
