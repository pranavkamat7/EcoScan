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
import { MapView } from './components/MapView';
import { Leaderboard } from './components/Leaderboard';
import { RewardsView } from './components/RewardsView';
import { AuthScreen } from './components/AuthScreen';
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
  const { profile, awardCleanupReward, recordSpotReported } = useAuth();
  const currentUser = profile || GUEST_USER;

  const [spots, setSpots] = useState<Spot[]>(() => loadSpots());
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(() => loadLeaderboard());

  const [currentTab, setCurrentTab] = useState<NavTab>('feed');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeCleanSpot, setActiveCleanSpot] = useState<Spot | null>(null);
  const [selectedSpotForMap, setSelectedSpotForMap] = useState<Spot | null>(null);

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
    <div className="min-h-screen text-[#17171F] pb-20 md:pb-12 bg-[#E5ECE7] selection:bg-[#16A34A] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'map') setSelectedSpotForMap(null);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        currentUser={currentUser}
        isGuest={isGuest}
        onRequireAuth={onRequireAuth}
      />

      {/* Main Container - Balanced max-w-5xl layout with comfortable spacing */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 space-y-6 sm:space-y-7">
        {/* VIEW 1: Community Feed */}
        {currentTab === 'feed' && (
          <div className="space-y-6 sm:space-y-7">
            {/* Impact Metric Cards Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Spots Restored (Vibrant Green) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-green-300 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#16A34A] font-mono font-extrabold truncate">
                    Spots Restored
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-green-50 text-[#16A34A] border border-green-200 flex items-center justify-center shadow-xs flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-3xl font-extrabold font-mono text-[#17171F]">
                    {stats.cleanedCount}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">cleaned</span>
                </div>
              </div>

              {/* Card 2: Open Bounties (Warm Amber-Orange) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-orange-300 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-orange-600 font-mono font-extrabold truncate">
                    Open Bounties
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shadow-xs flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-3xl font-extrabold font-mono text-orange-600">
                    {stats.pendingCount}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">active</span>
                </div>
              </div>

              {/* Card 3: Waste Removed (Charcoal Black) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-slate-400 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#17171F] font-mono font-extrabold truncate">
                    Waste Removed
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 text-[#17171F] border border-slate-200 flex items-center justify-center shadow-xs flex-shrink-0">
                    <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#17171F]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-3xl font-extrabold font-mono text-[#17171F]">
                    {stats.totalWasteKg}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">kg collected</span>
                </div>
              </div>

              {/* Card 4: Civic Rewards (Green Accent) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-green-300 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#16A34A] font-mono font-extrabold truncate">
                    Civic Rewards
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-green-50 text-[#16A34A] border border-green-200 flex items-center justify-center shadow-xs flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-3xl font-extrabold font-mono text-[#16A34A]">
                    +{stats.totalPointsAwarded}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">pts awarded</span>
                </div>
              </div>
            </div>

            {/* Layout: Feed + Civic Missions Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
              {/* Left Column: Posts Feed */}
              <div className="lg:col-span-8 space-y-5">
                {/* Filter Controls Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#17171F] tracking-tight flex items-center gap-2">
                      <span>Community Feed</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-green-50 text-[#16A34A] border border-green-200">
                        Live
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Before & After comparisons verified on-site by community volunteers.
                    </p>
                  </div>
                  <div className="overflow-x-auto pb-1 sm:pb-0">
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
                </div>

                {/* Spot Cards List */}
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
                  <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 text-center space-y-3.5 shadow-sm">
                    <img
                      src="/logo.png"
                      alt="GarbageMedia"
                      className="w-14 h-14 mx-auto object-contain rounded-2xl shadow-xs"
                    />
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-[#17171F]">No cleanup spots posted yet</h3>
                      <p className="text-xs text-slate-500">
                        Be the first volunteer to report a littered street, park, or public space in your community!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl transition-all shadow-btn-green hover:scale-[1.02] active:scale-95"
                    >
                      + Report First Dirty Spot
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 text-center space-y-3.5 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16A34A] border border-green-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
                      🔍
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="text-base font-black text-[#17171F]">No spots in this filter</h3>
                      <p className="text-xs text-slate-500">
                        Try switching to "All" to view all active community cleanup posts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeedFilter('all')}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl transition-all shadow-btn-green"
                    >
                      Show All Posts
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Context Sidebar */}
              <aside className="lg:col-span-4 space-y-5 hidden lg:block sticky top-20">
                {/* How GarbageMedia Works Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#16A34A] flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#16A34A]" />
                    How GarbageMedia Works
                  </h3>
                  <ol className="space-y-3 text-xs text-slate-600">
                    <li className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-lg bg-[#16A34A] text-white font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px] shadow-xs">
                        1
                      </span>
                      <span>
                        <strong className="text-[#17171F]">Pin a dirty spot:</strong> Snap a photo and select the location on the map.
                      </span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-lg bg-[#16A34A] text-white font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px] shadow-xs">
                        2
                      </span>
                      <span>
                        <strong className="text-[#17171F]">Clean & verify on-site:</strong> Volunteers clean it and submit photo proof with GPS matching.
                      </span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-lg bg-[#16A34A] text-white font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px] shadow-xs">
                        3
                      </span>
                      <span>
                        <strong className="text-[#17171F]">Before & After Slider:</strong> Split proof is published and reward points are credited!
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Open Cleanup Missions Spotlight */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      Active Missions
                    </h3>
                    <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                      {stats.pendingCount} open
                    </span>
                  </div>

                  <div className="space-y-3">
                    {spots.filter((s) => s.status === 'needs_cleaning').length > 0 ? (
                      spots
                        .filter((s) => s.status === 'needs_cleaning')
                        .slice(0, 3)
                        .map((spot) => (
                          <div
                            key={spot.id}
                            className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-2 hover:border-orange-300 transition-colors shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-700 bg-orange-100/70 border border-orange-200 px-2 py-0.5 rounded-md">
                                Bounty Mission
                              </span>
                              <span className="text-xs font-mono font-black text-white bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 px-2.5 py-0.5 rounded-lg shadow-sm flex-shrink-0">
                                +{spot.rewardPoints} pts
                              </span>
                            </div>
                            <h4 className="text-xs font-extrabold text-[#17171F] leading-snug break-words">
                              {spot.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                              <span className="break-words line-clamp-2 leading-tight">{spot.location.address}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveCleanSpot(spot)}
                              className="w-full mt-1 py-2 px-3 text-xs font-extrabold bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl flex items-center justify-center gap-1.5 shadow-btn-green hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-white" />
                              <span>I Cleaned This Spot</span>
                            </button>
                          </div>
                        ))
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                        <p className="text-xs text-slate-600 font-medium">All spots are clean!</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Report a littered place to start a community cleanup mission.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Champions Quick Podium */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-[#16A34A]" />
                      Top Champions
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('leaderboard')}
                      className="text-xs text-[#16A34A] hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
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
                            className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-mono font-extrabold text-xs text-slate-400 w-4">
                                #{idx + 1}
                              </span>
                              <img
                                src={item.avatar}
                                alt={item.name}
                                className="w-8 h-8 rounded-full object-cover border border-green-300 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-[#17171F] truncate block">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {item.spotsCleaned} cleanups
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-extrabold text-xs text-[#16A34A] flex-shrink-0">
                              {item.points} pts
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-2">
                        No champions yet. Be the first to earn points!
                      </p>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#17171F] tracking-tight">
                  Interactive Civic Clean Map
                </h2>
                <p className="text-xs text-slate-500">
                  Search locations, switch between map styles, and discover dirty spots or restored proofs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white shadow-btn-green hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Report Spot at Location
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
        {currentTab === 'rewards' && <RewardsView currentUser={currentUser} />}
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
