import React, { useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
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

  // Filter out any mock users
  const cleanData = leaderboardData.filter((item) => item.id !== 'user_current' && item.id !== 'guest');
  const top3 = cleanData.slice(0, 3);
  const remaining = cleanData.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <Trophy className="w-5 h-5 text-emerald-600" />
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
          <div className="flex items-center bg-slate-100 border border-slate-200/80 p-1 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
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
        {currentUser && currentUser.id !== 'guest' && (
          <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between flex-wrap gap-3.5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 text-xs">⭐</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    {currentUser.name} (You)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
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
              <span className="font-mono font-black text-xl sm:text-2xl text-emerald-600">
                {currentUser.points.toLocaleString()} pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Podium Cards for Top 3 */}
      {top3.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {top3.map((item, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;

            const crownColor = isFirst
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : isSecond
              ? 'bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-orange-100 text-orange-800 border-orange-300';

            const medalTitle = isFirst ? '🥇 #1 Champion' : isSecond ? '🥈 #2 Runner-up' : '🥉 #3 Contender';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 text-center relative overflow-hidden transition-all shadow-xs ${
                  isFirst
                    ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Top line accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'
                      : isSecond
                      ? 'bg-gradient-to-r from-slate-300 to-emerald-400'
                      : 'bg-gradient-to-r from-orange-400 to-rose-400'
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
                      isFirst ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-slate-200'
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
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.badge}
                </span>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Cleanups</span>
                    <span className="font-mono font-bold text-slate-800">
                      {item.spotsCleaned}
                    </span>
                  </div>
                  <div className="border-r border-slate-100" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Civic Points</span>
                    <span className="font-mono font-black text-emerald-600">
                      {item.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-10 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
            🏆
          </div>
          <h3 className="text-base font-bold text-slate-900">No Cleanups Recorded Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first volunteer to report a littered spot and submit verified cleanup proof to claim the #1 spot on the leaderboard!
          </p>
        </div>
      )}

      {/* Remaining Leaderboard Table */}
      {remaining.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-2">
            <Medal className="w-4 h-4 text-emerald-600" />
            <span>Full Community Rankings</span>
          </div>
          <div className="divide-y divide-slate-100">
            {remaining.map((user) => {
              const isUser = currentUser && (user.id === currentUser.id || user.isCurrentUser);

              return (
                <div
                  key={user.id}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                    isUser ? 'bg-emerald-50/70' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Left: Rank & Avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-mono font-extrabold text-xs text-slate-400">
                      #{user.rank}
                    </span>

                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {user.name}
                        </span>
                        {isUser && (
                          <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
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
                  <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 text-right">
                    <div className="hidden sm:block">
                      <span className="text-[10px] text-slate-400 block font-bold">Cleanups</span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {user.spotsCleaned}
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <span className="text-[10px] text-slate-400 block font-bold">Waste Cleared</span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {user.wasteKg} kg
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Points</span>
                      <span className="font-mono font-black text-sm sm:text-base text-emerald-600">
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
