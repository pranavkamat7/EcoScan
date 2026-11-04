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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none"
            >
              <img
                src="/logo.png"
                alt="GarbageMedia"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-[#17171F] tracking-tight leading-none block">
                    Garbage<span className="text-[#16A34A]">Media</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-green-50 text-[#16A34A] border border-green-200 hidden sm:inline">
                    Civic Proof
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:block font-medium mt-0.5">
                  Community Cleanups & Before/After Proofs
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'feed'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#17171F] hover:bg-white/60'
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
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#17171F] hover:bg-white/60'
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
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#17171F] hover:bg-white/60'
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
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#17171F] hover:bg-white/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Rewards</span>
            </button>
          </nav>

          {/* Right Actions: User Menu & Report CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* If in Guest Mode, show a Sign In Button */}
            {isGuestMode && onRequireAuth && (
              <button
                type="button"
                onClick={onRequireAuth}
                className="h-10 px-3 sm:px-3.5 text-xs font-bold bg-green-50 hover:bg-green-100 text-[#16A34A] border border-green-200 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* CTA Button: Vibrant Green */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-extrabold bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl shadow-btn-green hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2"
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
                className="h-10 flex items-center gap-2 px-2.5 sm:px-3 rounded-xl bg-white border border-slate-200 hover:border-green-300 shadow-xs transition-colors"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-green-500"
                  />
                  {!isGuestMode && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#16A34A] border border-white" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-[#17171F] block leading-none truncate max-w-[95px]">
                    {currentUser.name}
                  </span>
                  <span className="font-mono text-[10px] text-[#16A34A] font-extrabold block leading-tight mt-0.5">
                    {currentUser.points} pts
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-modal p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-[#17171F] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.handle}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-green-50 text-[#16A34A] border border-green-200 font-bold">
                        {isGuestMode ? 'Guest Mode' : currentUser.level}
                      </span>
                      <span className="text-[10px] font-mono text-[#16A34A] font-bold">
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
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#17171F] flex items-center justify-between font-medium"
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
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-green-50 text-[#16A34A] flex items-center gap-2 font-bold"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#16A34A]" />
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
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 flex items-center justify-between font-medium"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
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
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold min-w-[56px] ${
            currentTab === 'feed' ? 'text-[#16A34A] bg-green-50' : 'text-slate-500 hover:text-[#17171F]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Feed</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold min-w-[56px] ${
            currentTab === 'map' ? 'text-[#16A34A] bg-green-50' : 'text-slate-500 hover:text-[#17171F]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Map</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('leaderboard')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold min-w-[56px] ${
            currentTab === 'leaderboard' ? 'text-[#16A34A] bg-green-50' : 'text-slate-500 hover:text-[#17171F]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Ranks</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('rewards')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold min-w-[56px] ${
            currentTab === 'rewards' ? 'text-[#16A34A] bg-green-50' : 'text-slate-500 hover:text-[#17171F]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rewards</span>
        </button>
      </nav>
    </>
  );
};
