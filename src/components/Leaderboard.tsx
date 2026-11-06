import React, { useState } from 'react';
import type { UserProfile, LeaderboardItem } from '../types';
import { Avatar } from './Avatar';

interface LeaderboardProps {
  currentUser: UserProfile;
  leaderboardData: LeaderboardItem[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  leaderboardData,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'month'>('all');

  const cleanData = leaderboardData.filter(
    (item) => item.id !== 'user_current' && item.id !== 'guest'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Editorial Header */}
      <div className="bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C2B24] tracking-tight">
              Community leaderboard
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7468] mt-0.5">
              Neighbours and volunteers keeping our streets, parks, and shorelines litter-free.
            </p>
          </div>

          {/* Timeframe toggle: Quiet text buttons */}
          <div className="flex items-center gap-1 border border-[#E2DCCD] p-1 rounded-[6px] self-start bg-[#F4F1EA]">
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded-[4px] text-xs transition-colors ${
                timeframe === 'all'
                  ? 'bg-[#FFFDF8] text-[#1C2B24] font-semibold shadow-subtle'
                  : 'text-[#6B7468] hover:text-[#1C2B24]'
              }`}
            >
              All-time
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded-[4px] text-xs transition-colors ${
                timeframe === 'month'
                  ? 'bg-[#FFFDF8] text-[#1C2B24] font-semibold shadow-subtle'
                  : 'text-[#6B7468] hover:text-[#1C2B24]'
              }`}
            >
              This month
            </button>
          </div>
        </div>

        {/* Current User Quick Summary Strip */}
        {currentUser && currentUser.id !== 'guest' && (
          <div className="pt-3 border-t border-[#E2DCCD] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                size="sm"
              />
              <div>
                <span className="text-xs font-semibold text-[#1C2B24]">
                  {currentUser.name} (You)
                </span>
                <span className="text-xs text-[#6B7468] ml-2">
                  <span className="tabular-nums">{currentUser.spotsCleaned}</span> cleanups ·{' '}
                  <span className="tabular-nums">{currentUser.wasteClearedKg} kg</span> collected
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-[#1E6B4B] tabular-nums">
                {currentUser.points.toLocaleString()} pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rankings List */}
      {cleanData.length > 0 ? (
        <div className="bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] overflow-hidden shadow-subtle">
          <div className="px-4 py-2.5 bg-[#F4F1EA] border-b border-[#E2DCCD] flex items-center justify-between text-xs text-[#6B7468] font-medium">
            <span>Rank & Volunteer</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">Cleanups</span>
              <span>Points</span>
            </div>
          </div>

          <div className="divide-y divide-[#E2DCCD]">
            {cleanData.map((user, idx) => {
              const isUser = currentUser && (user.id === currentUser.id || user.isCurrentUser);

              return (
                <div
                  key={user.id}
                  className={`px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 transition-colors ${
                    isUser ? 'bg-[#EAF3EE]' : 'hover:bg-[#F4F1EA]/60'
                  }`}
                >
                  {/* Left: Rank & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-semibold text-[#6B7468] tabular-nums">
                      {idx + 1}.
                    </span>

                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="sm"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-[#1C2B24] truncate">
                          {user.name}
                        </span>
                        {isUser && (
                          <span className="text-[10px] font-semibold text-[#1E6B4B] bg-white px-1.5 py-0.5 rounded-[4px] border border-[#E2DCCD]">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7468] truncate">
                        {user.handle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Cleanups & Points */}
                  <div className="flex items-center gap-6 text-right flex-shrink-0">
                    <span className="text-xs text-[#6B7468] tabular-nums hidden sm:inline">
                      {user.spotsCleaned}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-[#1E6B4B] tabular-nums">
                      {user.points.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] p-8 text-center space-y-2">
          <p className="font-serif text-base font-bold text-[#1C2B24]">
            No cleanups recorded yet
          </p>
          <p className="text-xs text-[#6B7468] max-w-sm mx-auto">
            Be the first volunteer to report a littered spot and clean it up to lead the neighbourhood board.
          </p>
        </div>
      )}
    </div>
  );
};
