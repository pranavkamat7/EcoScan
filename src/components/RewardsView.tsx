import React, { useState } from 'react';
import { Award, Gift, UserCog, MapPin, Check, Sparkles, ShieldCheck, Download, FileText } from 'lucide-react';
import type { UserProfile } from '../types';
import { getUserLevel } from '../utils/rewards';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Avatar,
  ProgressBar,
  SectionTitle,
} from './ui';
import type { CertificateData } from './CertificateModal';

interface RewardsViewProps {
  currentUser: UserProfile;
  onOpenEditProfile?: () => void;
  onOpenReportModal?: () => void;
  onViewCertificate?: (certData: CertificateData) => void;
}

const CIVIC_PERKS = [
  {
    id: 'perk-1',
    cost: 300,
    title: 'Digital Civic Certificate of Commendation',
    description: 'Personalized verified digital certificate signed by the community eco-alliance.',
    category: 'Accreditation',
    icon: '📜',
  },
  {
    id: 'perk-2',
    cost: 500,
    title: 'Communal Tree Dedication Tag',
    description: 'Have a newly planted community sapling tagged with your civic volunteer handle.',
    category: 'Community',
    icon: '🌱',
  },
  {
    id: 'perk-3',
    cost: 800,
    title: 'Civic Steward Enamel Pin & Patch Kit',
    description: 'Embroidered civic patch kit sent directly via our community partner network.',
    category: 'Merch',
    icon: '🎖️',
  },
  {
    id: 'perk-4',
    cost: 1200,
    title: 'Featured Spot Curator Spotlight',
    description: 'Get your cleanup story and before/after slider featured on the city homepage.',
    category: 'Spotlight',
    icon: '⭐',
  },
];

export const RewardsView: React.FC<RewardsViewProps> = ({
  currentUser,
  onOpenEditProfile,
  onOpenReportModal,
  onViewCertificate,
}) => {
  const levelInfo = getUserLevel(currentUser.points);
  const [claimedPerks, setClaimedPerks] = useState<string[]>(['perk-1']);

  const handleClaim = (perk: (typeof CIVIC_PERKS)[0]) => {
    if (!claimedPerks.includes(perk.id)) {
      setClaimedPerks([...claimedPerks, perk.id]);
    }

    if (onViewCertificate) {
      onViewCertificate({
        id: `ECO-REWARD-${perk.id}-${Date.now().toString().slice(-4)}`,
        recipientName: currentUser.name,
        recipientAvatar: currentUser.avatar,
        title: perk.title,
        spotTitle: perk.title,
        spotLocation: currentUser.city || 'Civic Community Grounds',
        wasteClearedKg: currentUser.wasteClearedKg || 12,
        pointsEarned: perk.cost,
        category: 'reward',
      });
    }
  };

  const handleOpenMyCertificate = () => {
    if (!onViewCertificate) return;
    onViewCertificate({
      id: `ECO-CIVIC-${currentUser.id.slice(0, 8)}`,
      recipientName: currentUser.name,
      recipientAvatar: currentUser.avatar,
      title: 'Certificate of Verified Civic Excellence',
      spotTitle: 'Community Environmental Stewardship',
      spotLocation: currentUser.city || 'Local Neighbourhood Grounds',
      wasteClearedKg: currentUser.wasteClearedKg || 15,
      pointsEarned: currentUser.points || 200,
      category: 'general',
    });
  };

  const nextTierPoints = levelInfo.nextLevelPoints || 1000;
  const progressPercent = Math.min(
    100,
    Math.round((currentUser.points / nextTierPoints) * 100)
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. SHARED PAGE HEADER WITH POINTS BALANCE & PROGRESS BAR */}
      <PageHeader
        title="Civic Rewards & Badges"
        description="Exchange the points you earned from cleaning littered spaces for verified civic perks, badges, and certificates."
        action={
          onOpenEditProfile && (
            <Button
              variant="primary"
              size="md"
              icon={<UserCog className="w-4 h-4 stroke-[2]" />}
              onClick={onOpenEditProfile}
            >
              Edit profile
            </Button>
          )
        }
        stats={
          <div className="pt-2 max-w-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-white/90">
              <span>
                Rank Tier:{' '}
                <strong className="text-lime font-bold">{currentUser.level}</strong>
              </span>
              <span className="tabular-nums font-semibold text-lime">
                {currentUser.points} / {nextTierPoints} pts to next rank
              </span>
            </div>
            <ProgressBar
              value={progressPercent}
              variant="lime"
              className="mt-1"
            />
          </div>
        }
      />

      {/* 2. CIVIC VOLUNTEER PROFILE CARD */}
      <Card variant="default" className="space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="xl"
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy">
                  {currentUser.name}
                </h2>
                <Badge variant="restored" size="sm">
                  {currentUser.level}
                </Badge>
              </div>

              <p className="text-xs text-muted">
                {currentUser.handle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`}
              </p>

              {currentUser.city && (
                <p className="text-xs text-muted flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald" />
                  <span>{currentUser.city}</span>
                </p>
              )}

              {currentUser.bio ? (
                <p className="text-xs sm:text-sm text-navy/80 pt-1 max-w-md">
                  {currentUser.bio}
                </p>
              ) : (
                <p className="text-xs text-muted italic pt-1">
                  Neighbourhood volunteer active in civic cleanup missions.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
            <div className="text-right">
              <span className="text-xs text-muted block">Available Balance</span>
              <span className="font-heading text-2xl font-bold text-emerald tabular-nums">
                {currentUser.points.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* Civic Impact Metrics Strip (Solid White, Clean & Crisp) */}
        <div className="pt-4 border-t border-line grid grid-cols-3 gap-2.5 sm:gap-4 text-center">
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-line shadow-sm">
            <span className="font-heading text-lg sm:text-2xl font-extrabold text-emerald tabular-nums">
              {currentUser.spotsCleaned}
            </span>
            <p className="text-[11px] font-bold text-navy uppercase tracking-wider mt-0.5">Spots Restored</p>
          </div>

          <div className="p-3 sm:p-4 rounded-lg bg-white border border-line shadow-sm">
            <span className="font-heading text-lg sm:text-2xl font-extrabold text-sky tabular-nums">
              {currentUser.wasteClearedKg} kg
            </span>
            <p className="text-[11px] font-bold text-navy uppercase tracking-wider mt-0.5">Waste Diverted</p>
          </div>

          <div className="p-3 sm:p-4 rounded-lg bg-white border border-line shadow-sm">
            <span className="font-heading text-lg sm:text-2xl font-extrabold text-lime-700 tabular-nums">
              {currentUser.badges?.length || 2}
            </span>
            <p className="text-[11px] font-bold text-navy uppercase tracking-wider mt-0.5">Badges Earned</p>
          </div>
        </div>

        {/* Certificate Callout Bar */}
        {onViewCertificate && (
          <div className="pt-3 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/50 p-3.5 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="font-heading font-bold text-xs text-navy block">
                  Official Civic Award Credentials
                </span>
                <span className="text-[11px] text-muted block">
                  Download authentic, high-resolution certificate for your community profile
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 text-lime" />}
              onClick={handleOpenMyCertificate}
              className="w-full sm:w-auto"
            >
              Download My Certificate
            </Button>
          </div>
        )}
      </Card>

      {/* 3. CIVIC PERKS CATALOG */}
      <div className="space-y-4">
        <SectionTitle
          title="Redeemable Civic Perks"
          subtitle="Support local restoration and claim volunteer certificates with your bounty points."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {CIVIC_PERKS.map((perk) => {
            const isClaimed = claimedPerks.includes(perk.id);
            const canClaim = currentUser.points >= perk.cost || isClaimed;

            return (
              <Card
                key={perk.id}
                variant="default"
                interactive
                className="flex flex-col justify-between p-5 space-y-4"
              >
                <div className="space-y-2.5 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-2xl p-2 rounded-sm bg-navy-50 border border-line flex-shrink-0">
                      {perk.icon}
                    </span>
                    <Badge variant="points" size="sm">
                      {perk.cost} pts
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-navy">
                      {perk.title}
                    </h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {perk.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-line flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-muted font-medium">
                    {perk.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {isClaimed && (
                      <Badge variant="restored" size="sm" icon={<Check className="w-3 h-3" />}>
                        Claimed
                      </Badge>
                    )}

                    <Button
                      variant={isClaimed ? 'secondary' : canClaim ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handleClaim(perk)}
                      icon={isClaimed ? <Download className="w-3.5 h-3.5 text-emerald" /> : undefined}
                    >
                      {isClaimed
                        ? 'Download Certificate'
                        : canClaim
                        ? 'Claim & Get Certificate'
                        : `${perk.cost - currentUser.points} pts needed`}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. EARNED BADGES CATALOG */}
      <div className="space-y-4">
        <SectionTitle
          title="Civic Achievement Badges"
          subtitle="Earn badges by reporting dirty spots, verifying on-site cleanups, and leading neighbourhood teams."
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default" className="text-center p-4 space-y-2 border-emerald/30 bg-emerald-50/20">
            <span className="text-2xl block">🌱</span>
            <h4 className="font-heading font-bold text-xs text-navy">First Cleanup</h4>
            <Badge variant="restored" size="sm">Unlocked</Badge>
          </Card>

          <Card variant="default" className="text-center p-4 space-y-2 border-emerald/30 bg-emerald-50/20">
            <span className="text-2xl block">📍</span>
            <h4 className="font-heading font-bold text-xs text-navy">Civic Scout</h4>
            <Badge variant="restored" size="sm">Unlocked</Badge>
          </Card>

          <Card variant="default" className="text-center p-4 space-y-2 border-line opacity-70">
            <span className="text-2xl block">⚖️</span>
            <h4 className="font-heading font-bold text-xs text-navy">50kg Waste Removed</h4>
            <Badge variant="neutral" size="sm">In progress</Badge>
          </Card>

          <Card variant="default" className="text-center p-4 space-y-2 border-line opacity-70">
            <span className="text-2xl block">👑</span>
            <h4 className="font-heading font-bold text-xs text-navy">Top 3 Champion</h4>
            <Badge variant="neutral" size="sm">Locked</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
};
