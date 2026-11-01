import React, { useState } from 'react';
import { Trophy, Award, Sparkles, Medal, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import type { UserProfile, LeaderboardItem } from '../types';

interface LeaderboardProps {
  currentUser: UserProfile;
  leaderboardData: LeaderboardItem[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  leaderboardData,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'month'>('all');

  const top3 = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#E3E3DC] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Trophy className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#181A19]">
                Civic Champions Leaderboard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#535A55]">
              Real volunteers transforming neglected public spots, alleys, and shorelines.
            </p>
          </div>

          {/* Timeframe toggle */}
          <div className="flex items-center bg-[#F2F2EC] border border-[#E3E3DC] p-1 rounded-md self-start">
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                timeframe === 'all'
                  ? 'bg-white text-[#181A19] shadow-xs'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              All-Time
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                timeframe === 'month'
                  ? 'bg-white text-[#181A19] shadow-xs'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Current User Quick Summary Bar */}
        <div className="mt-5 p-4 bg-[#F2F7F4] rounded-lg border-2 border-[#4D8262]/25 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#2D513B] shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#14231A]">
                  {currentUser.name} (You)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2D513B] text-white font-bold">
                  {currentUser.level}
                </span>
              </div>
              <p className="text-xs text-[#535A55] mt-0.5">
                {currentUser.spotsCleaned} cleanups completed • {currentUser.wasteClearedKg} kg cleared
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#7E8681] font-mono uppercase tracking-wider block">
              Your Civic Balance
            </span>
            <span className="font-mono font-bold text-lg sm:text-xl text-[#2D513B]">
              {currentUser.points.toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>

      {/* Podium Cards for Top 3 (if at least 1 person exists) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {top3.map((item, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            const crownColor = isFirst
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : isSecond
              ? 'bg-stone-100 text-stone-700 border-stone-300'
              : 'bg-amber-50 text-amber-900 border-amber-200';

            const medalEmoji = isFirst ? '🥇 #1' : isSecond ? '🥈 #2' : '🥉 #3';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-5 text-center relative overflow-hidden transition-all shadow-xs hover:shadow-card ${
                  isFirst
                    ? 'border-amber-300 ring-2 ring-amber-400/20'
                    : 'border-[#E3E3DC]'
                }`}
              >
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${crownColor}`}
                  >
                    {medalEmoji}
                  </span>
                </div>

                <div className="relative inline-block mx-auto mb-3 mt-1">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md mx-auto ring-2 ring-[#E3E3DC]"
                  />
                  {isFirst && (
                    <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      👑
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-sm text-[#181A19] truncate">{item.name}</h3>
                <p className="text-[11px] text-[#7E8681] font-mono">{item.handle}</p>

                <div className="mt-3 pt-3 border-t border-[#F0EFEA] flex justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-[#7E8681] block">Cleanups</span>
                    <span className="font-mono font-bold text-[#181A19]">
                      {item.spotsCleaned}
                    </span>
                  </div>
                  <div className="border-r border-[#F0EFEA]" />
                  <div>
                    <span className="text-[10px] text-[#7E8681] block">Civic Points</span>
                    <span className="font-mono font-bold text-[#2D513B]">
                      {item.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remaining Leaderboard Table */}
      {remaining.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E3DC] overflow-hidden shadow-xs">
          <div className="p-3.5 bg-[#F9F9F6] border-b border-[#E3E3DC] text-xs font-semibold text-[#535A55] uppercase tracking-wider font-mono">
            Full Community Rankings
          </div>
          <div className="divide-y divide-[#F0EFEA]">
            {remaining.map((user) => {
              const isUser = user.id === currentUser.id || user.isCurrentUser;

              return (
                <div
                  key={user.id}
                  className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                    isUser ? 'bg-[#F2F7F4]/60' : 'hover:bg-[#F9F9F6]'
                  }`}
                >
                  {/* Left: Rank & Avatar */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-center font-mono font-bold text-xs text-[#7E8681]">
                      #{user.rank}
                    </span>

                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#E3E3DC] flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#181A19] truncate">
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
                      <span className="text-[10px] text-[#7E8681] block">Cleanups</span>
                      <span className="font-mono text-xs font-bold text-[#181A19]">
                        {user.spotsCleaned}
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <span className="text-[10px] text-[#7E8681] block">Waste Cleared</span>
                      <span className="font-mono text-xs font-bold text-[#181A19]">
                        {user.wasteKg} kg
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#7E8681] block">Points</span>
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
      )}
    </div>
  );
};
