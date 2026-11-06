import React, { useState } from 'react';
import { Award, Gift, UserCog, MapPin, Check } from 'lucide-react';
import type { UserProfile } from '../types';
import { getUserLevel } from '../utils/rewards';
import { Avatar } from './Avatar';

interface RewardsViewProps {
  currentUser: UserProfile;
  onOpenEditProfile?: () => void;
}

const CIVIC_PERKS = [
  {
    id: 'perk-1',
    cost: 300,
    title: 'Digital Civic Certificate of Commendation',
    description: 'Personalized verified digital certificate signed by community eco-alliance.',
    category: 'Accreditation',
    icon: '📜',
  },
  {
    id: 'perk-2',
    cost: 500,
    title: 'Communal Tree Dedication Tag',
    description: 'Have a newly planted sapling tagged with your civic cleaner handle.',
    category: 'Community',
    icon: '🌱',
  },
  {
    id: 'perk-3',
    cost: 800,
    title: 'Civic Steward Enamel Pin & Patch Kit',
    description: 'Embroidered civic patch sent via community partner network.',
    category: 'Merch',
    icon: '🎖️',
  },
  {
    id: 'perk-4',
    cost: 1200,
    title: 'Featured Spot Curator Spotlight',
    description: 'Get your cleanup story pinned on the national GarbageMedia front page.',
    category: 'Spotlight',
    icon: '⭐',
  },
];

export const RewardsView: React.FC<RewardsViewProps> = ({ currentUser, onOpenEditProfile }) => {
  const levelInfo = getUserLevel(currentUser.points);
  const [claimedPerks, setClaimedPerks] = useState<string[]>([]);

  const handleClaim = (perkId: string, cost: number) => {
    if (currentUser.points >= cost && !claimedPerks.includes(perkId)) {
      setClaimedPerks([...claimedPerks, perkId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* 1. Civic Profile Card */}
      <div className="bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] p-5 sm:p-6 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="xl"
            />

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1C2B24]">
                  {currentUser.name}
                </h1>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#EAF3EE] text-[#1E6B4B] border border-[#E2DCCD] text-xs font-medium">
                  {currentUser.level}
                </span>
              </div>

              <p className="text-xs text-[#6B7468]">
                {currentUser.handle}
              </p>

              {currentUser.city && (
                <p className="text-xs text-[#6B7468] flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1E6B4B]" />
                  <span>{currentUser.city}</span>
                </p>
              )}

              {currentUser.bio ? (
                <p className="text-xs text-[#6B7468] max-w-lg leading-relaxed pt-1">
                  "{currentUser.bio}"
                </p>
              ) : (
                <p className="text-xs text-[#A39E93] italic pt-1">
                  No bio added yet.
                </p>
              )}
            </div>
          </div>

          {onOpenEditProfile && (
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#FFFDF8] hover:bg-[#F4F1EA] text-[#1C2B24] border border-[#E2DCCD] rounded-[6px] transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-subtle"
            >
              <UserCog className="w-3.5 h-3.5 text-[#1E6B4B]" />
              <span>Edit profile</span>
            </button>
          )}
        </div>

        {/* Civic Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E2DCCD]">
          <div className="p-3 rounded-[6px] bg-[#F4F1EA] border border-[#E2DCCD] text-center">
            <span className="text-xs text-[#6B7468] block">Spots cleaned</span>
            <span className="font-semibold text-base text-[#1C2B24] tabular-nums mt-0.5 block">
              {currentUser.spotsCleaned}
            </span>
          </div>

          <div className="p-3 rounded-[6px] bg-[#F4F1EA] border border-[#E2DCCD] text-center">
            <span className="text-xs text-[#6B7468] block">Spots reported</span>
            <span className="font-semibold text-base text-[#1C2B24] tabular-nums mt-0.5 block">
              {currentUser.spotsReported}
            </span>
          </div>

          <div className="p-3 rounded-[6px] bg-[#F4F1EA] border border-[#E2DCCD] text-center">
            <span className="text-xs text-[#6B7468] block">Waste collected</span>
            <span className="font-semibold text-base text-[#1C2B24] tabular-nums mt-0.5 block">
              {currentUser.wasteClearedKg} kg
            </span>
          </div>

          <div className="p-3 rounded-[6px] bg-[#EAF3EE] border border-[#E2DCCD] text-center">
            <span className="text-xs text-[#1E6B4B] block font-medium">Bounty points</span>
            <span className="font-semibold text-base text-[#1E6B4B] tabular-nums mt-0.5 block">
              {currentUser.points} pts
            </span>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-[#6B7468]">
            <span>Tier progress: Level {levelInfo.levelNumber} ({levelInfo.levelTitle})</span>
            <span className="font-medium text-[#1C2B24] tabular-nums">
              {currentUser.points} / {levelInfo.nextLevelPoints} pts
            </span>
          </div>
          <div className="w-full h-2 bg-[#E2DCCD] rounded-[4px] overflow-hidden">
            <div
              className="h-full bg-[#1E6B4B] transition-all duration-500 rounded-[4px]"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Earned Badges */}
      <div className="bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2DCCD] pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#1E6B4B]" />
            <h3 className="font-serif text-base font-bold text-[#1C2B24]">
              Earned badges ({currentUser.badges.length})
            </h3>
          </div>
          <span className="text-xs text-[#6B7468]">
            Unlock through cleanups
          </span>
        </div>

        {currentUser.badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentUser.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-3 rounded-[6px] border border-[#E2DCCD] bg-[#F4F1EA]/60 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-[4px] bg-white border border-[#E2DCCD] flex items-center justify-center text-lg flex-shrink-0">
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#1C2B24] block truncate">
                    {badge.title}
                  </span>
                  <p className="text-[11px] text-[#6B7468] leading-relaxed mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6B7468] py-2">
            No badges unlocked yet. Complete cleanup missions to earn badges!
          </p>
        )}
      </div>

      {/* 3. Civic Perks Catalog */}
      <div className="bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2DCCD] pb-2">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#D9822B]" />
            <h3 className="font-serif text-base font-bold text-[#1C2B24]">
              Civic rewards catalog
            </h3>
          </div>
          <span className="text-xs text-[#6B7468]">
            Redeem points
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CIVIC_PERKS.map((perk) => {
            const isClaimed = claimedPerks.includes(perk.id);
            const canAfford = currentUser.points >= perk.cost;

            return (
              <div
                key={perk.id}
                className="p-3.5 rounded-[6px] border border-[#E2DCCD] bg-[#F4F1EA]/40 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1C2B24]">
                      {perk.icon} {perk.title}
                    </span>
                    <span className="text-xs font-semibold text-[#1E6B4B] tabular-nums">
                      {perk.cost} pts
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7468] leading-relaxed">
                    {perk.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E2DCCD] flex items-center justify-end">
                  {isClaimed ? (
                    <span className="text-xs font-semibold text-[#2F8F5B] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Claimed
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleClaim(perk.id, perk.cost)}
                      className="px-3 py-1 text-xs font-medium rounded-[4px] transition-colors disabled:opacity-40 bg-[#1E6B4B] hover:bg-[#18553B] text-white disabled:bg-[#A39E93]"
                    >
                      {canAfford ? 'Redeem' : 'Need more points'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
