import { Spot, UserProfile, LeaderboardItem } from '../types';

export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Guest Volunteer',
  handle: '@guest',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  points: 0,
  level: 'Civic Scout',
  spotsReported: 0,
  spotsCleaned: 0,
  wasteClearedKg: 0,
  badges: [],
};

// 0 dummy spots on live site
export const INITIAL_SPOTS: Spot[] = [];

// 0 dummy users on live leaderboard
export const INITIAL_LEADERBOARD: LeaderboardItem[] = [];
