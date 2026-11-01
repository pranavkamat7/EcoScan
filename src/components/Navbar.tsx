import React, { useState } from 'react';
import {
  Map,
  Compass,
  Trophy,
  Award,
  Plus,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { useAuth } from '../firebase/authContext';

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

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E3E3DC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-md bg-[#2D513B] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-[#233F2E] transition-colors">
                🌱
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-[#181A19] tracking-tight block">
                  GarbageMedia
                </span>
                <span className="text-[10px] text-[#7E8681] hidden sm:block uppercase tracking-wider font-mono">
                  Civic Cleanups & Before/After Proofs
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F2F2EC] p-1 rounded-md border border-[#E3E3DC]">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'feed'
                  ? 'bg-white text-[#181A19] shadow-sm'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Feed
            </button>
            <button
              type="button"
              onClick={() => onTabChange('map')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'map'
                  ? 'bg-white text-[#181A19] shadow-sm'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Map
            </button>
            <button
              type="button"
              onClick={() => onTabChange('leaderboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'leaderboard'
                  ? 'bg-white text-[#181A19] shadow-sm'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => onTabChange('rewards')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'rewards'
                  ? 'bg-white text-[#181A19] shadow-sm'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Rewards
            </button>
          </nav>

          {/* Right Actions: User Menu & Report CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Account Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#F2F7F4] border border-[#4D8262]/30 hover:border-[#2D513B] transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#4D8262]"
                />
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold text-[#181A19] block leading-tight truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="font-mono text-[10px] text-[#2D513B] font-bold block leading-tight">
                    {currentUser.points} pts
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#535A55]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E3E3DC] rounded-md shadow-modal p-2 z-50 text-xs">
                  <div className="px-2 py-1.5 border-b border-[#F0EFEA] mb-1">
                    <p className="font-semibold text-[#181A19] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#7E8681] truncate">{currentUser.handle}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-[#E7EFEA] text-[#233F2E] font-medium">
                      {currentUser.level}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('rewards');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F9F9F6] text-[#2C302D] flex items-center justify-between"
                  >
                    <span>Rewards & Badges</span>
                    <span className="font-mono font-bold text-[#2D513B]">{currentUser.points} pts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#FDEEEA] text-[#BA4A2B] flex items-center gap-1.5 mt-1 border-t border-[#F0EFEA] pt-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action Button: Report Dirty Spot */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-md bg-[#2D513B] text-white text-xs font-semibold hover:bg-[#233F2E] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Report Spot</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E3E3DC] px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${
            currentTab === 'feed' ? 'text-[#2D513B]' : 'text-[#7E8681]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${
            currentTab === 'map' ? 'text-[#2D513B]' : 'text-[#7E8681]'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Map</span>
        </button>

        {/* Central Plus Snap Button */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-[#2D513B] text-white shadow-md hover:bg-[#233F2E] transition-all"
          title="Report Dirty Spot"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => onTabChange('leaderboard')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${
            currentTab === 'leaderboard' ? 'text-[#2D513B]' : 'text-[#7E8681]'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Ranks</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('rewards')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${
            currentTab === 'rewards' ? 'text-[#2D513B]' : 'text-[#7E8681]'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Rewards</span>
        </button>
      </div>
    </>
  );
};
