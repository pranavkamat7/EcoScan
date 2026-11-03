import React, { useState } from 'react';
import {
  Compass,
  Map,
  Trophy,
  Award,
  Plus,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { useAuth } from '../firebase/authContext';
import { resetToDemoData } from '../utils/storage';

export type NavTab = 'feed' | 'map' | 'leaderboard' | 'rewards';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenReportModal: () => void;
  currentUser: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenReportModal,
  currentUser,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to sample state?')) {
      resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-btn-purple group-hover:scale-105 transition-all">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none block">
                    Garbage<span className="bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">Media</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 hidden sm:inline">
                    Civic Proof
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:block font-medium mt-1">
                  Community Cleanups & Before/After Proofs
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Segmented Pill Dock) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'feed'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'map'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('leaderboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('rewards')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'rewards'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Rewards</span>
            </button>
          </nav>

          {/* Right Actions: User Menu & Report CTA */}
          <div className="flex items-center gap-3">
            {/* CTA Button: High-impact Sunset Orange-Red */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="h-10 px-4 sm:px-5 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-btn-orange hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Report Dirty Spot</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-10 flex items-center gap-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-violet-300 shadow-xs transition-colors"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-violet-400"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet-500 border border-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-slate-900 block leading-none truncate max-w-[95px]">
                    {currentUser.name}
                  </span>
                  <span className="font-mono text-[10px] text-amber-600 font-extrabold block leading-tight mt-0.5">
                    {currentUser.points} pts
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-modal p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.handle}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        {currentUser.level}
                      </span>
                      <span className="text-[10px] font-mono text-amber-600 font-bold">
                        {currentUser.points} pts
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('rewards');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between font-medium"
                  >
                    <span>My Rewards & Badges</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleResetData();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data</span>
                  </button>

                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 flex items-center justify-between font-medium"
                    >
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold ${
            currentTab === 'feed' ? 'text-violet-600' : 'text-slate-500'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Feed</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold ${
            currentTab === 'map' ? 'text-violet-600' : 'text-slate-500'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Map</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('leaderboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold ${
            currentTab === 'leaderboard' ? 'text-violet-600' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Ranks</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('rewards')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold ${
            currentTab === 'rewards' ? 'text-violet-600' : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rewards</span>
        </button>
      </nav>
    </>
  );
};
