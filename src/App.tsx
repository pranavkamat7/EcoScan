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
} from './components/ui';
import {
  loadSpots,
  saveSpots,
  loadLeaderboard,
  saveLeaderboard,
} from './utils/storage';

function GarbageMediaDashboard({
  isGuest,
  onRequireAuth,
}: {
  isGuest: boolean;
  onRequireAuth: () => void;
}) {
  const { user, profile, updateUserProfile } = useAuth();

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

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Active User Profile
  const currentUser: UserProfile = useMemo(() => {
    if (profile) return profile;

    if (user) {
      return {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Civic Volunteer',
        email: user.email || 'volunteer@garbagemedia.org',
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

    // Default Guest Volunteer Profile
    return {
      id: 'guest',
      name: 'Pranav Kamat',
      email: 'pranavkamat84@gmail.com',
      handle: '@pranav_civic',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      points: 8,
      level: 'Eco Scout',
      spotsReported: 1,
      spotsCleaned: 0,
      wasteClearedKg: 0,
      badges: ['Civic Scout', 'First Cleanup'],
      city: 'Margao, Goa',
      bio: 'Keeping the coastal roadways, parks, and trails green and litter-free.',
    };
  }, [user, profile]);

  // Sync spots to localStorage
  useEffect(() => {
    saveSpots(spots);
  }, [spots]);

  // Sync user profile into leaderboard
  useEffect(() => {
    setLeaderboard((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === currentUser.id);
      const userItem: LeaderboardItem = {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle || '@volunteer',
        avatar: currentUser.avatar || '',
        points: currentUser.points,
        spotsCleaned: currentUser.spotsCleaned,
        cleanupsCount: currentUser.spotsCleaned,
        wasteKg: currentUser.wasteClearedKg,
        wasteClearedKg: currentUser.wasteClearedKg,
        rank: 1,
      };

      let updated: LeaderboardItem[];
      if (existingIdx !== -1) {
        updated = [...prev];
        updated[existingIdx] = userItem;
      } else {
        updated = [...prev, userItem];
      }

      updated.sort((a, b) => b.points - a.points);
      updated = updated.map((item, idx) => ({ ...item, rank: idx + 1 }));
      saveLeaderboard(updated);
      return updated;
    });
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

    // Update user stats
    await updateUserProfile({
      spotsReported: currentUser.spotsReported + 1,
      points: currentUser.points + 20,
    });

    setToastMessage({
      message: 'Dirty spot reported! +20 pts scout credit added to your profile.',
      type: 'success',
    });
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
  };

  const handleOpenMapForSpot = (spot: Spot) => {
    setSelectedSpotForMap(spot);
    setCurrentTab('map');
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
            title="Clean your neighbourhood. Post proofs. Earn rewards."
            description="Snap dirty spots, clean them with on-site GPS verification, and publish before & after split sliders for civic points."
            action={
              <Button
                variant="lime"
                size="md"
                icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                onClick={() => setIsReportModalOpen(true)}
              >
                Report dirty spot
              </Button>
            }
          />

          {/* Slim Stats Strip (Single row, dividers between items, no icon chips) */}
          <Card
            variant="default"
            className="p-3 sm:p-4 overflow-x-auto whitespace-nowrap shadow-sm"
          >
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted">
              <span>
                <strong className="font-semibold text-ink tabular-nums">
                  {stats.cleanedCount}
                </strong>{' '}
                {stats.cleanedCount === 1 ? 'spot restored' : 'spots restored'}
              </span>
              <span className="text-border-strong">·</span>
              <span>
                <strong className="font-semibold text-ink tabular-nums">
                  {stats.totalWasteKg} kg
                </strong>{' '}
                collected
              </span>
              <span className="text-border-strong">·</span>
              <span>
                <strong className="font-semibold text-forest tabular-nums">
                  {stats.totalPointsAwarded} pts
                </strong>{' '}
                awarded
              </span>
              {stats.pendingCount > 0 && (
                <>
                  <span className="text-border-strong">·</span>
                  <span className="text-coral font-medium">
                    <strong className="font-semibold tabular-nums">
                      {stats.pendingCount}
                    </strong>{' '}
                    {stats.pendingCount === 1 ? 'open bounty' : 'open bounties'}
                  </span>
                </>
              )}
            </div>
          </Card>

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
              {/* 1. How It Works (Short 3-line inline text list) */}
              <Card variant="default" className="p-5 space-y-3">
                <h3 className="font-heading text-sm font-bold text-ink">
                  How GarbageMedia works
                </h3>
                <ol className="space-y-2 text-xs text-muted list-decimal list-inside leading-relaxed text-left">
                  <li>Spot litter & snap a photo with GPS.</li>
                  <li>Clean the area & verify with after photo.</li>
                  <li>Publish split slider & earn civic bounty points.</li>
                </ol>
              </Card>

              {/* 2. Active Missions */}
              <Card variant="default" className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="font-heading text-sm font-bold text-ink">
                    Active missions
                  </h3>
                  {stats.pendingCount > 0 && (
                    <Badge variant="warning" size="sm">
                      {stats.pendingCount} open
                    </Badge>
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
                          className="p-3 rounded-sm border border-border bg-surface-muted/50 space-y-1 text-left"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-amber font-semibold tabular-nums">
                              +{spot.rewardPoints} pts bounty
                            </span>
                            <span className="text-faint tabular-nums">
                              {new Date(spot.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs text-ink line-clamp-1">
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
                      <p className="text-xs text-ink font-medium">All spots are clean</p>
                      <p className="text-[11px] text-muted">
                        No dirty spots currently reported.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(true)}
                        className="mt-1 text-xs font-semibold text-forest hover:underline"
                      >
                        Be the first to report a spot →
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* 3. Top Champions */}
              <Card variant="default" className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="font-heading text-sm font-bold text-ink">
                    Top champions
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('leaderboard')}
                    className="text-xs text-forest hover:underline font-semibold"
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
                        <span className="text-xs font-medium text-ink truncate max-w-[120px]">
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
        />
      )}

      {/* VIEW 4: Rewards & Badges */}
      {currentTab === 'rewards' && (
        <RewardsView
          currentUser={currentUser}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* VIEW 5: 404 Fallback State if tab is invalid */}
      {!['feed', 'map', 'leaderboard', 'rewards'].includes(currentTab) && (
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
      />

      {/* MODAL 3: Edit Profile Photo & Details */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={updateUserProfile}
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
    return sessionStorage.getItem('garbagemedia_guest_session') === 'true';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 space-y-4">
        <img
          src="/logo.png"
          alt="GarbageMedia"
          className="h-14 w-auto object-contain animate-pulse"
        />
        <div className="space-y-2 w-48 text-center">
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
          sessionStorage.setItem('garbagemedia_guest_session', 'true');
          setIsGuest(true);
        }}
      />
    );
  }

  return (
    <GarbageMediaDashboard
      isGuest={!user && isGuest}
      onRequireAuth={() => {
        sessionStorage.removeItem('garbagemedia_guest_session');
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
