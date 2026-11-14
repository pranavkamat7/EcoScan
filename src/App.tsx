import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  Map as MapIcon,
  Trophy,
  Award,
  Plus,
  Sparkles,
  ArrowRight,
  Heart,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Flame,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import type { Spot, FeedFilter, UserProfile, CleanVerification, LeaderboardItem } from './types';
import { AuthProvider, useAuth } from './firebase/authContext';
import { AuthScreen } from './components/AuthScreen';
import { AppShell, NavTab } from './components/AppShell';
import { SpotCard } from './components/SpotCard';
import { MapView } from './components/MapView';
import { Leaderboard } from './components/Leaderboard';
import { RewardsView } from './components/RewardsView';
import { ReportModal } from './components/ReportModal';
import { CleanSubmissionModal } from './components/CleanSubmissionModal';
import { EditProfileModal } from './components/EditProfileModal';
import { MyPostsView } from './components/MyPostsView';
import { EditSpotModal } from './components/EditSpotModal';
import { CertificateModal, CertificateData } from './components/CertificateModal';
import { AboutView } from './components/AboutView';
import {
  PageHeader,
  Card,
  Button,
  Tabs,
  Badge,
  Avatar,
  EmptyState,
  Toast,
  Skeleton,
  Logo,
} from './components/ui';
import {
  loadSpots,
  saveSpots,
  loadLeaderboard,
  saveLeaderboard,
} from './utils/storage';
import {
  subscribeToSpots,
  saveSpotCloud,
  saveCleanVerificationCloud,
  saveSpotLikeCloud,
  saveSpotCommentCloud,
  updateSpotCloud,
  deleteSpotCloud,
  markSpotAsDeleted,
} from './firebase/spotsService';
import {
  subscribeToLeaderboard,
  syncUserToLeaderboard,
} from './firebase/leaderboardService';

function EcoScanDashboard({
  isGuest,
  onRequireAuth,
}: {
  isGuest: boolean;
  onRequireAuth: () => void;
}) {
  const { user, profile, updateUserProfile, deleteAccount } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('feed');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');

  // Spots & Leaderboard State
  const [spots, setSpots] = useState<Spot[]>(() => loadSpots());
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(() =>
    loadLeaderboard()
  );

  // Modals & Map Selection State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeCleanSpot, setActiveCleanSpot] = useState<Spot | null>(null);
  const [selectedSpotForMap, setSelectedSpotForMap] = useState<Spot | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<CertificateData | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Active User Profile
  const currentUser: UserProfile = useMemo(() => {
    if (profile) return profile;

    if (user) {
      return {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Civic Volunteer',
        email: user.email || 'volunteer@ecoscan.org',
        handle: `@${(user.displayName || user.email?.split('@')[0] || 'volunteer').toLowerCase().replace(/\s+/g, '')}`,
        avatar: user.photoURL || undefined,
        points: 0,
        level: 'Eco Scout',
        spotsReported: 0,
        spotsCleaned: 0,
        wasteClearedKg: 0,
        badges: ['Civic Member'],
      };
    }

    // Default Guest Volunteer Profile (clean 0 state, no dummy data)
    return {
      id: 'guest',
      name: 'Civic Volunteer',
      email: 'volunteer@ecoscan.org',
      handle: '@volunteer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      points: 0,
      level: 'Eco Scout',
      spotsReported: 0,
      spotsCleaned: 0,
      wasteClearedKg: 0,
      badges: ['Eco Scout'],
      city: 'Local Neighbourhood',
      bio: 'Keeping the community green and litter-free.',
    };
  }, [user, profile]);

  // Sync spots to localStorage
  useEffect(() => {
    saveSpots(spots);
  }, [spots]);

  // Real-time synchronization: subscribe to global community feed from cloud
  // All spots reported by any user on any device appear instantly!
  useEffect(() => {
    const unsubscribe = subscribeToSpots((cloudSpots) => {
      setSpots(cloudSpots || []);
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization: subscribe to global leaderboard from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard(currentUser, (items) => {
      setLeaderboard(items || []);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Sync active user profile into Firestore leaderboard
  useEffect(() => {
    syncUserToLeaderboard(currentUser);
  }, [currentUser]);

  // Statistics calculation
  const stats = useMemo(() => {
    const cleanedCount = spots.filter((s) => s.status === 'cleaned').length;
    const pendingCount = spots.filter((s) => s.status === 'needs_cleaning').length;
    const totalWasteKg = spots.reduce((acc, s) => {
      if (s.status === 'cleaned') {
        return acc + (s.estimatedWasteKg || 10);
      }
      return acc;
    }, 0);
    const totalPointsAwarded = spots.reduce((acc, s) => {
      if (s.verification) {
        return acc + s.verification.pointsEarned;
      }
      return acc;
    }, 0);

    return { cleanedCount, pendingCount, totalWasteKg, totalPointsAwarded };
  }, [spots]);

  // Filtered spots for the feed
  const filteredSpots = useMemo(() => {
    switch (feedFilter) {
      case 'cleaned':
        return spots.filter((s) => s.status === 'cleaned');
      case 'needs_cleaning':
        return spots.filter((s) => s.status === 'needs_cleaning');
      case 'nearby':
        return [...spots].sort((a) => (a.status === 'needs_cleaning' ? -1 : 1));
      default:
        return spots;
    }
  }, [spots, feedFilter]);

  // Handlers
  const handleReportSubmit = async (
    newSpotData: Omit<Spot, 'id' | 'createdAt' | 'likesCount' | 'comments' | 'status'>
  ) => {
    const newSpot: Spot = {
      ...newSpotData,
      id: `spot-${Date.now()}`,
      status: 'needs_cleaning',
      createdAt: new Date().toISOString(),
      likesCount: 1,
      comments: [],
    };

    setSpots((prev) => [newSpot, ...prev]);

    // Save to shared cloud database so all users on any device see it!
    const result = await saveSpotCloud(newSpot);

    // Update user stats
    await updateUserProfile({
      spotsReported: currentUser.spotsReported + 1,
      points: currentUser.points + 20,
    });

    if (result && !result.success) {
      setToastMessage({
        message: `Saved locally! (Cloud sync notice: ${result.error})`,
        type: 'info',
      });
    } else {
      setToastMessage({
        message: 'Dirty spot posted to shared community registry! EcoScaners Team backup active.',
        type: 'success',
      });
    }
  };

  const handleCleanSubmit = async (spotId: string, verification: CleanVerification) => {
    setSpots((prev) =>
      prev.map((s) => {
        if (s.id === spotId) {
          return {
            ...s,
            status: 'cleaned',
            verification,
          };
        }
        return s;
      })
    );

    // Sync clean verification to shared cloud database
    await saveCleanVerificationCloud(spotId, verification);

    const bonusWaste = activeCleanSpot?.estimatedWasteKg || 10;
    await updateUserProfile({
      spotsCleaned: currentUser.spotsCleaned + 1,
      wasteClearedKg: currentUser.wasteClearedKg + bonusWaste,
      points: currentUser.points + verification.pointsEarned,
    });

    setActiveCleanSpot(null);
    setToastMessage({
      message: `Clean verified on-site! +${verification.pointsEarned} pts awarded.`,
      type: 'success',
    });
  };

  const handleLikeToggle = (spotId: string) => {
    setSpots((prev) =>
      prev.map((s) => {
        if (s.id === spotId) {
          return { ...s, likesCount: s.likesCount + 1 };
        }
        return s;
      })
    );
    saveSpotLikeCloud(spotId);
  };

  const handleAddComment = (spotId: string, text: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar || '',
      text,
      createdAt: new Date().toISOString(),
    };

    setSpots((prev) =>
      prev.map((s) => {
        if (s.id === spotId) {
          return { ...s, comments: [...s.comments, newComment] };
        }
        return s;
      })
    );
    saveSpotCommentCloud(spotId, newComment);
  };

  const handleOpenMapForSpot = (spot: Spot) => {
    setSelectedSpotForMap(spot);
    setCurrentTab('map');
  };

  const handleSaveEditedSpot = async (updatedSpot: Spot) => {
    setSpots((prev) =>
      prev.map((s) => (s.id === updatedSpot.id ? updatedSpot : s))
    );
    const result = await updateSpotCloud(updatedSpot.id, updatedSpot);
    if (result && !result.success) {
      setToastMessage({
        message: `Updated locally! (Cloud notice: ${result.error})`,
        type: 'info',
      });
    } else {
      setToastMessage({
        message: 'Spot details updated and synced across the community registry!',
        type: 'success',
      });
    }
  };

  const handleDeleteSpot = async (spotId: string) => {
    // 1. Immediately blacklist ID so listener snapshots never re-add it
    markSpotAsDeleted(spotId);

    // 2. Immediately remove from React state (Feed, Map, My Posts)
    setSpots((prev) => prev.filter((s) => s.id !== spotId));

    // 3. Immediately purge from local storage cache
    const remaining = loadSpots().filter((s) => s.id !== spotId);
    saveSpots(remaining);

    // 4. Update user profile spot count if user had reported spots
    if (currentUser.spotsReported > 0) {
      await updateUserProfile({
        spotsReported: Math.max(0, currentUser.spotsReported - 1),
      });
    }

    // 5. Delete permanently from Cloud Firestore
    const result = await deleteSpotCloud(spotId);
    if (result && !result.success) {
      setToastMessage({
        message: `Removed locally! (Cloud notice: ${result.error})`,
        type: 'info',
      });
    } else {
      setToastMessage({
        message: 'Spot permanently deleted from community feed and cloud database.',
        type: 'success',
      });
    }
  };

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      setIsEditProfileOpen(false);
      setToastMessage({
        message: 'Your account and personal data have been permanently erased.',
        type: 'info',
      });
      setTimeout(() => {
        window.location.reload();
      }, 900);
      return { success: true };
    } else {
      setToastMessage({
        message: `Account deletion error: ${result.error}`,
        type: 'error',
      });
      return { success: false, error: result.error };
    }
  };

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={(tab) => {
        setCurrentTab(tab);
        if (tab !== 'map') setSelectedSpotForMap(null);
      }}
      currentUser={currentUser}
      isGuest={isGuest}
      onRequireAuth={onRequireAuth}
      onOpenEditProfile={() => setIsEditProfileOpen(true)}
    >
      {/* VIEW 1: Community Feed */}
      {currentTab === 'feed' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Shared Page Header Pattern */}
          <PageHeader
            badge={
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald text-white shadow-xs">
                  🌱 Grassroots Civic Transformations
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentTab('about')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-lime text-navy hover:bg-lime-300 border border-lime-500/20 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-navy" />
                  <span>Student Field Guide &amp; About &rarr;</span>
                </button>
              </div>
            }
            title="Clean your neighbourhood. Post proofs. Earn rewards."
            description="Snap dirty spots, clean them with on-site GPS verification, and publish before & after split sliders for civic points."
            action={
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                onClick={() => setIsReportModalOpen(true)}
              >
                Report dirty spot
              </Button>
            }
          />

          {/* Vibrant Civic Impact Stats Grid (Solid, High-Contrast & Impressive) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-2">
            {/* Card 1: Restored Spots (Signature Emerald Green) */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-line shadow-sm flex items-center gap-2.5 sm:gap-3.5 hover:border-emerald transition-all group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-emerald text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="font-heading text-lg sm:text-2xl font-extrabold text-[#0A0D0C] tabular-nums">
                    {stats.cleanedCount}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald uppercase tracking-wider">
                    Restored
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted truncate">Civic spots cleaned</p>
              </div>
            </div>

            {/* Card 2: Waste Diverted (Ocean Sky Blue) */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-line shadow-sm flex items-center gap-2.5 sm:gap-3.5 hover:border-sky transition-all group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-sky text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Trash2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="font-heading text-lg sm:text-2xl font-extrabold text-[#0A0D0C] tabular-nums">
                    {stats.totalWasteKg}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-sky uppercase tracking-wider">
                    kg
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted truncate">Diverted from nature</p>
              </div>
            </div>

            {/* Card 3: Civic Points Awarded (Lime Green) */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-line shadow-sm flex items-center gap-2.5 sm:gap-3.5 hover:border-lime transition-all group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-lime text-[#0A0D0C] flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="font-heading text-lg sm:text-2xl font-extrabold text-[#0A0D0C] tabular-nums">
                    {stats.totalPointsAwarded}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-lime-700 uppercase tracking-wider">
                    pts
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted truncate">Earned bounties</p>
              </div>
            </div>

            {/* Card 4: Open Missions / Active Bounties (Coral Alert) */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-line shadow-sm flex items-center gap-2.5 sm:gap-3.5 hover:border-coral transition-all group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-coral text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="font-heading text-lg sm:text-2xl font-extrabold text-[#0A0D0C] tabular-nums">
                    {stats.pendingCount}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-coral uppercase tracking-wider">
                    Bounties
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted truncate">Open missions</p>
              </div>
            </div>
          </div>

          {/* Photo-First Single Column Feed + Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Photo-First Feed */}
            <div className="lg:col-span-8 space-y-5">
              {/* Filter Tabs (Horizontal scrollable, plain text, signature lime underline) */}
              <Tabs<FeedFilter>
                items={[
                  { id: 'all', label: 'All', count: spots.length },
                  { id: 'cleaned', label: 'Restored', count: stats.cleanedCount },
                  { id: 'needs_cleaning', label: 'Needs clean', count: stats.pendingCount },
                  { id: 'nearby', label: 'Nearby' },
                ]}
                activeTab={feedFilter}
                onChange={setFeedFilter}
              />

              {/* Feed Cards: Photo is the Hero */}
              {filteredSpots.length > 0 ? (
                <div className="space-y-6">
                  {filteredSpots.map((spot) => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      currentUser={currentUser}
                      onCleanSpot={(s) => setActiveCleanSpot(s)}
                      onLikeToggle={handleLikeToggle}
                      onAddComment={handleAddComment}
                      onOpenMap={handleOpenMapForSpot}
                    />
                  ))}
                </div>
              ) : spots.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="w-6 h-6 stroke-[1.75]" />}
                  title="No cleanup spots posted yet"
                  description="Be the first neighbour to snap a photo of a littered corner, road, or park."
                  actionLabel="Report a dirty spot"
                  actionIcon={<Plus className="w-4 h-4" />}
                  onAction={() => setIsReportModalOpen(true)}
                />
              ) : (
                <EmptyState
                  title="No spots in this filter"
                  description="Try switching tabs to see restored proofs or open dirty spots."
                  actionLabel="Show all photos"
                  onAction={() => setFeedFilter('all')}
                />
              )}
            </div>

            {/* Right Column: Editorial Sidebar */}
            <aside className="lg:col-span-4 space-y-4 hidden lg:block sticky top-24">
              {/* 1. How It Works (Colorful numbered steps) */}
              <Card variant="default" className="p-5 space-y-3.5 border-emerald/20 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌱</span>
                  <h3 className="font-heading text-sm font-bold text-navy">
                    How EcoScan works
                  </h3>
                </div>
                <div className="space-y-2.5 text-xs text-muted text-left">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="leading-snug">
                      <strong className="text-navy font-semibold">Spot & Snap:</strong> Capture dirty spots with automatic GPS verification.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="leading-snug">
                      <strong className="text-navy font-semibold">Clean & Verify:</strong> Clear the waste and take a verified "After" photo.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-lime text-[#0A0D0C] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="leading-snug">
                      <strong className="text-navy font-semibold">Earn Bounties:</strong> Publish split slider & claim real civic rewards!
                    </p>
                  </div>
                </div>
              </Card>

              {/* 2. Community Clean Target Progress */}
              <Card variant="default" className="p-5 space-y-3 border-line shadow-sm text-left bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald" /> Monthly Clean Goal
                  </span>
                  <span className="text-xs font-extrabold text-emerald tabular-nums">75%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald h-full rounded-full transition-all duration-500" style={{ width: '75%' }} />
                </div>
                <p className="text-[11px] text-muted leading-tight">
                  <strong className="text-navy font-semibold tabular-nums">{stats.totalWasteKg} kg</strong> diverted towards this month's 60 kg community goal.
                </p>
              </Card>

              {/* 3. EcoScaners Team Civic Guarantee */}
              <Card variant="default" className="p-4 sm:p-5 space-y-2.5 border-line shadow-sm text-left bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xs sm:text-sm font-bold text-navy flex items-center gap-1.5">
                      EcoScaners Team Backup
                    </h4>
                    <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" /> Active Rapid Patrol
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Even if no local volunteer cleans a reported dirty spot, our dedicated <strong className="text-navy font-bold">EcoScaners Team</strong> will deploy within 48 hours to clean and restore it. Zero dirty spots left behind!
                </p>
                <div className="pt-2 border-t border-line flex items-center justify-between text-[11px]">
                  <span className="text-muted font-medium">Zero-Neglect SLA:</span>
                  <span className="font-extrabold text-emerald">48 Hours Max</span>
                </div>
              </Card>

              {/* 4. Active Missions */}
              <Card variant="default" className="p-5 space-y-3 border-line shadow-sm bg-white">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h3 className="font-heading text-sm font-bold text-navy flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-coral" /> Active missions
                  </h3>
                  {stats.pendingCount > 0 ? (
                    <Badge variant="coral" size="sm">
                      {stats.pendingCount} open
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-emerald font-semibold">All clean</span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {spots.filter((s) => s.status === 'needs_cleaning').length > 0 ? (
                    spots
                      .filter((s) => s.status === 'needs_cleaning')
                      .slice(0, 3)
                      .map((spot) => (
                        <div
                          key={spot.id}
                          className="p-3 rounded-lg border border-coral-200 bg-white space-y-1 text-left hover:border-coral transition-all shadow-xs"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-coral font-bold tabular-nums">
                              +{spot.rewardPoints} pts bounty
                            </span>
                            <span className="text-muted tabular-nums">
                              {new Date(spot.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs text-navy line-clamp-1">
                            {spot.title}
                          </h4>
                          <p className="text-[11px] text-muted truncate">
                            {spot.location.address}
                          </p>
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => setActiveCleanSpot(spot)}
                          >
                            Clean this spot
                          </Button>
                        </div>
                      ))
                  ) : (
                    <div className="py-3 text-center space-y-1">
                      <p className="text-xs text-navy font-medium">All spots are clean</p>
                      <p className="text-[11px] text-muted">
                        No dirty spots currently reported.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(true)}
                        className="mt-1 text-xs font-semibold text-emerald hover:underline"
                      >
                        Be the first to report a spot →
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* 3. Top Champions */}
              <Card variant="default" className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h3 className="font-heading text-sm font-bold text-navy">
                    Top champions
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('leaderboard')}
                    className="text-xs text-emerald hover:underline font-semibold"
                  >
                    View all →
                  </button>
                </div>

                <div className="space-y-2 text-left">
                  {leaderboard.slice(0, 3).map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 py-1"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-heading font-bold text-muted tabular-nums w-4">
                          #{idx + 1}
                        </span>
                        <Avatar
                          src={item.avatar}
                          name={item.name}
                          size="xs"
                        />
                        <span className="text-xs font-semibold text-navy truncate max-w-[120px]">
                          {item.name}
                        </span>
                      </div>
                      <Badge variant="points" size="sm">
                        {item.points.toLocaleString()} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </aside>
          </div>
        </div>
      )}

      {/* VIEW 2: Interactive Civic Clean Map */}
      {currentTab === 'map' && (
        <MapView
          spots={spots}
          selectedSpot={selectedSpotForMap}
          onSelectSpot={(s) => setSelectedSpotForMap(s)}
          onCleanSpot={(s) => setActiveCleanSpot(s)}
          currentUser={currentUser}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* VIEW 3: Civic Leaderboard */}
      {currentTab === 'leaderboard' && (
        <Leaderboard
          currentUser={currentUser}
          leaderboardData={leaderboard}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onViewCertificate={(cert) => setActiveCertificate(cert)}
        />
      )}

      {/* VIEW 4: Rewards & Badges */}
      {currentTab === 'rewards' && (
        <RewardsView
          currentUser={currentUser}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onViewCertificate={(cert) => setActiveCertificate(cert)}
        />
      )}

      {/* VIEW 5: My Reported Posts */}
      {currentTab === 'my_posts' && (
        <MyPostsView
          currentUser={currentUser}
          spots={spots}
          onEditSpot={(spot) => setEditingSpot(spot)}
          onDeleteSpot={handleDeleteSpot}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onCleanSpot={(spot) => setActiveCleanSpot(spot)}
          onOpenMapForSpot={handleOpenMapForSpot}
          onViewCertificate={(cert) => setActiveCertificate(cert)}
        />
      )}

      {/* VIEW 6: About & Student Field Guide */}
      {currentTab === 'about' && (
        <AboutView
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (tab !== 'map') setSelectedSpotForMap(null);
          }}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* 404 Fallback State if tab is invalid */}
      {!['feed', 'map', 'my_posts', 'leaderboard', 'rewards', 'about'].includes(currentTab) && (
        <EmptyState
          title="Page not found"
          description="The civic page or view you requested could not be found."
          actionLabel="Back to Community Feed"
          onAction={() => setCurrentTab('feed')}
        />
      )}

      {/* MODAL 1: Report Dirty Spot (Step-based with ProgressBar) */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        currentUser={currentUser}
      />

      {/* MODAL 2: Clean Submission (GPS verification & split proof) */}
      <CleanSubmissionModal
        spot={activeCleanSpot}
        isOpen={Boolean(activeCleanSpot)}
        onClose={() => setActiveCleanSpot(null)}
        onSubmitClean={handleCleanSubmit}
        currentUser={currentUser}
        onAwardCertificate={(cert) => setActiveCertificate(cert)}
      />

      {/* MODAL 3: Edit Profile Photo & Details */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={updateUserProfile}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* MODAL 4: Edit Reported Spot */}
      <EditSpotModal
        spot={editingSpot}
        isOpen={Boolean(editingSpot)}
        onClose={() => setEditingSpot(null)}
        onSave={handleSaveEditedSpot}
      />

      {/* MODAL 5: Authentic Civic Certificate Award Modal */}
      <CertificateModal
        isOpen={Boolean(activeCertificate)}
        onClose={() => setActiveCertificate(null)}
        data={activeCertificate}
      />

      {/* FLOATING TOAST NOTIFICATIONS */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </AppShell>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [isGuest, setIsGuest] = useState(() => {
    return sessionStorage.getItem('ecoscan_guest_session') === 'true';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 space-y-4">
        <Logo size="lg" />
        <div className="space-y-2 w-48 text-center pt-2">
          <Skeleton variant="sm" height={12} className="w-full" />
          <Skeleton variant="sm" height={8} className="w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  // If user is not logged in and has not chosen guest mode, show the unified AuthScreen
  if (!user && !isGuest) {
    return (
      <AuthScreen
        onContinueAsGuest={() => {
          sessionStorage.setItem('ecoscan_guest_session', 'true');
          setIsGuest(true);
        }}
      />
    );
  }

  return (
    <EcoScanDashboard
      isGuest={!user && isGuest}
      onRequireAuth={() => {
        sessionStorage.removeItem('ecoscan_guest_session');
        setIsGuest(false);
      }}
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
