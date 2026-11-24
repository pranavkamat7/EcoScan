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
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { useAuth } from '../firebase/authContext';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Logo } from './ui/Logo';

export type NavTab = 'feed' | 'map' | 'my_posts' | 'leaderboard' | 'rewards' | 'about';

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

  const navItems: {
    id: NavTab;
    label: string;
    mobileLabel: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'feed', label: 'Feed', mobileLabel: 'Feed', icon: Compass },
    { id: 'map', label: 'Map', mobileLabel: 'Map', icon: Map },
    { id: 'my_posts', label: 'My Posts', mobileLabel: 'Posts', icon: FileText },
    { id: 'leaderboard', label: 'Leaderboard', mobileLabel: 'Ranks', icon: Trophy },
    { id: 'rewards', label: 'Rewards', mobileLabel: 'Perks', icon: Award },
    { id: 'about', label: 'About', mobileLabel: 'About', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      {/* 1. SHARED STICKY HEADER (Solid White, Crisp & High-Contrast) */}
      <header className="sticky top-0 z-50 bg-white border-b border-line shadow-xs transition-colors">
        <div className="max-w-shell mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Official Brand Logo with Clear Space (Clicking goes to Feed) */}
          <div className="flex items-center flex-shrink-0">
            <Logo
              size="md"
              onClick={() => onTabChange('feed')}
              className="py-1"
            />
          </div>

          {/* Center: Official School Logo & Crest (Shri Nirakar Vidyalaya, Mashem) */}
          <div className="flex items-center justify-center flex-shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('about')}
              title="Shri Nirakar Vidyalaya, Mashem (Click for Student Field Guide)"
              className="flex items-center gap-2 sm:gap-2.5 py-1 px-2 sm:px-3 rounded-full hover:bg-navy-50/90 transition-all group outline-none cursor-pointer border border-line/70 bg-white shadow-2xs hover:border-emerald-300"
            >
              <div className="relative flex-shrink-0">
                <img
                  src="/school-logo.jpg"
                  alt="Shri Nirakar Vidyalaya, Mashem Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain border border-emerald-400/40 shadow-xs bg-white p-0.5 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald rounded-full border border-white" title="Verified School Partner" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-[11px] sm:text-[13px] text-navy tracking-tight group-hover:text-emerald transition-colors whitespace-nowrap">
                    Shri Nirakar Vidyalaya
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    Mashem
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-muted font-medium truncate max-w-[125px] sm:max-w-none">
                  सा विद्या या विमुक्तये &bull; Estd. 1939
                </span>
              </div>
            </button>
          </div>

          {/* Right: Desktop Navigation Tabs + User Chip */}
          <div className="flex items-center gap-3 sm:gap-5 xl:gap-6 h-full flex-shrink-0">
            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6 h-full" aria-label="Main navigation">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`relative h-full flex items-center text-xs xl:text-sm transition-colors select-none outline-none ${
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

            {/* User Chip (Avatar + Points + Level) */}
            <div className="flex items-center gap-2 sm:gap-3">
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

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onTabChange('my_posts');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-navy hover:bg-navy-50 flex items-center gap-2.5 transition-colors font-medium border-b border-line"
                    >
                      <FileText className="w-4 h-4 text-emerald" />
                      <span>My Reported Posts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onTabChange('about');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-navy hover:bg-navy-50 flex items-center gap-2.5 transition-colors font-medium border-b border-line"
                    >
                      <Sparkles className="w-4 h-4 text-emerald" />
                      <span>About &amp; Student Guide 💡</span>
                    </button>

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

                    {onOpenEditProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenEditProfile();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-coral hover:bg-coral-50 flex items-center gap-2.5 transition-colors font-medium border-t border-line"
                      >
                        <Trash2 className="w-4 h-4 text-coral" />
                        <span>Delete account & data</span>
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
      </div>
    </header>

      {/* 2. SHARED MAIN CONTENT (Max width 1200px, consistent padding) */}
      <main className="flex-1 max-w-shell w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 md:pb-12">
        {children}
      </main>

      {/* 3. SHARED MOBILE BOTTOM TAB BAR (Solid White, Clean & Crisp) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-line shadow-md pb-safe">
        <nav className="grid grid-cols-6 h-14" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors select-none outline-none active:scale-95 px-0.5 ${
                  isActive ? 'text-emerald font-bold' : 'text-muted hover:text-navy'
                }`}
              >
                {/* Active emerald pill indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-emerald rounded-full" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald' : 'text-muted'}`} />
                <span className="text-[9px] sm:text-[10px] leading-tight truncate">{item.mobileLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
