import { useState, useMemo, useEffect } from 'react';
import {
  loadSpots,
  saveSpots,
  loadLeaderboard,
  saveLeaderboard,
} from './utils/storage';
import type { FeedFilter, Spot, CleanVerification, SpotComment, LeaderboardItem } from './types';
import { Navbar, type NavTab } from './components/Navbar';
import { SpotCard } from './components/SpotCard';
import { FilterTabs } from './components/FilterTabs';
import { ReportModal } from './components/ReportModal';
import { CleanSubmissionModal } from './components/CleanSubmissionModal';
import { EditProfileModal } from './components/EditProfileModal';
import { MapView } from './components/MapView';
import { Leaderboard } from './components/Leaderboard';
import { RewardsView } from './components/RewardsView';
import { AuthScreen } from './components/AuthScreen';
import { Avatar } from './components/Avatar';
import { AuthProvider, useAuth } from './firebase/authContext';
import { subscribeToSpots, saveSpotCloud, saveCleanVerificationCloud } from './firebase/spotsService';
import { GUEST_USER } from './data/initialSpots';
import {
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Scale,
  Plus,
  MapPin,
  Trophy,
  ArrowRight,
} from 'lucide-react';

interface GarbageMediaDashboardProps {
  isGuest?: boolean;
  onRequireAuth?: () => void;
}

function GarbageMediaDashboard({ isGuest = false, onRequireAuth }: GarbageMediaDashboardProps) {
  const { profile, awardCleanupReward, recordSpotReported, updateUserProfile } = useAuth();
  const currentUser = profile || GUEST_USER;

  const [spots, setSpots] = useState<Spot[]>(() => loadSpots());
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(() => loadLeaderboard());

  const [currentTab, setCurrentTab] = useState<NavTab>('feed');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeCleanSpot, setActiveCleanSpot] = useState<Spot | null>(null);
  const [selectedSpotForMap, setSelectedSpotForMap] = useState<Spot | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Subscribe to real-time Firestore spots (with local fallback)
  useEffect(() => {
    const unsubscribe = subscribeToSpots((updatedSpots) => {
      setSpots(updatedSpots || []);
    });
    return () => unsubscribe();
  }, []);

  // Update leaderboard when current user profile changes
  useEffect(() => {
    if (!currentUser || currentUser.id === 'guest' || !currentUser.name) return;

    setLeaderboard((prev: LeaderboardItem[]) => {
      const cleanPrev = prev.filter((item) => item.id !== 'user_current' && item.id !== 'guest');

      const updated = cleanPrev.map((item: LeaderboardItem) => {
        if (item.id === currentUser.id || item.isCurrentUser) {
          return {
            ...item,
            id: currentUser.id,
            name: `${currentUser.name} (You)`,
            handle: currentUser.handle,
            avatar: currentUser.avatar,
            points: currentUser.points,
            spotsCleaned: currentUser.spotsCleaned,
            wasteKg: currentUser.wasteClearedKg,
            badge: currentUser.level,
            isCurrentUser: true,
          };
        }
        return item;
      });

      const exists = updated.some((i: LeaderboardItem) => i.id === currentUser.id || i.isCurrentUser);
      if (!exists && currentUser.points > 0) {
        updated.push({
          rank: updated.length + 1,
          id: currentUser.id,
          name: `${currentUser.name} (You)`,
          handle: currentUser.handle,
          avatar: currentUser.avatar,
          points: currentUser.points,
          spotsCleaned: currentUser.spotsCleaned,
          wasteKg: currentUser.wasteClearedKg,
          badge: currentUser.level,
          isCurrentUser: true,
        });
      }

      updated.sort((a: LeaderboardItem, b: LeaderboardItem) => b.points - a.points);
      updated.forEach((item: LeaderboardItem, idx: number) => {
        item.rank = idx + 1;
      });

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
    await saveSpotCloud(newSpot);
    await recordSpotReported();
  };

  const handleCleanSubmit = async (spotId: string, verification: CleanVerification) => {
    const targetSpot = spots.find((s) => s.id === spotId);
    const wasteKg = targetSpot?.estimatedWasteKg || 12;

    setSpots((prev) =>
      prev.map((s) =>
        s.id === spotId
          ? {
              ...s,
              status: 'cleaned' as const,
              verification,
            }
          : s
      )
    );

    await saveCleanVerificationCloud(spotId, verification);
    await awardCleanupReward(verification.pointsEarned, wasteKg);
  };

  const handleLikeToggle = (spotId: string) => {
    const updatedSpots = spots.map((s) => {
      if (s.id === spotId) {
        const hasLiked = !s.hasLiked;
        return {
          ...s,
          hasLiked,
          likesCount: hasLiked ? s.likesCount + 1 : Math.max(0, s.likesCount - 1),
        };
      }
      return s;
    });
    setSpots(updatedSpots);
    saveSpots(updatedSpots);
  };

  const handleAddComment = (spotId: string, text: string) => {
    const newComment: SpotComment = {
      id: `comment-${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedSpots = spots.map((s) => {
      if (s.id === spotId) {
        return {
          ...s,
          comments: [...s.comments, newComment],
        };
      }
      return s;
    });

    setSpots(updatedSpots);
    saveSpots(updatedSpots);
  };

  const handleOpenMapForSpot = (spot: Spot) => {
    setSelectedSpotForMap(spot);
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen text-[#1C2B24] pb-24 md:pb-16 bg-[#F4F1EA] selection:bg-[#1E6B4B] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'map') setSelectedSpotForMap(null);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        currentUser={currentUser}
        isGuest={isGuest}
        onRequireAuth={onRequireAuth}
      />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* VIEW 1: Community Feed */}
        {currentTab === 'feed' && (
          <div className="space-y-4 sm:space-y-6">
            {/* 1. Slim Stats Strip: Single row, dividers between items, no icon chips */}
            <div className="bg-[#FFFDF8] border border-[#E2DCCD] rounded-[6px] px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm text-[#6B7468] overflow-x-auto whitespace-nowrap shadow-subtle">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span>
                  <strong className="font-semibold text-[#1C2B24] tabular-nums">{stats.cleanedCount}</strong>{' '}
                  {stats.cleanedCount === 1 ? 'spot restored' : 'spots restored'}
                </span>
                <span className="text-[#A39E93]">·</span>
                <span>
                  <strong className="font-semibold text-[#1C2B24] tabular-nums">{stats.totalWasteKg} kg</strong> collected
                </span>
                <span className="text-[#A39E93]">·</span>
                <span>
                  <strong className="font-semibold text-[#1E6B4B] tabular-nums">{stats.totalPointsAwarded} pts</strong> awarded
                </span>
                {stats.pendingCount > 0 && (
                  <>
                    <span className="text-[#A39E93]">·</span>
                    <span className="text-[#D9822B]">
                      <strong className="font-semibold tabular-nums">{stats.pendingCount}</strong>{' '}
                      {stats.pendingCount === 1 ? 'open bounty' : 'open bounties'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Layout: Photo-First Feed + Right Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
              {/* Left Column: Photo-First Feed */}
              <div className="lg:col-span-8 space-y-4">
                {/* Clean Feed Header & Filter Tabs */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C2B24] tracking-tight">
                      Community feed
                    </h2>
                    <span className="text-xs text-[#6B7468]">
                      {filteredSpots.length} {filteredSpots.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>

                  {/* Horizontal Scrollable Filters */}
                  <FilterTabs
                    currentFilter={feedFilter}
                    onFilterChange={setFeedFilter}
                    counts={{
                      all: spots.length,
                      needsCleaning: stats.pendingCount,
                      cleaned: stats.cleanedCount,
                    }}
                  />
                </div>

                {/* Feed Cards: Photo is the Hero */}
                {filteredSpots.length > 0 ? (
                  <div className="space-y-5">
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
                  <div className="bg-[#FFFDF8] p-8 sm:p-12 rounded-[12px] border border-[#E2DCCD] text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[#E2DCCD] text-[#1C2B24] flex items-center justify-center mx-auto text-lg font-serif">
                      🌱
                    </div>
                    <div className="max-w-sm mx-auto space-y-1">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C2B24]">
                        No cleanup spots posted yet
                      </h3>
                      <p className="text-xs text-[#6B7468]">
                        Be the first neighbour to snap a photo of a littered corner or park.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-4 py-2 text-xs font-medium text-white bg-[#1E6B4B] hover:bg-[#18553B] rounded-[6px] transition-colors shadow-subtle"
                    >
                      Report a dirty spot
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#FFFDF8] p-8 rounded-[12px] border border-[#E2DCCD] text-center space-y-3">
                    <p className="text-xs text-[#6B7468]">
                      No photos found in this filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFeedFilter('all')}
                      className="px-3.5 py-1.5 text-xs font-medium text-[#1E6B4B] border border-[#E2DCCD] hover:bg-[#F4F1EA] rounded-[6px] transition-colors"
                    >
                      Show all photos
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Editorial Sidebar */}
              <aside className="lg:col-span-4 space-y-4 hidden lg:block sticky top-20">
                {/* 1. How It Works (short 3-line inline text list) */}
                <div className="bg-[#FFFDF8] p-4 rounded-[12px] border border-[#E2DCCD] space-y-2.5">
                  <h3 className="font-serif text-sm font-bold text-[#1C2B24]">
                    How GarbageMedia works
                  </h3>
                  <ol className="space-y-2 text-xs text-[#6B7468] list-decimal list-inside leading-relaxed">
                    <li>Spot litter & snap a photo with location.</li>
                    <li>Clean the area & take the verified after photo.</li>
                    <li>Earn civic bounty points for your neighbourhood.</li>
                  </ol>
                </div>

                {/* 2. Active Missions */}
                <div className="bg-[#FFFDF8] p-4 rounded-[12px] border border-[#E2DCCD] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2DCCD] pb-2">
                    <h3 className="font-serif text-sm font-bold text-[#1C2B24]">
                      Active missions
                    </h3>
                    {stats.pendingCount > 0 && (
                      <span className="text-xs font-semibold text-[#D9822B] tabular-nums">
                        {stats.pendingCount} open
                      </span>
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
                            className="p-3 rounded-[6px] border border-[#E2DCCD] bg-[#F4F1EA]/60 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#D9822B] font-semibold tabular-nums">
                                +{spot.rewardPoints} pts bounty
                              </span>
                              <span className="text-[#A39E93] tabular-nums">
                                {new Date(spot.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <h4 className="font-medium text-xs text-[#1C2B24] line-clamp-1">
                              {spot.title}
                            </h4>
                            <p className="text-[11px] text-[#6B7468] truncate">
                              {spot.location.address}
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveCleanSpot(spot)}
                              className="w-full mt-1 py-1.5 px-2.5 text-xs font-medium bg-[#1E6B4B] hover:bg-[#18553B] text-white rounded-[6px] transition-colors shadow-subtle"
                            >
                              Clean this spot
                            </button>
                          </div>
                        ))
                    ) : (
                      <div className="py-3 text-center space-y-1">
                        <p className="text-xs text-[#1C2B24] font-medium">All spots are clean</p>
                        <p className="text-[11px] text-[#6B7468]">
                          No dirty areas reported right now.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsReportModalOpen(true)}
                          className="mt-1 text-xs font-medium text-[#1E6B4B] hover:underline"
                        >
                          Be the first to report a spot →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Top Champions */}
                <div className="bg-[#FFFDF8] p-4 rounded-[12px] border border-[#E2DCCD] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2DCCD] pb-2">
                    <h3 className="font-serif text-sm font-bold text-[#1C2B24]">
                      Top champions
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('leaderboard')}
                      className="text-xs text-[#1E6B4B] hover:underline font-medium"
                    >
                      View all →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {leaderboard.filter((u) => u.id !== 'guest' && u.id !== 'user_current').slice(0, 3).length > 0 ? (
                      leaderboard
                        .filter((u) => u.id !== 'guest' && u.id !== 'user_current')
                        .slice(0, 3)
                        .map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 py-1"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs text-[#A39E93] w-4 tabular-nums">
                                {idx + 1}.
                              </span>
                              <Avatar
                                src={item.avatar}
                                name={item.name}
                                size="xs"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-medium text-[#1C2B24] truncate block">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-[#6B7468] tabular-nums">
                                  {item.spotsCleaned} {item.spotsCleaned === 1 ? 'cleanup' : 'cleanups'}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[#1E6B4B] tabular-nums flex-shrink-0">
                              {item.points} pts
                            </span>
                          </div>
                        ))
                    ) : (
                      <div className="py-3 text-center space-y-1">
                        <p className="text-xs text-[#1C2B24] font-medium">No champions yet</p>
                        <p className="text-[11px] text-[#6B7468]">
                          Clean a spot to lead your neighbourhood board.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsReportModalOpen(true)}
                          className="mt-1 text-xs font-medium text-[#1E6B4B] hover:underline"
                        >
                          Be the first to clean →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* VIEW 2: Interactive Map View */}
        {currentTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-2 border-b border-[#E2DCCD]">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C2B24] tracking-tight">
                  Civic clean map
                </h2>
                <p className="text-xs text-[#6B7468] mt-0.5">
                  Explore reported dirty spots and restored before & after proofs near you.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#1E6B4B] hover:bg-[#18553B] text-white rounded-[6px] transition-colors flex items-center gap-1.5 shadow-subtle self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Report spot at location</span>
              </button>
            </div>

            <MapView
              spots={spots}
              selectedSpot={selectedSpotForMap}
              onSelectSpot={(s) => {
                setSelectedSpotForMap(s);
              }}
              onCleanSpot={(s) => setActiveCleanSpot(s)}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* VIEW 3: Civic Leaderboard */}
        {currentTab === 'leaderboard' && (
          <Leaderboard currentUser={currentUser} leaderboardData={leaderboard} />
        )}

        {/* VIEW 4: Rewards & Badges */}
        {currentTab === 'rewards' && (
          <RewardsView
            currentUser={currentUser}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        )}
      </main>

      {/* MODAL 1: Report Dirty Spot */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        currentUser={currentUser}
      />

      {/* MODAL 2: Clean Submission */}
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
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [isGuest, setIsGuest] = useState(() => {
    return sessionStorage.getItem('garbagemedia_guest_session') === 'true';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5ECE7] flex flex-col items-center justify-center space-y-3">
        <img
          src="/logo.png"
          alt="GarbageMedia"
          className="w-14 h-14 object-contain animate-pulse rounded-2xl shadow-xs"
        />
        <p className="text-xs text-slate-500 font-mono font-medium">Connecting to GarbageMedia...</p>
      </div>
    );
  }

  // If user is not logged in and has not chosen to continue as guest, show the landing & auth portal
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
