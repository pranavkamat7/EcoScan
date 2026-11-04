import React, { useState } from 'react';
import { Award, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../types';
import { getUserLevel } from '../utils/rewards';

interface RewardsViewProps {
  currentUser: UserProfile;
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

export const RewardsView: React.FC<RewardsViewProps> = ({ currentUser }) => {
  const levelInfo = getUserLevel(currentUser.points);
  const [claimedPerks, setClaimedPerks] = useState<string[]>([]);

  const handleClaim = (perkId: string, cost: number) => {
    if (currentUser.points >= cost && !claimedPerks.includes(perkId)) {
      setClaimedPerks([...claimedPerks, perkId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Civic Passport Level Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center text-2xl shadow-btn-green flex-shrink-0">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Level {levelInfo.levelNumber}: {levelInfo.levelTitle}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                  Rank Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Earn civic points by reporting dirty areas and submitting verified on-site cleanups.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
              Accumulated Balance
            </span>
            <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-600">
              {currentUser.points.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>Next Civic Tier: Level {levelInfo.levelNumber + 1}</span>
            <span className="font-bold text-slate-900">
              {currentUser.points} / {levelInfo.nextLevelPoints} pts ({levelInfo.progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 rounded-full shadow-xs"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Earned Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Earned Badges ({currentUser.badges.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Unlock more by participating
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentUser.badges.map((badge) => (
            <div
              key={badge.id}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:border-emerald-300 transition-all flex items-start gap-3.5 shadow-xs"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xl flex-shrink-0">
                {badge.icon}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {badge.title}
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeemable Civic Perks */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-[#17171F]">
              Civic Rewards Catalog
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Redeem your volunteer points
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CIVIC_PERKS.map((perk) => {
            const isClaimed = claimedPerks.includes(perk.id);
            const canAfford = currentUser.points >= perk.cost;

            return (
              <div
                key={perk.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="text-3xl flex-shrink-0 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    {perk.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {perk.category}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#17171F] leading-snug">
                      {perk.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {perk.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="font-mono font-extrabold text-xs sm:text-sm text-emerald-600">
                    {perk.cost} pts
                  </span>

                  <button
                    type="button"
                    disabled={!canAfford || isClaimed}
                    onClick={() => handleClaim(perk.id, perk.cost)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px] ${
                      isClaimed
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
                        : canAfford
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-btn-green hover:scale-105 active:scale-95'
                        : 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{canAfford ? 'Redeem Perk' : 'Need More Pts'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
