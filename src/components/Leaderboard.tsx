import React, { useState } from 'react';
import { Trophy, Medal, Sparkles } from 'lucide-react';
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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Civic Champions Leaderboard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Honoring community volunteers actively restoring public parks, trails, waterways, and neighborhoods.
            </p>
          </div>

          {/* Timeframe toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All-Time
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Current User Quick Summary Bar */}
        <div className="mt-6 p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between flex-wrap gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-violet-500 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 text-xs">⭐</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  {currentUser.name} (You)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-bold">
                  {currentUser.level}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentUser.spotsCleaned} cleanups completed • {currentUser.wasteClearedKg} kg cleared
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block font-bold">
              Your Civic Balance
            </span>
            <span className="font-mono font-black text-xl sm:text-2xl text-amber-600">
              {currentUser.points.toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>

      {/* Podium Cards for Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map((item, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;

            const crownColor = isFirst
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : isSecond
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : 'bg-orange-100 text-orange-800 border-orange-300';

            const medalTitle = isFirst ? '🥇 #1 Champion' : isSecond ? '🥈 #2 Runner-up' : '🥉 #3 Contender';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 text-center relative overflow-hidden transition-all shadow-sm hover:shadow-md ${
                  isFirst
                    ? 'border-amber-300 ring-2 ring-amber-400/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Top line accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'
                      : isSecond
                      ? 'bg-gradient-to-r from-slate-300 to-indigo-300'
                      : 'bg-gradient-to-r from-orange-400 to-rose-500'
                  }`}
                />

                <div className="absolute top-3.5 right-3.5">
                  <span
                    className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${crownColor}`}
                  >
                    {medalTitle}
                  </span>
                </div>

                <div className="relative inline-block mx-auto mb-3 mt-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className={`w-16 h-16 rounded-full object-cover border-2 shadow-sm mx-auto ${
                      isFirst ? 'border-amber-400 ring-4 ring-amber-100' : 'border-slate-200'
                    }`}
                  />
                  {isFirst && (
                    <div className="absolute -top-2.5 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-sm shadow-sm animate-bounce">
                      👑
                    </div>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 truncate">{item.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{item.handle}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {item.badge}
                </span>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">Cleanups</span>
                    <span className="font-mono font-bold text-slate-800">
                      {item.spotsCleaned}
                    </span>
                  </div>
                  <div className="border-r border-slate-200" />
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">Civic Points</span>
                    <span className="font-mono font-black text-amber-600">
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-2">
            <Medal className="w-4 h-4 text-violet-600" />
            <span>Full Community Rankings</span>
          </div>
          <div className="divide-y divide-slate-100">
            {remaining.map((user) => {
              const isUser = user.id === currentUser.id || user.isCurrentUser;

              return (
                <div
                  key={user.id}
                  className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                    isUser ? 'bg-purple-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left: Rank & Avatar */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-center font-mono font-extrabold text-xs text-slate-400">
                      #{user.rank}
                    </span>

                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {user.name}
                        </span>
                        {isUser && (
                          <span className="text-[10px] uppercase font-extrabold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="truncate">{user.handle}</span>
                        <span>•</span>
                        <span className="text-slate-700 font-medium">{user.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Cleanups & Points */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 text-right">
                    <div className="hidden sm:block">
                      <span className="text-[10px] text-slate-400 block font-bold">Cleanups</span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {user.spotsCleaned}
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <span className="text-[10px] text-slate-400 block font-bold">Waste Cleared</span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {user.wasteKg} kg
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Points</span>
                      <span className="font-mono font-black text-sm sm:text-base text-amber-600">
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
