import React, { useState } from 'react';
import { Award, ShieldCheck, Sparkles, Gift, CheckCircle2, Download, Printer } from 'lucide-react';
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
  const [showCertModal, setShowCertModal] = useState(false);

  const handleClaim = (perkId: string, cost: number) => {
    if (currentUser.points >= cost && !claimedPerks.includes(perkId)) {
      setClaimedPerks([...claimedPerks, perkId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Civic Passport Level Card */}
      <div className="bg-white rounded-xl border-2 border-[#E3E3DC] p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E7EFEA] border-2 border-[#2D513B] flex items-center justify-center text-2xl shadow-xs">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#181A19]">
                  Level {levelInfo.levelNumber}: {levelInfo.levelTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E7EFEA] text-[#14231A] text-[10px] font-mono font-bold">
                  Rank Active
                </span>
              </div>
              <p className="text-xs text-[#535A55] mt-0.5">
                Earn points by finding dirty areas and submitting verified cleanup proofs.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7E8681] block">
              Accumulated Balance
            </span>
            <span className="font-mono font-bold text-2xl sm:text-3xl text-[#2D513B]">
              {currentUser.points.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-2 pt-3 border-t border-[#F0EFEA]">
          <div className="flex justify-between text-xs text-[#535A55] font-mono">
            <span>Next Civic Tier: Level {levelInfo.levelNumber + 1}</span>
            <span className="font-bold text-[#181A19]">
              {currentUser.points} / {levelInfo.nextLevelPoints} pts ({levelInfo.progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-[#F2F2EC] rounded-full overflow-hidden border border-[#E3E3DC] p-0.5">
            <div
              className="h-full bg-[#2D513B] transition-all duration-700 rounded-full"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="bg-white rounded-xl border border-[#E3E3DC] p-6 shadow-xs">
        <h3 className="text-xs font-bold text-[#181A19] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
          <Award className="w-4 h-4 text-[#2D513B]" />
          Earned Badges & Distinctions ({currentUser.badges.length})
        </h3>

        {currentUser.badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentUser.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-lg border border-[#E3E3DC] bg-[#F9F9F6] flex items-start gap-3 hover:border-[#2D513B] transition-colors"
              >
                <div className="text-3xl p-1.5 bg-white rounded-lg border border-[#E3E3DC] shadow-xs">
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#181A19] block truncate">
                    {badge.title}
                  </span>
                  <p className="text-[11px] text-[#535A55] line-clamp-2 mt-0.5">
                    {badge.description}
                  </p>
                  {badge.unlockedAt && (
                    <span className="text-[10px] text-[#7E8681] font-mono block mt-1">
                      Unlocked {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#F9F9F6] rounded-lg border-2 border-dashed border-[#CACECB] text-center space-y-2">
            <span className="text-3xl block">🏅</span>
            <p className="text-xs font-bold text-[#181A19]">No badges unlocked yet</p>
            <p className="text-[11px] text-[#7E8681] max-w-sm mx-auto">
              Report your first littered spot and submit an on-site verified cleanup to unlock your first badge!
            </p>
          </div>
        )}
      </div>

      {/* Civic Perks & Rewards Store */}
      <div className="bg-white rounded-xl border border-[#E3E3DC] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-[#181A19] uppercase tracking-wider flex items-center gap-2 font-mono">
              <Gift className="w-4 h-4 text-[#2D513B]" />
              Civic Perks & Recognition
            </h3>
            <p className="text-xs text-[#535A55] mt-0.5">
              Unlock certificates, tree dedications, and volunteer merchandise with your earned points.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {CIVIC_PERKS.map((perk) => {
            const isClaimed = claimedPerks.includes(perk.id);
            const canClaim = currentUser.points >= perk.cost;

            return (
              <div
                key={perk.id}
                className="p-4 rounded-lg border border-[#E3E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9F9F6] transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <span className="text-2xl p-2 bg-[#F2F2EC] rounded-lg border border-[#E3E3DC]">
                    {perk.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#181A19]">{perk.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#F2F2EC] rounded-full text-[#535A55] font-semibold">
                        {perk.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#535A55] mt-1">{perk.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#F0EFEA]">
                  <span className="font-mono text-xs font-bold text-[#2D513B]">
                    {perk.cost} pts
                  </span>

                  {isClaimed ? (
                    <button
                      type="button"
                      onClick={() => setShowCertModal(true)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-[#E7EFEA] text-[#14231A] border border-[#2D513B]/30 flex items-center gap-1.5 hover:bg-[#d6e5dc] transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D513B]" />
                      Claimed (View)
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canClaim}
                      onClick={() => handleClaim(perk.id, perk.cost)}
                      className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#2D513B] text-white hover:bg-[#233F2E] disabled:opacity-35 disabled:cursor-not-allowed shadow-xs transition-all hover:scale-105 active:scale-95"
                    >
                      Unlock Reward
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#FCFCF9] max-w-lg w-full rounded-xl border-4 border-[#2D513B] shadow-2xl p-7 text-center relative">
            <div className="border border-[#2D513B]/30 p-6 rounded-lg bg-white relative">
              <div className="w-14 h-14 rounded-full bg-[#E7EFEA] text-[#2D513B] flex items-center justify-center mx-auto mb-3 border-2 border-[#2D513B]">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#7E8681] block">
                Official Civic Record
              </span>
              <h3 className="text-xl font-serif font-bold text-[#181A19] mt-1 mb-2">
                Certificate of Environmental Action
              </h3>
              <p className="text-xs text-[#535A55] max-w-sm mx-auto mb-4 leading-relaxed">
                Presented to <strong className="text-[#181A19] underline underline-offset-2">{currentUser.name}</strong> for
                transforming neglected public spaces and clearing{' '}
                <strong className="text-[#2D513B] font-mono">{currentUser.wasteClearedKg} kg</strong> of
                waste with verified before & after photographic proofs.
              </p>

              <div className="p-2.5 bg-[#F9F9F6] border border-[#E3E3DC] rounded font-mono text-[10px] text-[#535A55] mb-5">
                Verified ID: GM-CERT-2026-{currentUser.id.slice(0, 8)} • Immutable Proof
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#535A55] hover:text-[#181A19]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2D513B] rounded-md hover:bg-[#233F2E] flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
