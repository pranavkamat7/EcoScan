import React, { useState } from 'react';
import {
  Compass,
  Map,
  Trophy,
  Award,
  ChevronDown,
  LogIn,
  LogOut,
  UserCog,
  Heart,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { useAuth } from '../firebase/authContext';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Logo } from './ui/Logo';

export type NavTab = 'feed' | 'map' | 'leaderboard' | 'rewards';

export interface AppShellProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: UserProfile;
  isGuest?: boolean;
  onRequireAuth?: () => void;
  onOpenEditProfile?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  isGuest = false,
  onRequireAuth,
  onOpenEditProfile,
  children,
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
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      {/* 1. SHARED STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-line transition-colors">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Official Brand Logo with Clear Space (Clicking goes to Feed) */}
          <div className="flex items-center flex-shrink-0">
            <Logo
              size="md"
              onClick={() => onTabChange('feed')}
              className="py-1"
            />
          </div>

          {/* Center: Simplified Text Tabs with Signature Emerald Active Underline */}
          <nav className="hidden md:flex items-center gap-8 h-full" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative h-full flex items-center text-sm transition-colors select-none outline-none ${
                    isActive
                      ? 'text-navy font-bold'
                      : 'text-muted hover:text-navy font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Signature Emerald active underline indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: User Chip (Avatar + Points + Level) */}
          <div className="flex items-center gap-3">
            {/* If in Guest Mode, show a small Sign In button */}
            {isGuestMode && onRequireAuth && (
              <button
                type="button"
                onClick={onRequireAuth}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald hover:text-emerald-700 transition-colors rounded-sm hover:bg-emerald-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
            )}

            {/* Shared User Chip Menu with Elevated Stacking Context */}
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-10 sm:h-11 flex items-center gap-2.5 pl-1.5 pr-3 rounded-sm border border-line hover:border-line-strong bg-white hover:bg-navy-50 transition-colors shadow-sm outline-none"
                aria-expanded={showUserMenu}
                aria-label="User profile menu"
              >
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="sm"
                />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-navy truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald tabular-nums">
                    {currentUser.points} pts
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted ml-0.5" />
              </button>

              {/* Elevated Dropdown Menu (Opens cleanly on top of PageHeader) */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white border border-line shadow-modal py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-line">
                      <p className="text-xs font-bold text-navy truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        {currentUser.email || (isGuestMode ? 'Guest volunteer' : 'Civic Member')}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <Badge variant="points" size="sm">
                          {currentUser.points} pts
                        </Badge>
                        <span className="text-[11px] text-emerald font-semibold">
                          {currentUser.level}
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
                        className="w-full text-left px-4 py-2.5 text-xs text-navy hover:bg-navy-50 flex items-center gap-2.5 transition-colors font-medium"
                      >
                        <UserCog className="w-4 h-4 text-muted" />
                        <span>Edit profile & photo</span>
                      </button>
                    )}

                    {isGuestMode ? (
                      onRequireAuth && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onRequireAuth();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-emerald font-bold hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
                        >
                          <LogIn className="w-4 h-4 text-emerald" />
                          <span>Sign in with account</span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-coral hover:bg-coral-50 flex items-center gap-2.5 transition-colors font-semibold border-t border-line mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. SHARED MAIN CONTENT (Max width 1200px, consistent padding) */}
      <main className="flex-1 max-w-shell w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-0">
        {children}
      </main>

      {/* 3. SHARED FOOTER (Navy Dark Strip) */}
      <footer className="border-t border-navy-700 bg-navy text-white/80 py-8 text-center text-xs">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="onDark" onClick={() => onTabChange('feed')} />
            <span className="text-white/40">·</span>
            <span className="text-xs text-white/80 font-medium">Grassroots Civic Transformations</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/70">
            <span>Verified photo proofs</span>
            <span className="text-white/30">·</span>
            <span>Open community registry</span>
            <span className="text-white/30">·</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <Heart className="w-3.5 h-3.5 text-coral fill-coral" /> Powered by Volunteers
            </span>
          </div>
        </div>
      </footer>

      {/* 4. SHARED MOBILE BOTTOM TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-line pb-safe">
        <nav className="grid grid-cols-4 h-14" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 transition-colors select-none outline-none ${
                  isActive ? 'text-emerald font-bold' : 'text-muted hover:text-navy'
                }`}
              >
                {/* Active emerald pill indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-emerald rounded-full" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald' : 'text-muted'}`} />
                <span className="text-[10px] leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
