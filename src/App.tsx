import { useState, useMemo } from 'react';
import {
  loadSpots,
  saveSpots,
  loadUserProfile,
  saveUserProfile,
  loadLeaderboard,
  saveLeaderboard,
  resetToDemoData,
} from './utils/storage';
import type { FeedFilter, Spot, CleanVerification, SpotComment } from './types';
import { Navbar, type NavTab } from './components/Navbar';
import { SpotCard } from './components/SpotCard';
import { FilterTabs } from './components/FilterTabs';
import { ReportModal } from './components/ReportModal';
import { CleanSubmissionModal } from './components/CleanSubmissionModal';
import { MapView } from './components/MapView';
import { Leaderboard } from './components/Leaderboard';
import { RewardsView } from './components/RewardsView';
import { RenderDeployGuide } from './components/RenderDeployGuide';
import { getUserLevel } from './utils/rewards';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

export function App() {
  const [spots, setSpots] = useState<Spot[]>(() => loadSpots());
  const [currentUser, setCurrentUser] = useState(() => loadUserProfile());
  const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());

  const [currentTab, setCurrentTab] = useState<NavTab>('feed');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeCleanSpot, setActiveCleanSpot] = useState<Spot | null>(null);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [selectedSpotForMap, setSelectedSpotForMap] = useState<Spot | null>(null);

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
        // For demonstration, list needs_cleaning first then cleaned
        return [...spots].sort((a) => (a.status === 'needs_cleaning' ? -1 : 1));
      default:
        return spots;
    }
  }, [spots, feedFilter]);

  // Handlers
  const handleReportSubmit = (
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

    const updatedSpots = [newSpot, ...spots];
    setSpots(updatedSpots);
    saveSpots(updatedSpots);

    // Update user stats
    const updatedUser = {
      ...currentUser,
      spotsReported: currentUser.spotsReported + 1,
    };
    setCurrentUser(updatedUser);
    saveUserProfile(updatedUser);
  };

  const handleCleanSubmit = (spotId: string, verification: CleanVerification) => {
    const updatedSpots = spots.map((s) => {
      if (s.id === spotId) {
        return {
          ...s,
          status: 'cleaned' as const,
          verification,
        };
      }
      return s;
    });

    setSpots(updatedSpots);
    saveSpots(updatedSpots);

    // Update current user points & level
    const newPoints = currentUser.points + verification.pointsEarned;
    const newLevelInfo = getUserLevel(newPoints);
    const updatedUser = {
      ...currentUser,
      points: newPoints,
      level: newLevelInfo.levelTitle,
      spotsCleaned: currentUser.spotsCleaned + 1,
      wasteClearedKg:
        currentUser.wasteClearedKg +
        (spots.find((s) => s.id === spotId)?.estimatedWasteKg || 12),
    };

    setCurrentUser(updatedUser);
    saveUserProfile(updatedUser);

    // Update leaderboard
    const updatedLeaderboard = leaderboard.map((item: typeof leaderboard[number]) => {
      if (item.id === currentUser.id || ('isCurrentUser' in item && item.isCurrentUser)) {
        return {
          ...item,
          points: newPoints,
          spotsCleaned: updatedUser.spotsCleaned,
          wasteKg: updatedUser.wasteClearedKg,
          badge: newLevelInfo.levelTitle,
        };
      }
      return item;
    });

    // Re-sort leaderboard by points
    updatedLeaderboard.sort((a: typeof leaderboard[number], b: typeof leaderboard[number]) => b.points - a.points);
    updatedLeaderboard.forEach((item: typeof leaderboard[number], idx: number) => {
      item.rank = idx + 1;
    });

    setLeaderboard(updatedLeaderboard);
    saveLeaderboard(updatedLeaderboard);
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

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to default initial state?')) {
      const reset = resetToDemoData();
      setSpots(reset.spots);
      setCurrentUser(reset.user);
      setLeaderboard(reset.leaderboard);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#181A19] pb-20 md:pb-12">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'map') setSelectedSpotForMap(null);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onResetDemo={handleReset}
        currentUser={currentUser}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* VIEW 1: Community Feed */}
        {currentTab === 'feed' && (
          <div className="space-y-6">
            {/* Impact Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-[#E3E3DC] shadow-subtle">
              <div className="border-r border-[#F0EFEA] last:border-0 pr-2">
                <span className="text-[11px] uppercase tracking-wider text-[#7E8681] block font-mono">
                  Transformed Spots
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#2D513B]">
                  {stats.cleanedCount}
                </span>
              </div>
              <div className="border-r border-[#F0EFEA] last:border-0 pr-2">
                <span className="text-[11px] uppercase tracking-wider text-[#7E8681] block font-mono">
                  Pending Bounties
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#BA4A2B]">
                  {stats.pendingCount}
                </span>
              </div>
              <div className="border-r border-[#F0EFEA] last:border-0 pr-2">
                <span className="text-[11px] uppercase tracking-wider text-[#7E8681] block font-mono">
                  Waste Cleared
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#181A19]">
                  {stats.totalWasteKg} kg
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#7E8681] block font-mono">
                  Civic Points Earned
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#2D513B]">
                  +{stats.totalPointsAwarded}
                </span>
              </div>
            </div>

            {/* Layout: Feed + Civic Missions Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Posts Feed */}
              <div className="lg:col-span-8 space-y-4">
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E3E3DC]">
                  <div>
                    <h2 className="text-base font-semibold text-[#181A19]">Community Feed</h2>
                    <p className="text-xs text-[#535A55]">
                      Real before & after proof comparisons generated by community cleanups.
                    </p>
                  </div>
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

                {/* Spot Cards List */}
                {filteredSpots.length > 0 ? (
                  filteredSpots.map((spot) => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      currentUser={currentUser}
                      onCleanSpot={(s) => setActiveCleanSpot(s)}
                      onLikeToggle={handleLikeToggle}
                      onAddComment={handleAddComment}
                      onOpenMap={handleOpenMapForSpot}
                    />
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-lg border border-[#E3E3DC] text-center space-y-3">
                    <p className="text-sm text-[#535A55]">
                      No spots match this filter at the moment.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFeedFilter('all')}
                      className="px-3 py-1.5 text-xs rounded bg-[#2D513B] text-white"
                    >
                      Show All Spots
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Context Sidebar */}
              <aside className="lg:col-span-4 space-y-5 hidden lg:block">
                {/* How SpotClean Works Card */}
                <div className="bg-white p-5 rounded-lg border border-[#E3E3DC] shadow-subtle">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-[#181A19] mb-3 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#2D513B]" />
                    How Civic Cleanups Work
                  </h3>
                  <ol className="space-y-3 text-xs text-[#535A55]">
                    <li className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#F2F2EC] text-[#181A19] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px] border border-[#E3E3DC]">
                        1
                      </span>
                      <span>
                        <strong className="text-[#181A19]">Find a dirty spot:</strong> Click "Report
                        Spot", take a photo, and the app grabs your live GPS coordinates.
                      </span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#F2F2EC] text-[#181A19] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px] border border-[#E3E3DC]">
                        2
                      </span>
                      <span>
                        <strong className="text-[#181A19]">Clean & verify:</strong> You or another
                        volunteer cleans it, snaps the after photo on-site to match the GPS location.
                      </span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#F2F2EC] text-[#181A19] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px] border border-[#E3E3DC]">
                        3
                      </span>
                      <span>
                        <strong className="text-[#181A19]">Automatic Comparison:</strong> A
                        split-slider proof is generated and reward points are credited to the cleaner!
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Open Missions Waiting for Volunteers */}
                <div className="bg-white p-5 rounded-lg border border-[#E3E3DC] shadow-subtle">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-[#BA4A2B] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#BA4A2B]" />
                      Open Cleanup Missions
                    </h3>
                    <span className="font-mono text-xs text-[#7E8681]">
                      {stats.pendingCount} open
                    </span>
                  </div>

                  <div className="space-y-3">
                    {spots
                      .filter((s) => s.status === 'needs_cleaning')
                      .slice(0, 3)
                      .map((spot) => (
                        <div
                          key={spot.id}
                          className="p-2.5 rounded border border-[#E3E3DC] bg-[#FDF7F5] space-y-1.5"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs font-semibold text-[#181A19] line-clamp-1">
                              {spot.title}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#BA4A2B] bg-white px-1.5 py-0.5 rounded border border-[#E3E3DC] flex-shrink-0">
                              +{spot.rewardPoints} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7E8681] truncate">
                            {spot.location.address}
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveCleanSpot(spot)}
                            className="w-full mt-1 py-1 px-2 text-[11px] font-medium bg-[#2D513B] text-white rounded hover:bg-[#233F2E] flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-yellow-300" />
                            Clean This Spot
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Render Free Hosting Banner */}
                <div className="p-4 rounded-lg bg-[#F2F7F4] border border-[#4D8262]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#14231A]">
                      Deploy 100% Free on Render
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#2D513B] text-white rounded">
                      $0/mo
                    </span>
                  </div>
                  <p className="text-xs text-[#535A55]">
                    Ready to publish online? Render Static Sites host this Vite React app completely
                    free forever without sleeping.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeployGuideOpen(true)}
                    className="text-xs font-semibold text-[#2D513B] hover:underline flex items-center gap-1"
                  >
                    <span>View Setup Guide</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* VIEW 2: Interactive OpenStreetMap */}
        {currentTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E3E3DC]">
              <div>
                <h2 className="text-base font-semibold text-[#181A19]">Interactive Civic Map</h2>
                <p className="text-xs text-[#535A55]">
                  Live map of uncleaned spots (terracotta) and restored zones (forest green).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded bg-[#2D513B] text-white self-start sm:self-auto"
              >
                + Report Spot at Location
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

      {/* MODAL 2: Clean Submission (Proof + Location Match + Reward Points) */}
      <CleanSubmissionModal
        spot={activeCleanSpot}
        isOpen={Boolean(activeCleanSpot)}
        onClose={() => setActiveCleanSpot(null)}
        onSubmitClean={handleCleanSubmit}
        currentUser={currentUser}
      />

      {/* MODAL 3: Render Free Deployment Guide */}
      <RenderDeployGuide
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}

export default App;
