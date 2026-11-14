import React, { useState, useMemo } from 'react';
import {
  FileText,
  Pencil,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Clock,
  Sparkles,
  Loader2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import type { Spot, UserProfile } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Tabs,
  EmptyState,
  Modal,
} from './ui';
import type { CertificateData } from './CertificateModal';

interface MyPostsViewProps {
  currentUser: UserProfile;
  spots: Spot[];
  onEditSpot: (spot: Spot) => void;
  onDeleteSpot: (spotId: string) => Promise<void>;
  onOpenReportModal: () => void;
  onCleanSpot: (spot: Spot) => void;
  onOpenMapForSpot: (spot: Spot) => void;
  onViewCertificate?: (certData: CertificateData) => void;
}

export const MyPostsView: React.FC<MyPostsViewProps> = ({
  currentUser,
  spots,
  onEditSpot,
  onDeleteSpot,
  onOpenReportModal,
  onCleanSpot,
  onOpenMapForSpot,
  onViewCertificate,
}) => {
  const [filter, setFilter] = useState<'all' | 'needs_cleaning' | 'cleaned'>('all');
  const [spotToDelete, setSpotToDelete] = useState<Spot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter posts that belong to the current user
  const mySpots = useMemo(() => {
    return spots.filter((s) => {
      if (s.reporterId === currentUser.id) return true;
      if (s.reporterName === currentUser.name) return true;
      if (currentUser.id === 'guest' && s.reporterId === 'guest') return true;
      return false;
    });
  }, [spots, currentUser]);

  const filteredSpots = useMemo(() => {
    if (filter === 'cleaned') return mySpots.filter((s) => s.status === 'cleaned');
    if (filter === 'needs_cleaning') return mySpots.filter((s) => s.status === 'needs_cleaning');
    return mySpots;
  }, [mySpots, filter]);

  const needsCleanCount = mySpots.filter((s) => s.status === 'needs_cleaning').length;
  const cleanedCount = mySpots.filter((s) => s.status === 'cleaned').length;

  const handleConfirmDelete = async () => {
    if (!spotToDelete) return;
    try {
      setIsDeleting(true);
      await onDeleteSpot(spotToDelete.id);
      setSpotToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Page Header */}
      <PageHeader
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald text-white shadow-xs">
            📋 Post Management
          </span>
        }
        title="My Reported Spots"
        description="Manage your published civic spots. Edit details, track cleanup status, or permanently delete posts from the public registry."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            onClick={onOpenReportModal}
          >
            Report dirty spot
          </Button>
        }
      />

      {/* 2. Filter Tabs */}
      <div className="flex items-center justify-between border-b border-line pb-2 flex-wrap gap-3">
        <Tabs<'all' | 'needs_cleaning' | 'cleaned'>
          items={[
            { id: 'all', label: 'All My Posts', count: mySpots.length },
            { id: 'needs_cleaning', label: 'Open Bounties', count: needsCleanCount },
            { id: 'cleaned', label: 'Restored & Verified', count: cleanedCount },
          ]}
          activeTab={filter}
          onChange={setFilter}
        />

        <div className="text-xs text-muted font-medium">
          Author: <span className="text-navy font-bold">{currentUser.name}</span>
        </div>
      </div>

      {/* 3. Posts List */}
      {filteredSpots.length > 0 ? (
        <div className="space-y-6">
          {filteredSpots.map((spot) => (
            <Card
              key={spot.id}
              variant="default"
              className="p-5 sm:p-6 border-line hover:border-line-strong transition-all overflow-hidden shadow-sm space-y-4"
            >
              {/* Header row: Status + Reward + Date */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  {spot.status === 'cleaned' ? (
                    <Badge variant="restored" size="sm" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                      Restored & Verified
                    </Badge>
                  ) : (
                    <Badge variant="needs_clean" size="sm" icon={<Clock className="w-3.5 h-3.5" />}>
                      Needs Clean · Active Bounty
                    </Badge>
                  )}
                  <Badge
                    variant={
                      spot.severity === 'high'
                        ? 'coral'
                        : spot.severity === 'medium'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {spot.severity}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    {formatDate(spot.createdAt)}
                  </span>
                  <Badge variant="points" size="sm">
                    +{spot.rewardPoints} pts
                  </Badge>
                </div>
              </div>

              {/* Body: Photo & Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Photo Preview Column */}
                <div className="md:col-span-5 rounded-lg overflow-hidden border border-line bg-navy-50/50 aspect-[16/10] relative">
                  {spot.status === 'cleaned' && spot.verification?.afterPhotoUrl ? (
                    <BeforeAfterSlider
                      beforeImage={spot.beforePhotoUrl}
                      afterImage={spot.verification.afterPhotoUrl}
                      className="w-full h-full"
                    />
                  ) : (
                    <img
                      src={spot.beforePhotoUrl}
                      alt={spot.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Details Column */}
                <div className="md:col-span-7 space-y-3 text-left">
                  <h3 className="font-heading text-base sm:text-lg font-bold text-navy leading-snug">
                    {spot.title}
                  </h3>

                  {spot.description && (
                    <p className="text-xs sm:text-sm text-ink/80 leading-relaxed font-normal">
                      {spot.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <MapPin className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                    <span className="truncate">{spot.location.address || 'GPS verified location'}</span>
                  </div>

                  {spot.tags && spot.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {spot.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-navy-50 text-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {spot.status === 'cleaned' && spot.verification && (
                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald/20 text-xs space-y-1">
                      <p className="font-bold text-emerald-800">
                        🎉 Cleaned by {spot.verification.cleanerName} on {formatDate(spot.verification.cleanedAt)}
                      </p>
                      {spot.verification.notes && (
                        <p className="text-ink/70 italic text-[11px]">
                          "{spot.verification.notes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
                <div className="flex items-center gap-2">
                  {/* View on Map */}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<MapPin className="w-3.5 h-3.5 text-emerald" />}
                    onClick={() => onOpenMapForSpot(spot)}
                  >
                    View on Map
                  </Button>

                  {/* Clean Shortcut (if pending) */}
                  {spot.status === 'needs_cleaning' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => onCleanSpot(spot)}
                    >
                      I Cleaned This
                    </Button>
                  )}

                  {/* Certificate Button (if cleaned) */}
                  {spot.status === 'cleaned' && onViewCertificate && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Award className="w-3.5 h-3.5 text-amber-500" />}
                      onClick={() => {
                        onViewCertificate({
                          id: `ECO-CLEAN-${spot.id.slice(0, 8)}`,
                          recipientName: spot.verification?.cleanerName || spot.reporterName || currentUser.name,
                          recipientAvatar: spot.verification?.cleanerAvatar || spot.reporterAvatar || currentUser.avatar,
                          title: 'Certificate of Verified Environmental Restoration',
                          spotTitle: spot.title,
                          spotLocation: spot.location.address || 'Restoration Site',
                          wasteClearedKg: spot.estimatedWasteKg || 10,
                          pointsEarned: spot.rewardPoints || 200,
                          category: 'cleanup',
                        });
                      }}
                    >
                      Download Certificate
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Pencil className="w-3.5 h-3.5 text-navy" />}
                    onClick={() => onEditSpot(spot)}
                  >
                    Edit Post
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-coral hover:bg-coral-50 hover:text-coral-700 font-semibold"
                    icon={<Trash2 className="w-3.5 h-3.5 text-coral" />}
                    onClick={() => setSpotToDelete(spot)}
                  >
                    Delete Permanently
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-muted stroke-[1.5]" />}
          title={filter === 'all' ? 'No reported spots yet' : 'No spots matching this filter'}
          description={
            filter === 'all'
              ? "You haven't reported any civic litter spots yet. Snap a photo of a messy corner to launch a community cleanup mission!"
              : 'Try selecting "All My Posts" to review your full contribution history.'
          }
          actionLabel="Report a dirty spot"
          actionIcon={<Plus className="w-4 h-4" />}
          onAction={onOpenReportModal}
        />
      )}

      {/* Permanent Deletion Confirmation Modal */}
      {spotToDelete && (
        <Modal
          isOpen={Boolean(spotToDelete)}
          onClose={() => !isDeleting && setSpotToDelete(null)}
          title="Delete Spot Permanently?"
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setSpotToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="bg-coral hover:bg-coral-600 border-coral text-white"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                icon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </Button>
            </div>
          }
        >
          <div className="text-left">
            <div className="p-3.5 rounded-lg bg-coral-50 border border-coral-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" />
              <div className="text-xs text-coral-900 space-y-1">
                <p className="font-bold">Permanent Deletion Warning</p>
                <p className="leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="font-bold">"{spotToDelete.title}"</strong>? This will remove the spot from the global community feed, Leaflet map, and cloud registry permanently. This cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
