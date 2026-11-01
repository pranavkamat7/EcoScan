import React from 'react';
import {
  Sparkles,
  Map,
  Compass,
  Trophy,
  Award,
  Plus,
  CloudUpload,
  RotateCcw,
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab = 'feed' | 'map' | 'leaderboard' | 'rewards';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenReportModal: () => void;
  onOpenDeployGuide: () => void;
  onResetDemo: () => void;
  currentUser: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenReportModal,
  onOpenDeployGuide,
  onResetDemo,
  currentUser,
}) => {
  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-none border-b border-[#E3E3DC]">
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
                  SpotClean
                </span>
                <span className="text-[10px] text-[#7E8681] hidden sm:block uppercase tracking-wider font-mono">
                  Civic Cleanup & Before/After Proofs
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

          {/* Right Actions: Points Pill, Deploy Guide, and Primary CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Deploy to Render Free Guide button */}
            <button
              type="button"
              onClick={onOpenDeployGuide}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#535A55] hover:text-[#181A19] bg-[#F2F2EC] hover:bg-[#E7EFEA] border border-[#E3E3DC] rounded-md transition-colors"
              title="How to host for free on Render"
            >
              <CloudUpload className="w-3.5 h-3.5 text-[#2D513B]" />
              <span>Deploy on Render (Free)</span>
            </button>

            {/* Reset Demo Data */}
            <button
              type="button"
              onClick={onResetDemo}
              className="p-1.5 rounded-md text-[#7E8681] hover:text-[#181A19] hover:bg-[#F2F2EC] transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Points Badge */}
            <button
              type="button"
              onClick={() => onTabChange('rewards')}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F2F7F4] border border-[#4D8262]/30 hover:border-[#2D513B] transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-[#4D8262]"
              />
              <span className="font-mono font-bold text-xs text-[#2D513B]">
                {currentUser.points} pts
              </span>
            </button>

            {/* Primary Action Button: Report Dirty Spot */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md bg-[#2D513B] text-white text-xs font-semibold hover:bg-[#233F2E] shadow-sm transition-all"
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

