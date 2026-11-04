import React, { useState } from 'react';
import {
  Compass,
  Map,
  Trophy,
  Award,
  Plus,
  ChevronDown,
  Sparkles,
  LogIn,
  LogOut,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { useAuth } from '../firebase/authContext';

export type NavTab = 'feed' | 'map' | 'leaderboard' | 'rewards';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenReportModal: () => void;
  currentUser: UserProfile;
  isGuest?: boolean;
  onRequireAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenReportModal,
  currentUser,
  isGuest = false,
  onRequireAuth,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isGuestMode = isGuest || !user;

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_1px_8px_rgba(15,23,42,0.03)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo - Official Camera Emblem & Typography */}
          <div className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className="flex items-center group focus:outline-none"
              title="GarbageMedia — Home"
            >
              <img
                src="/logo-horizontal.png"
                alt="GarbageMedia"
                className="h-9 sm:h-11 w-auto max-w-[180px] sm:max-w-none object-contain transition-transform group-hover:scale-[1.02]"
              />
            </button>
          </div>

          {/* Desktop Navigation Links - Centered & Premium Segmented Pill */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 shadow-xs">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[38px] ${
                currentTab === 'feed'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Feed</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('map')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[38px] ${
                currentTab === 'map'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Map</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[38px] ${
                currentTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('rewards')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[38px] ${
                currentTab === 'rewards'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Rewards</span>
            </button>
          </nav>

          {/* Right Actions: User Menu & Report CTA */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* If in Guest Mode, show a Sign In Button */}
            {isGuestMode && onRequireAuth && (
              <button
                type="button"
                onClick={onRequireAuth}
                className="h-11 px-4 text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200/90 rounded-2xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span>Sign In</span>
              </button>
            )}

            {/* CTA Button: High-End Emerald Gradient */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="h-11 px-4 sm:px-5 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
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
                className="h-11 flex items-center gap-2.5 px-3 sm:px-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                  />
                  {!isGuestMode && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-slate-900 block leading-none truncate max-w-[105px]">
                    {currentUser.name}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-600 font-extrabold block leading-tight mt-0.5">
                    {currentUser.points} pts
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-modal p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900 truncate text-sm">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.handle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {isGuestMode ? 'Guest Mode' : currentUser.level}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 font-black">
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
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between font-medium transition-colors"
                  >
                    <span>My Rewards & Badges</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </button>

                  {isGuestMode && onRequireAuth ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onRequireAuth();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 font-bold transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-emerald-600" />
                      <span>Sign In or Register</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        if (onRequireAuth) onRequireAuth();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 flex items-center justify-between font-medium transition-colors"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors ${
            currentTab === 'feed'
              ? 'text-emerald-700 bg-emerald-50'
              : 'text-slate-500 hover:text-[#17171F]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Feed</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors ${
            currentTab === 'map'
              ? 'text-emerald-700 bg-emerald-50'
              : 'text-slate-500 hover:text-[#17171F]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Map</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('leaderboard')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors ${
            currentTab === 'leaderboard'
              ? 'text-emerald-700 bg-emerald-50'
              : 'text-slate-500 hover:text-[#17171F]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Ranks</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('rewards')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors ${
            currentTab === 'rewards'
              ? 'text-emerald-700 bg-emerald-50'
              : 'text-slate-500 hover:text-[#17171F]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rewards</span>
        </button>
      </nav>
    </>
  );
};
