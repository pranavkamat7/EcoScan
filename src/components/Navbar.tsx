import React, { useState } from 'react';
import {
  Compass,
  Map,
  Trophy,
  Award,
  Plus,
  ChevronDown,
  LogIn,
  LogOut,
  UserCog,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { useAuth } from '../firebase/authContext';
import { Avatar } from './Avatar';

export type NavTab = 'feed' | 'map' | 'leaderboard' | 'rewards';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenReportModal: () => void;
  onOpenEditProfile?: () => void;
  currentUser: UserProfile;
  isGuest?: boolean;
  onRequireAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenReportModal,
  onOpenEditProfile,
  currentUser,
  isGuest = false,
  onRequireAuth,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isGuestMode = isGuest || !user;

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'feed', label: 'Feed', icon: Compass },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Award },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFDF8] border-b border-[#E2DCCD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Lockup */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-[6px] bg-[#1E6B4B] text-white flex items-center justify-center font-serif text-base font-bold shadow-subtle flex-shrink-0">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base sm:text-lg font-bold text-[#1C2B24] tracking-tight leading-none">
                  GarbageMedia
                </span>
                <span className="text-[10px] text-[#6B7468] tracking-normal font-sans leading-none mt-0.5">
                  Neighbourhood cleanups
                </span>
              </div>
            </button>
          </div>

          {/* Center: Simplified Text Tabs with Underline */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`py-1 text-sm transition-colors border-b-2 ${
                    isActive
                      ? 'border-[#1E6B4B] text-[#1C2B24] font-semibold'
                      : 'border-transparent text-[#6B7468] hover:text-[#1C2B24] font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Primary Button + Compact User Avatar */}
          <div className="flex items-center gap-3">
            {/* If in Guest Mode, show a small Sign In button */}
            {isGuestMode && onRequireAuth && (
              <button
                type="button"
                onClick={onRequireAuth}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C2B24] hover:text-[#1E6B4B] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-[#1E6B4B]" />
                <span>Sign in</span>
              </button>
            )}

            {/* Single Strong Primary CTA */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="h-9 px-3 sm:px-3.5 text-xs font-medium bg-[#1E6B4B] hover:bg-[#18553B] text-white rounded-[6px] transition-colors flex items-center gap-1.5 shadow-subtle flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Report dirty spot</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Compact User Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-9 flex items-center gap-2 pl-1 pr-2 rounded-[6px] border border-[#E2DCCD] hover:border-[#D5CEBE] bg-[#FFFDF8] transition-colors"
                aria-expanded={showUserMenu}
                aria-label="User profile menu"
              >
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="xs"
                />
                <span className="text-xs font-medium text-[#1C2B24] tabular-nums hidden sm:inline">
                  {currentUser.points} pts
                </span>
                <ChevronDown className="w-3 h-3 text-[#6B7468]" />
              </button>

              {/* Clean Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-[#FFFDF8] border border-[#E2DCCD] rounded-[12px] p-2 shadow-dropdown z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#E2DCCD] mb-1">
                    <p className="font-semibold text-[#1C2B24] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#6B7468] truncate">{currentUser.handle}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#6B7468]">
                      <span>{isGuestMode ? 'Guest' : currentUser.level}</span>
                      <span>·</span>
                      <span className="font-semibold text-[#1E6B4B] tabular-nums">
                        {currentUser.points} pts
                      </span>
                    </div>
                  </div>

                  {onOpenEditProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenEditProfile();
                      }}
                      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F1EA] text-[#1C2B24] flex items-center gap-2 font-medium transition-colors"
                    >
                      <UserCog className="w-4 h-4 text-[#1E6B4B]" />
                      <span>Edit profile</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('rewards');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F1EA] text-[#1C2B24] flex items-center gap-2 font-medium transition-colors"
                  >
                    <Award className="w-4 h-4 text-[#D9822B]" />
                    <span>My rewards</span>
                  </button>

                  <div className="border-t border-[#E2DCCD] my-1" />

                  {isGuestMode && onRequireAuth ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onRequireAuth();
                      }}
                      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F1EA] text-[#1E6B4B] flex items-center gap-2 font-medium transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign in or register</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        if (onRequireAuth) onRequireAuth();
                      }}
                      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F1EA] text-[#B3432E] flex items-center gap-2 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF8] border-t border-[#E2DCCD] px-2 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[11px] transition-colors border-b-2 ${
                isActive
                  ? 'border-[#1E6B4B] text-[#1E6B4B] font-semibold'
                  : 'border-transparent text-[#6B7468]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
