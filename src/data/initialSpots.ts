import { Spot, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user_current',
  name: 'Community Scout',
  handle: '@civic_scout',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  points: 0,
  level: 'Civic Scout',
  spotsReported: 0,
  spotsCleaned: 0,
  wasteClearedKg: 0,
  badges: [],
};

// Clean initial state: 0 dummy spots
export const INITIAL_SPOTS: Spot[] = [];

// Clean initial leaderboard
export const INITIAL_LEADERBOARD = [
  {
    rank: 1,
    id: 'user_current',
    name: 'Community Scout (You)',
    handle: '@civic_scout',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    points: 0,
    spotsCleaned: 0,
    wasteKg: 0,
    badge: 'Civic Scout',
    isCurrentUser: true,
  },
];
