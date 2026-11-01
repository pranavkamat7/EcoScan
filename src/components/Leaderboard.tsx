import React, { useState } from 'react';
import { Trophy, Award, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface LeaderboardProps {
  currentUser: UserProfile;
  leaderboardData: Array<{
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
  }>;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  leaderboardData,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'month'>('all');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-lg border border-[#E3E3DC] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-[#181A19]">Civic Champions Leaderboard</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#535A55]">
              Real neighbors transforming public spaces, streets, and trails.
            </p>
          </div>

          {/* Timeframe toggle */}
          <div className="flex items-center bg-[#F2F2EC] border border-[#E3E3DC] p-1 rounded-md self-start">
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                timeframe === 'all'
                  ? 'bg-white text-[#181A19] shadow-sm'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              All-Time
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                timeframe === 'month'
                  ? 'bg-white text-[#181A19] shadow-sm'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Current User Quick Summary Bar */}
        <div className="mt-5 p-3.5 bg-[#F2F7F4] rounded-md border border-[#4D8262]/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-[#4D8262]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#14231A]">{currentUser.name} (You)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2D513B] text-white">
                  {currentUser.level}
                </span>
              </div>
              <p className="text-xs text-[#535A55]">
                {currentUser.spotsCleaned} cleanups completed • {currentUser.wasteClearedKg} kg cleared
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#535A55] block">Your Balance</span>
            <span className="font-mono font-bold text-base text-[#2D513B]">
              {currentUser.points} pts
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-lg border border-[#E3E3DC] overflow-hidden shadow-sm">
        <div className="divide-y divide-[#F0EFEA]">
          {leaderboardData.map((user) => {
            const isUser = user.id === currentUser.id || user.isCurrentUser;

            return (
              <div
                key={user.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-3 transition-colors ${
                  isUser ? 'bg-[#F2F7F4]/60' : 'hover:bg-[#F9F9F6]'
                }`}
              >
                {/* Left: Rank & Avatar */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-7 text-center font-mono font-bold text-sm text-[#7E8681] flex-shrink-0">
                    {user.rank === 1 ? (
                      <span className="text-amber-600 text-base">🥇</span>
                    ) : user.rank === 2 ? (
                      <span className="text-stone-400 text-base">🥈</span>
                    ) : user.rank === 3 ? (
                      <span className="text-amber-700 text-base">🥉</span>
                    ) : (
                      `#${user.rank}`
                    )}
                  </div>

                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#E3E3DC] flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#181A19] truncate">
                        {user.name}
                      </span>
                      {isUser && (
                        <span className="text-[10px] uppercase font-bold text-[#2D513B] bg-[#E7EFEA] px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#7E8681]">
                      <span className="truncate">{user.handle}</span>
                      <span>•</span>
                      <span className="text-[#2C302D]">{user.badge}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Cleanups & Points */}
                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 text-right">
                  <div className="hidden sm:block">
                    <span className="text-[11px] text-[#7E8681] block">Cleanups</span>
                    <span className="font-mono text-sm font-semibold text-[#181A19]">
                      {user.spotsCleaned}
                    </span>
                  </div>

                  <div className="hidden sm:block">
                    <span className="text-[11px] text-[#7E8681] block">Waste</span>
                    <span className="font-mono text-sm font-semibold text-[#181A19]">
                      {user.wasteKg} kg
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#7E8681] block">Civic Points</span>
                    <span className="font-mono font-bold text-sm sm:text-base text-[#2D513B]">
                      {user.points.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

