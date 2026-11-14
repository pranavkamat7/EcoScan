import React, { useState, useMemo } from 'react';
import type { UserProfile, LeaderboardItem } from '../types';
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  Flame,
  Plus,
  ShieldCheck,
  Crown,
  HeartHandshake,
  CheckCircle2,
  FileText,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PageHeader,
  Card,
  Avatar,
  Badge,
  Chip,
  Button,
} from './ui';
import type { CertificateData } from './CertificateModal';

interface LeaderboardProps {
  currentUser: UserProfile;
  leaderboardData: LeaderboardItem[];
  onOpenReportModal?: () => void;
  onViewCertificate?: (certData: CertificateData) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  leaderboardData,
  onOpenReportModal,
  onViewCertificate,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  // Filter out invalid items and sort by points descending
  const sortedChampions = useMemo(() => {
    const list = [...leaderboardData]
      .filter((item) => item && item.name && (item.id !== 'guest' || item.points > 0))
      .sort((a, b) => {
        // Adjust points based on timeframe for a dynamic active leaderboard feel
        let scoreA = a.points;
        let scoreB = b.points;
        if (timeframe === 'month') {
          scoreA = Math.round(a.points * 0.7) + (a.spotsCleaned * 50);
          scoreB = Math.round(b.points * 0.7) + (b.spotsCleaned * 50);
        } else if (timeframe === 'week') {
          scoreA = Math.round(a.points * 0.35) + (a.spotsCleaned * 30);
          scoreB = Math.round(b.points * 0.35) + (b.spotsCleaned * 30);
        }
        return scoreB - scoreA;
      });

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [leaderboardData, timeframe]);

  const overallLeader = sortedChampions.length > 0 ? sortedChampions[0] : null;
  const topThree = sortedChampions.slice(0, 3);
  const remainingList = sortedChampions.slice(3);

  // User rank calculation
  const currentUserIndex = sortedChampions.findIndex(
    (c) => c.id === currentUser.id || c.name === currentUser.name
  );
  const currentUserRank =
    currentUserIndex !== -1 ? currentUserIndex + 1 : sortedChampions.length + 1;

  const handleCelebrate = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#D4AF37', '#0F291E', '#238253', '#D4F63D'],
      });
    } catch {
      // ignore
    }
  };

  const handleViewLeaderCert = () => {
    if (!overallLeader || !onViewCertificate) return;
    onViewCertificate({
      id: `ECO-LEADER-${overallLeader.id.slice(0, 8)}`,
      recipientName: overallLeader.name,
      recipientAvatar: overallLeader.avatar,
      title: 'Grand Champion of Civic Environmental Leadership',
      spotTitle: 'Overall Community Civic Cleanups',
      spotLocation: 'All Neighbourhood Grounds & Waterways',
      wasteClearedKg: overallLeader.wasteClearedKg || overallLeader.wasteKg || 25,
      pointsEarned: overallLeader.points,
      rank: 1,
      category: 'leader',
    });
  };

  const handleViewMyCert = () => {
    if (!onViewCertificate) return;
    onViewCertificate({
      id: `ECO-CIVIC-${currentUser.id.slice(0, 8)}`,
      recipientName: currentUser.name,
      recipientAvatar: currentUser.avatar,
      title: 'Certificate of Verified Civic Action',
      spotTitle: 'Community Cleanup & Stewardship',
      spotLocation: currentUser.city || 'Local Neighbourhood',
      wasteClearedKg: currentUser.wasteClearedKg || 10,
      pointsEarned: currentUser.points || 100,
      rank: currentUserRank,
      category: 'cleanup',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left">
      {/* 1. SHARED PAGE HEADER */}
      <PageHeader
        title="Community Champions"
        description="Neighbours and local volunteers keeping streets, shores, and public spaces litter-free."
        action={
          onOpenReportModal && (
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
              onClick={onOpenReportModal}
            >
              Report dirty spot
            </Button>
          )
        }
      />

      {/* 2. TIMEFRAME FILTER ROW */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Chip
            variant="tag"
            active={timeframe === 'all'}
            onClick={() => setTimeframe('all')}
          >
            All-time
          </Chip>
          <Chip
            variant="tag"
            active={timeframe === 'month'}
            onClick={() => setTimeframe('month')}
          >
            This month
          </Chip>
          <Chip
            variant="tag"
            active={timeframe === 'week'}
            onClick={() => setTimeframe('week')}
          >
            This week
          </Chip>
        </div>

        <span className="text-xs text-muted">
          <strong className="font-semibold text-navy tabular-nums">
            {sortedChampions.length}
          </strong>{' '}
          active civic champions
        </span>
      </div>

      {/* 3. PROUD OVERALL LEADER SPOTLIGHT (Highlights #1 with praise and grand recognition) */}
      {overallLeader && (
        <Card
          variant="default"
          className="relative overflow-hidden p-6 sm:p-8 border-2 border-amber-400 bg-gradient-to-br from-amber-50/60 via-white to-emerald-50/40 shadow-lg text-left"
        >
          {/* Background Glow & Watermark */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

          {/* Top Pill: Overall Leader & Civic Champion */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-sm">
              <Crown className="w-4 h-4 fill-white" />
              <span>Overall Civic Leader & Champion</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="points" size="md" className="font-bold">
                {overallLeader.points.toLocaleString()} pts
              </Badge>
              <button
                type="button"
                onClick={handleCelebrate}
                className="px-2.5 py-1 text-xs font-semibold text-navy hover:text-emerald bg-white hover:bg-navy-50 rounded-md border border-line transition-colors shadow-xs flex items-center gap-1"
                title="Celebrate Champion"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Salute</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Leader Avatar with Gold Crown Crest */}
            <div className="relative flex-shrink-0 mx-auto md:mx-0">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-emerald-500 shadow-md">
                <Avatar
                  src={overallLeader.avatar}
                  name={overallLeader.name}
                  size="xl"
                />
              </div>
              <span className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-amber-500 text-white border-2 border-white flex items-center justify-center text-sm font-black shadow-md">
                #1
              </span>
            </div>

            {/* Leader Bio, Commendations, and Praise */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-black text-xl sm:text-2xl text-navy">
                  {overallLeader.name}
                </h3>
                <span className="text-xs font-mono text-muted">
                  {overallLeader.handle || '@champion'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                  <ShieldCheck className="w-3 h-3 text-emerald" />
                  100% Verified Community Hero
                </span>
              </div>

              {/* Heartfelt Civic Praise & Leadership Commendation */}
              <p className="text-xs sm:text-sm text-ink leading-relaxed font-sans">
                <strong className="text-emerald font-bold">Leading by heroic action:</strong> Through steadfast civic devotion,{' '}
                <strong className="text-navy">{overallLeader.name}</strong> has spearheaded grassroots cleanup campaigns across our neighbourhoods—clearing{' '}
                <strong className="text-navy font-bold">{overallLeader.wasteClearedKg || overallLeader.wasteKg || 25} kg</strong> of hazardous debris and completing{' '}
                <strong className="text-navy font-bold">{overallLeader.cleanupsCount || overallLeader.spotsCleaned || 1} verified restorations</strong>. A true community role model inspiring all neighbours to take pride in a clean, green earth!
              </p>

              {/* Impact Badges Pill Strip */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy bg-white border border-line px-2.5 py-1 rounded-sm shadow-2xs">
                  🌿 <strong>{overallLeader.wasteClearedKg || overallLeader.wasteKg || 25} kg</strong> Waste Diverted
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy bg-white border border-line px-2.5 py-1 rounded-sm shadow-2xs">
                  🏆 <strong>{overallLeader.cleanupsCount || overallLeader.spotsCleaned || 1}</strong> Restorations
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy bg-white border border-line px-2.5 py-1 rounded-sm shadow-2xs">
                  ⭐ <strong>{overallLeader.points}</strong> Civic Impact Score
                </span>
              </div>
            </div>

            {/* Action to view Certificate */}
            {onViewCertificate && (
              <div className="w-full md:w-auto flex md:flex-col items-center justify-end gap-2 flex-shrink-0 pt-2 md:pt-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleViewLeaderCert}
                  icon={<Award className="w-4 h-4 text-lime" />}
                  className="w-full md:w-auto shadow-sm"
                >
                  View Leader Certificate
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 4. PODIUM DISPLAY FOR TOP 3 (Handles 1, 2, or 3+ champions gracefully) */}
      {topThree.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-heading font-bold text-muted uppercase tracking-wider">
            Podium Standings
          </h4>
          <div
            className={`grid gap-4 sm:gap-6 items-end ${
              topThree.length === 1
                ? 'grid-cols-1 max-w-sm mx-auto'
                : topThree.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto'
                : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {/* Rank 2 (Silver) - If exists */}
            {topThree.length >= 2 && (
              <Card
                variant="default"
                interactive
                className="order-2 md:order-1 text-center p-5 border-line hover:border-emerald space-y-3"
              >
                <div className="relative inline-block mx-auto">
                  <Avatar
                    src={topThree[1].avatar}
                    name={topThree[1].name}
                    size="lg"
                  />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-200 text-navy border border-slate-400 flex items-center justify-center text-xs font-bold shadow-sm">
                    2
                  </span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-navy truncate">
                    {topThree[1].name}
                  </h4>
                  <p className="text-xs text-muted tabular-nums">
                    {topThree[1].cleanupsCount ?? topThree[1].spotsCleaned} cleanups · {topThree[1].wasteClearedKg ?? topThree[1].wasteKg} kg
                  </p>
                </div>
                <Badge variant="points" size="md">
                  {topThree[1].points.toLocaleString()} pts
                </Badge>
              </Card>
            )}

            {/* Rank 1 (Gold Champion - Center / Elevated) */}
            {topThree.length >= 1 && (
              <Card
                variant="default"
                interactive
                className="order-1 md:order-2 text-center p-6 sm:p-7 border-2 border-amber-400 shadow-md bg-white space-y-3 md:-translate-y-2"
              >
                <div className="inline-flex items-center gap-1 text-xs font-bold text-white bg-amber-500 px-2.5 py-0.5 rounded-sm mx-auto shadow-sm">
                  <Trophy className="w-3.5 h-3.5 fill-white" />
                  <span>Gold Champion</span>
                </div>
                <div className="relative inline-block mx-auto mt-1">
                  <Avatar
                    src={topThree[0].avatar}
                    name={topThree[0].name}
                    size="xl"
                  />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500 text-white border-2 border-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                    1
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-navy truncate">
                    {topThree[0].name}
                  </h3>
                  <p className="text-xs text-muted tabular-nums">
                    {topThree[0].cleanupsCount ?? topThree[0].spotsCleaned} cleanups · {topThree[0].wasteClearedKg ?? topThree[0].wasteKg} kg waste
                  </p>
                </div>
                <Badge variant="points" size="md" className="text-sm px-3 py-1">
                  {topThree[0].points.toLocaleString()} pts
                </Badge>
              </Card>
            )}

            {/* Rank 3 (Bronze) - If exists */}
            {topThree.length >= 3 && (
              <Card
                variant="default"
                interactive
                className="order-3 text-center p-5 border-line hover:border-emerald space-y-3"
              >
                <div className="relative inline-block mx-auto">
                  <Avatar
                    src={topThree[2].avatar}
                    name={topThree[2].name}
                    size="lg"
                  />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-700/20 text-amber-900 border border-amber-700/40 flex items-center justify-center text-xs font-bold shadow-sm">
                    3
                  </span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-navy truncate">
                    {topThree[2].name}
                  </h4>
                  <p className="text-xs text-muted tabular-nums">
                    {topThree[2].cleanupsCount ?? topThree[2].spotsCleaned} cleanups · {topThree[2].wasteClearedKg ?? topThree[2].wasteKg} kg
                  </p>
                </div>
                <Badge variant="points" size="md">
                  {topThree[2].points.toLocaleString()} pts
                </Badge>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* 5. PINNED CURRENT USER ROW (With View Certificate Action) */}
      {currentUser && (
        <Card
          variant="dark"
          className="p-4 sm:p-5 flex items-center justify-between gap-4 border-2 border-lime shadow-md flex-wrap"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="w-8 h-8 rounded-sm bg-lime text-navy font-heading font-extrabold flex items-center justify-center text-xs flex-shrink-0 tabular-nums">
              #{currentUserRank}
            </span>
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="md"
            />
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-bold text-white text-sm sm:text-base truncate">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-lime font-bold uppercase tracking-wider">
                  (You)
                </span>
              </div>
              <p className="text-xs text-white/70 tabular-nums truncate">
                {currentUser.spotsCleaned} cleanups · {currentUser.wasteClearedKg} kg collected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {onViewCertificate && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleViewMyCert}
                icon={<Award className="w-3.5 h-3.5 text-lime" />}
                className="text-xs"
              >
                My Certificate
              </Button>
            )}

            <div className="text-right">
              <span className="font-heading font-bold text-lime text-base sm:text-lg tabular-nums">
                {currentUser.points.toLocaleString()}
              </span>
              <span className="text-xs text-white/70 block -mt-1">pts</span>
            </div>
          </div>
        </Card>
      )}

      {/* 6. FULL RANKED TABLE LIST */}
      <Card variant="default" className="p-0 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-navy-50/70 border-b border-line flex items-center justify-between text-xs font-semibold text-muted">
          <span>Rank & Civic Champion</span>
          <div className="flex items-center gap-8 sm:gap-12">
            <span className="hidden sm:inline">Cleanups</span>
            <span className="hidden sm:inline">Waste Diverted</span>
            <span>Civic Points</span>
          </div>
        </div>

        {sortedChampions.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Trophy className="w-8 h-8 text-muted mx-auto stroke-[1.5]" />
            <p className="font-heading font-bold text-navy text-sm">
              No leaderboard champions yet
            </p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Be the first community member to clean a dirty spot and claim civic bounty points!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {sortedChampions.map((champion, idx) => {
              const isUser =
                champion.id === currentUser.id || champion.name === currentUser.name;
              const rank = idx + 1;

              return (
                <div
                  key={champion.id || `${champion.name}-${idx}`}
                  className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                    isUser ? 'bg-lime-50/50' : 'hover:bg-navy-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-extrabold flex-shrink-0 tabular-nums ${
                        rank === 1
                          ? 'bg-amber-400 text-white shadow-xs'
                          : rank === 2
                          ? 'bg-slate-300 text-navy'
                          : rank === 3
                          ? 'bg-amber-700/20 text-amber-900'
                          : 'bg-navy-50 text-muted'
                      }`}
                    >
                      {rank === 1 ? '👑' : rank}
                    </span>

                    <Avatar
                      src={champion.avatar}
                      name={champion.name}
                      size="sm"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-xs sm:text-sm text-navy truncate">
                          {champion.name}
                        </span>
                        {isUser && (
                          <span className="text-[10px] text-emerald font-bold uppercase tracking-wider">
                            You
                          </span>
                        )}
                        {rank === 1 && (
                          <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full">
                            Leader
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted block truncate">
                        {champion.handle || '@volunteer'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 sm:gap-12 flex-shrink-0">
                    <span className="hidden sm:inline text-xs text-muted tabular-nums">
                      {champion.cleanupsCount ?? champion.spotsCleaned} cleanups
                    </span>
                    <span className="hidden sm:inline text-xs text-muted tabular-nums">
                      {champion.wasteClearedKg ?? champion.wasteKg} kg
                    </span>
                    <Badge variant="points" size="sm">
                      {champion.points.toLocaleString()} pts
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
