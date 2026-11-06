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
      <header className="sticky top-0 z-sticky bg-surface/95 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Lockup */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className="flex items-center gap-3 text-left group outline-none"
            >
              <div className="w-9 h-9 rounded-sm bg-forest text-lime flex items-center justify-center font-heading text-lg font-bold shadow-sm border border-forest-border flex-shrink-0 group-hover:bg-forest-hover transition-colors">
                G
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base sm:text-lg font-bold text-ink tracking-tight leading-none">
                    GarbageMedia
                  </span>
                  <Badge variant="mint" size="sm" className="hidden sm:inline-flex py-0 px-1.5 text-[10px]">
                    Civic proof
                  </Badge>
                </div>
                <span className="text-[11px] text-muted tracking-normal font-sans leading-none mt-1">
                  Community cleanups & photo proofs
                </span>
              </div>
            </button>
          </div>

          {/* Center: Simplified Text Tabs with Active Lime Underline */}
          <nav className="hidden md:flex items-center gap-8 h-full" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative h-full flex items-center text-sm font-medium transition-colors select-none outline-none ${
                    isActive
                      ? 'text-ink font-semibold'
                      : 'text-muted hover:text-ink font-normal'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Shared lime underline indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-lime rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: User Chip (Avatar + Points + Rank Badge) */}
          <div className="flex items-center gap-3">
            {/* If in Guest Mode, show a small Sign In button */}
            {isGuestMode && onRequireAuth && (
              <button
                type="button"
                onClick={onRequireAuth}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink hover:text-forest transition-colors rounded-sm hover:bg-surface-muted"
              >
                <LogIn className="w-3.5 h-3.5 text-forest" />
                <span>Sign in</span>
              </button>
            )}

            {/* Shared User Chip Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-10 flex items-center gap-2 pl-1.5 pr-3 rounded-sm border border-border hover:border-border-strong bg-surface hover:bg-surface-hover transition-colors shadow-sm outline-none"
                aria-expanded={showUserMenu}
                aria-label="User profile menu"
              >
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="sm"
                />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-ink truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] font-bold text-forest tabular-nums">
                    {currentUser.points} pts
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-dropdown"
                    onClick={() => setShowUserMenu(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-sm bg-surface border border-border shadow-md py-1.5 z-dropdown animate-fadeIn">
                    <div className="px-3.5 py-2.5 border-b border-border/80">
                      <p className="text-xs font-semibold text-ink truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-muted truncate">
                        {currentUser.email || (isGuestMode ? 'Guest volunteer' : 'Civic Member')}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="points" size="sm">
                          {currentUser.points} pts
                        </Badge>
                        <span className="text-[11px] text-muted font-medium">
                          {currentUser.badges?.length || 1} badge
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
                        className="w-full text-left px-3.5 py-2 text-xs text-ink hover:bg-surface-muted flex items-center gap-2 transition-colors"
                      >
                        <UserCog className="w-3.5 h-3.5 text-muted" />
                        <span>Edit profile</span>
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
                          className="w-full text-left px-3.5 py-2 text-xs text-forest font-medium hover:bg-surface-muted flex items-center gap-2 transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5 text-forest" />
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
                        className="w-full text-left px-3.5 py-2 text-xs text-coral hover:bg-coral-subtle flex items-center gap-2 transition-colors border-t border-border mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
      <main className="flex-1 max-w-shell w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* 3. SHARED FOOTER */}
      <footer className="border-t border-border bg-surface py-8 text-center text-xs text-muted">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-ink">GarbageMedia</span>
            <span>·</span>
            <span>Grassroots civic neighbourhood cleanups</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Verified photo proofs</span>
            <span>·</span>
            <span>Open community registry</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-forest font-medium">
              <Heart className="w-3 h-3 text-coral fill-coral" /> Powered by Volunteers
            </span>
          </div>
        </div>
      </footer>

      {/* 4. SHARED MOBILE BOTTOM TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-sticky bg-surface border-t border-border pb-safe">
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
                  isActive ? 'text-forest font-semibold' : 'text-muted hover:text-ink'
                }`}
              >
                {/* Active lime pill indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-lime rounded-full" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-forest' : 'text-muted'}`} />
                <span className="text-[10px] leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
