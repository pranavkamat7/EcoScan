import { Spot, UserProfile, LeaderboardItem } from '../types';

export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Civic Volunteer',
  handle: '@volunteer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  points: 0,
  level: 'Eco Scout',
  spotsReported: 0,
  spotsCleaned: 0,
  wasteClearedKg: 0,
  badges: ['Eco Scout'],
};

// Zero dummy spots: only real community-reported cleanups will appear
export const INITIAL_SPOTS: Spot[] = [];

// Zero dummy leaderboard items: populated dynamically from real active community members
export const INITIAL_LEADERBOARD: LeaderboardItem[] = [];
