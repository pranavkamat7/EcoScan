import React, { useState } from 'react';
import { Award, ShieldCheck, Sparkles, Gift, CheckCircle2, Download } from 'lucide-react';
import { UserProfile } from '../types';
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
    claimed: true,
  },
  {
    id: 'perk-2',
    cost: 500,
    title: 'Communal Tree Dedication Tag',
    description: 'Have a newly planted sapling tagged with your civic cleaner handle.',
    category: 'Community',
    icon: '🌱',
    claimed: true,
  },
  {
    id: 'perk-3',
    cost: 800,
    title: 'Civic Steward Enamel Pin & Patch Kit',
    description: 'Embroidered civic patch sent via community partner network.',
    category: 'Merch',
    icon: '🎖️',
    claimed: false,
  },
  {
    id: 'perk-4',
    cost: 1200,
    title: 'Featured Spot Curator Spotlight',
    description: 'Get your cleanup story pinned on the national SpotClean front page.',
    category: 'Spotlight',
    icon: '⭐',
    claimed: false,
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Level Status Card */}
      <div className="bg-white rounded-lg border border-[#E3E3DC] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🌱</span>
              <h2 className="text-lg font-semibold text-[#181A19]">
                Level {levelInfo.levelNumber}: {levelInfo.levelTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#535A55]">
              Keep finding dirty places and cleaning them to increase your civic standing.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#7E8681] block">Total Points Earned</span>
            <span className="font-mono font-bold text-2xl text-[#2D513B]">
              {currentUser.points.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-[#F0EFEA]">
          <div className="flex justify-between text-xs text-[#535A55]">
            <span>Progress to Next Tier</span>
            <span className="font-mono">
              {currentUser.points} / {levelInfo.nextLevelPoints} pts ({levelInfo.progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#F2F2EC] rounded-full overflow-hidden border border-[#E3E3DC]">
            <div
              className="h-full bg-[#2D513B] transition-all duration-500 rounded-full"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="bg-white rounded-lg border border-[#E3E3DC] p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#181A19] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#2D513B]" />
          Your Earned Badges ({currentUser.badges.length})
        </h3>

        {currentUser.badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentUser.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-3.5 rounded-md border border-[#E3E3DC] bg-[#F9F9F6] flex items-start gap-3"
              >
                <div className="text-2xl p-1 bg-white rounded border border-[#E3E3DC]">
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#181A19] block truncate">
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
          <div className="p-6 bg-[#F9F9F6] rounded-md border border-dashed border-[#CACECB] text-center">
            <span className="text-2xl block mb-1">🏅</span>
            <p className="text-xs font-medium text-[#181A19]">No badges unlocked yet</p>
            <p className="text-[11px] text-[#7E8681] mt-0.5">
              Report dirty spots and submit verified cleanup proofs to earn civic badges!
            </p>
          </div>
        )}
      </div>

      {/* Civic Perks & Rewards Store */}
      <div className="bg-white rounded-lg border border-[#E3E3DC] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#181A19] uppercase tracking-wider flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#2D513B]" />
              Civic Rewards & Recognition
            </h3>
            <p className="text-xs text-[#535A55] mt-0.5">
              100% free community rewards unlocked with your accumulated cleanup points.
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
                className="p-4 rounded-md border border-[#E3E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9F9F6] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl p-1.5 bg-[#F2F2EC] rounded border border-[#E3E3DC]">
                    {perk.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#181A19]">{perk.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#F2F2EC] rounded text-[#535A55]">
                        {perk.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#535A55] mt-0.5">{perk.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#F0EFEA]">
                  <span className="font-mono text-xs font-semibold text-[#2D513B]">
                    {perk.cost} pts
                  </span>

                  {isClaimed ? (
                    <button
                      type="button"
                      onClick={() => setShowCertModal(true)}
                      className="px-3 py-1.5 text-xs font-medium rounded bg-[#E7EFEA] text-[#233F2E] border border-[#2D513B]/20 flex items-center gap-1 hover:bg-[#d6e5dc]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D513B]" />
                      Claimed (View)
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canClaim}
                      onClick={() => handleClaim(perk.id, perk.cost)}
                      className="px-3.5 py-1.5 text-xs font-medium rounded bg-[#2D513B] text-white hover:bg-[#233F2E] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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

      {/* Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white max-w-lg w-full rounded-lg border border-[#E3E3DC] shadow-modal p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E7EFEA] text-[#2D513B] flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#7E8681] block">
              Civic Stewardship Record
            </span>
            <h3 className="text-xl font-serif font-bold text-[#181A19] mt-1 mb-2">
              Certificate of Environmental Action
            </h3>
            <p className="text-xs text-[#535A55] max-w-sm mx-auto mb-4">
              Presented to <strong className="text-[#181A19]">{currentUser.name}</strong> for
              removing <strong className="text-[#2D513B]">{currentUser.wasteClearedKg} kg</strong> of
              waste across public spaces and earning{' '}
              <strong className="text-[#2D513B]">{currentUser.points} civic reward points</strong>.
            </p>

            <div className="p-3 bg-[#F9F9F6] border border-[#E3E3DC] rounded font-mono text-[11px] text-[#535A55] mb-5">
              Verified ID: SC-CIVIC-2026-9921 • Hash: 8fa2e0...8b1
            </div>

            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#535A55] hover:text-[#181A19]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Certificate download generated as PDF!');
                  setShowCertModal(false);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-[#2D513B] rounded hover:bg-[#233F2E] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

