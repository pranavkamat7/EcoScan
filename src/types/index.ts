export type SpotStatus = 'needs_cleaning' | 'in_progress' | 'cleaned';

export type SeverityLevel = 'low' | 'medium' | 'high';

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  accuracyMeters?: number;
}

export interface SpotComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface CleanVerification {
  cleanerId: string;
  cleanerName: string;
  cleanerAvatar: string;
  afterPhotoUrl: string;
  cleanedAt: string;
  location: GeoLocation;
  distanceFromOriginMeters: number;
  isLocationVerified: boolean;
  notes?: string;
  pointsEarned: number;
}

export interface Spot {
  id: string;
  title: string;
  description: string;
  beforePhotoUrl: string;
  status: SpotStatus;
  severity: SeverityLevel;
  tags: string[];
  location: GeoLocation;
  createdAt: string;
  reporterId: string;
  reporterName: string;
  reporterAvatar: string;
  rewardPoints: number; // Base reward points offered for cleaning this
  estimatedWasteKg?: number;
  verification?: CleanVerification;
  likesCount: number;
  hasLiked?: boolean;
  comments: SpotComment[];
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  points: number;
  level: string;
  spotsReported: number;
  spotsCleaned: number;
  wasteClearedKg: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface LeaderboardItem {
  rank: number;
  id: string;
  name: string;
  handle: string;
  avatar: string;
  points: number;
  spotsCleaned: number;
  wasteKg: number;
  badge: string;
  isCurrentUser?: boolean;
}

export type FeedFilter = 'all' | 'needs_cleaning' | 'cleaned' | 'nearby';
