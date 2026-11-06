import React, { useState } from 'react';
import type { UserProfile, LeaderboardItem } from '../types';
import { Trophy, Medal, Award, Sparkles, Flame, Plus } from 'lucide-react';
import {
  PageHeader,
  Card,
  Avatar,
  Badge,
  Chip,
  Button,
} from './ui';

interface LeaderboardProps {
  currentUser: UserProfile;
  leaderboardData: LeaderboardItem[];
  onOpenReportModal?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  leaderboardData,
  onOpenReportModal,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  // Filter out any dummy entries and sort by points descending
  const sortedChampions = [...leaderboardData]
    .filter((item) => item.id !== 'guest')
    .sort((a, b) => b.points - a.points);

  const topThree = sortedChampions.slice(0, 3);
  const remainingList = sortedChampions.slice(3);

  // User rank calculation
  const currentUserIndex = sortedChampions.findIndex(
    (c) => c.id === currentUser.id || c.name === currentUser.name
  );
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : sortedChampions.length + 1;

  return (
    <div className="space-y-6 sm:space-y-8">
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
          <strong className="font-semibold text-navy tabular-nums">{sortedChampions.length}</strong> active champions
        </span>
      </div>

      {/* 3. PODIUM FOR TOP 3 (Lime/Emerald accent cards) */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end pt-4">
          {/* Rank 2 (Silver) */}
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
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-navy-50 text-navy border border-line flex items-center justify-center text-xs font-bold shadow-sm">
                2
              </span>
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-navy truncate">
                {topThree[1].name}
              </h4>
              <p className="text-xs text-muted tabular-nums">
                {topThree[1].cleanupsCount ?? topThree[1].spotsCleaned} cleanups
              </p>
            </div>
            <Badge variant="points" size="md">
              {topThree[1].points.toLocaleString()} pts
            </Badge>
          </Card>

          {/* Rank 1 (Lime Champion Center - Elevated) */}
          <Card
            variant="default"
            interactive
            className="order-1 md:order-2 text-center p-6 sm:p-7 border-2 border-emerald shadow-md bg-white space-y-3 md:-translate-y-2"
          >
            <div className="inline-flex items-center gap-1 text-xs font-bold text-navy bg-lime px-2.5 py-0.5 rounded-sm mx-auto shadow-sm">
              <Trophy className="w-3.5 h-3.5 fill-navy" />
              <span>Civic Champion</span>
            </div>
            <div className="relative inline-block mx-auto mt-1">
              <Avatar
                src={topThree[0].avatar}
                name={topThree[0].name}
                size="xl"
              />
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-lime text-navy border-2 border-emerald flex items-center justify-center text-xs font-extrabold shadow-sm">
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

          {/* Rank 3 (Bronze) */}
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
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-navy-50 text-navy border border-line flex items-center justify-center text-xs font-bold shadow-sm">
                3
              </span>
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-navy truncate">
                {topThree[2].name}
              </h4>
              <p className="text-xs text-muted tabular-nums">
                {topThree[2].cleanupsCount ?? topThree[2].spotsCleaned} cleanups
              </p>
            </div>
            <Badge variant="points" size="md">
              {topThree[2].points.toLocaleString()} pts
            </Badge>
          </Card>
        </div>
      )}

      {/* 4. PINNED CURRENT USER ROW (Always visible) */}
      {currentUser && (
        <Card
          variant="dark"
          className="p-4 sm:p-5 flex items-center justify-between gap-4 border-2 border-lime shadow-md"
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
              <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <span className="font-heading font-bold text-lime text-base sm:text-lg tabular-nums">
                {currentUser.points.toLocaleString()}
              </span>
              <span className="text-xs text-white/70 block -mt-1">pts</span>
            </div>
          </div>
        </Card>
      )}

      {/* 5. RANKED TABLE LIST (Cards style) */}
      <Card variant="default" className="p-0 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-navy-50/70 border-b border-line flex items-center justify-between text-xs font-semibold text-muted">
          <span>Rank & Volunteer</span>
          <div className="flex items-center gap-8 sm:gap-12">
            <span className="hidden sm:inline">Cleanups</span>
            <span>Civic Points</span>
          </div>
        </div>

        <div className="divide-y divide-line">
          {sortedChampions.map((champion, idx) => {
            const isUser = champion.id === currentUser.id || champion.name === currentUser.name;
            const rank = idx + 1;

            return (
              <div
                key={champion.id}
                className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                  isUser
                    ? 'bg-emerald-50/40 font-medium'
                    : 'hover:bg-navy-50/50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-7 text-xs font-heading font-bold tabular-nums text-center ${
                      rank <= 3 ? 'text-emerald' : 'text-muted'
                    }`}
                  >
                    #{rank}
                  </span>

                  <Avatar
                    src={champion.avatar}
                    name={champion.name}
                    size="sm"
                  />

                  <div className="min-w-0 text-left">
                    <p className="text-xs sm:text-sm font-semibold text-navy truncate">
                      {champion.name} {isUser && <span className="text-emerald text-[11px] font-semibold">(You)</span>}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {champion.wasteClearedKg ?? champion.wasteKg} kg cleared
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 sm:gap-12 flex-shrink-0">
                  <span className="text-xs text-muted tabular-nums hidden sm:inline">
                    {champion.cleanupsCount ?? champion.spotsCleaned}
                  </span>
                  <Badge variant="points" size="sm">
                    {champion.points.toLocaleString()} pts
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
