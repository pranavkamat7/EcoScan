import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Send,
  Sparkles,
} from 'lucide-react';
import type { Spot, UserProfile } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import {
  Card,
  Avatar,
  Badge,
  Button,
} from './ui';

interface SpotCardProps {
  spot: Spot;
  currentUser: UserProfile;
  onCleanSpot: (spot: Spot) => void;
  onLikeToggle: (spotId: string) => void;
  onAddComment: (spotId: string, text: string) => void;
  onOpenMap: (spot: Spot) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  currentUser,
  onCleanSpot,
  onLikeToggle,
  onAddComment,
  onOpenMap,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const isCleaned = spot.status === 'cleaned' && spot.verification;
  const isNeedsCleaning = spot.status === 'needs_cleaning';

  const handleLikeClick = () => {
    onLikeToggle(spot.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(spot.id, commentText.trim());
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const formattedDate = new Date(spot.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const primaryAuthor = isCleaned && spot.verification
    ? {
        name: spot.verification.cleanerName,
        avatar: spot.verification.cleanerAvatar,
        roleText: `Cleaned by ${spot.verification.cleanerName}`,
      }
    : {
        name: spot.reporterName,
        avatar: spot.reporterAvatar,
        roleText: `Reported by ${spot.reporterName}`,
      };

  return (
    <Card
      variant="default"
      className="p-0 overflow-hidden interactive-card border-line hover:border-line-strong text-left shadow-sm"
    >
      {/* 1. HERO PHOTO SECTION: Full-width at the top */}
      <div className="relative w-full">
        {isCleaned && spot.verification ? (
          <BeforeAfterSlider
            beforeImage={spot.beforePhotoUrl}
            afterImage={spot.verification.afterPhotoUrl}
            aspectRatioClass="aspect-[16/10] sm:aspect-[16/9]"
          />
        ) : (
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-navy-100 overflow-hidden">
            <img
              src={spot.beforePhotoUrl}
              alt={spot.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Tags at bottom corners */}
            <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
              <Badge variant="coral" size="sm">
                Needs clean
              </Badge>
            </div>
            {spot.rewardPoints > 0 && (
              <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                <Badge variant="points" size="sm">
                  +{spot.rewardPoints} pts bounty
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. CARD CONTENT: Clean, human, editorial */}
      <div className="p-5 sm:p-6 space-y-3.5">
        {/* Single clean line: Author avatar + name · location · date · points */}
        <div className="flex items-center gap-2 text-xs text-muted flex-wrap leading-tight">
          <Avatar
            src={primaryAuthor.avatar}
            name={primaryAuthor.name}
            size="xs"
            indicator={isCleaned ? 'clean' : 'needs_clean'}
          />

          <span className="font-bold text-navy">
            {primaryAuthor.roleText}
          </span>

          <span className="text-line-strong">·</span>

          <button
            type="button"
            onClick={() => onOpenMap(spot)}
            className="hover:text-emerald font-medium transition-colors truncate max-w-[200px] text-left underline-offset-2 hover:underline"
            title={spot.location.address || 'View on map'}
          >
            {spot.location.address || 'Location on map'}
          </button>

          <span className="text-line-strong">·</span>

          <span className="tabular-nums">{formattedDate}</span>

          <span className="text-line-strong">·</span>

          <Badge variant="points" size="sm">
            +{spot.rewardPoints} pts
          </Badge>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-navy leading-snug">
            {spot.title}
          </h3>

          {spot.description && (
            <p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-3">
              {spot.description}
            </p>
          )}

          {/* Cleanup note if verified */}
          {isCleaned && spot.verification?.notes && (
            <div className="pt-1.5">
              <p className="text-xs text-muted italic border-l-2 border-emerald pl-3 py-0.5">
                "{spot.verification.notes}"
              </p>
            </div>
          )}
        </div>

        {/* 3. CARD ACTIONS ROW */}
        <div className="pt-3 border-t border-line flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-muted">
            <button
              type="button"
              onClick={handleLikeClick}
              className="flex items-center gap-1.5 hover:text-coral transition-colors py-1 group"
              aria-label="Applaud cleanup"
            >
              <Heart
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  spot.likesCount > 0 ? 'text-coral fill-coral' : 'text-muted'
                }`}
              />
              <span className="tabular-nums font-bold text-navy">
                {spot.likesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-navy transition-colors py-1"
            >
              <MessageSquare className="w-4 h-4 text-muted" />
              <span className="tabular-nums font-bold text-navy">
                {spot.comments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="hover:text-navy transition-colors py-1 flex items-center gap-1 font-medium"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4 text-muted" />
              <span className="hidden sm:inline">
                {copiedShare ? 'Copied' : 'Share'}
              </span>
            </button>
          </div>

          {/* If Needs Clean: Action to submit clean proof (Emerald primary button) */}
          {isNeedsCleaning && (
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-lime" />}
              onClick={() => onCleanSpot(spot)}
            >
              Clean & claim +{spot.rewardPoints} pts
            </Button>
          )}
        </div>

        {/* 4. EXPANDABLE COMMENTS LIST */}
        {showComments && (
          <div className="pt-3 border-t border-line space-y-3">
            {spot.comments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {spot.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-2.5 text-xs p-2.5 rounded-sm bg-navy-50/60 border border-line"
                  >
                    <Avatar
                      src={comment.authorAvatar}
                      name={comment.authorName}
                      size="xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-navy">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-muted tabular-nums">
                          {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-muted mt-0.5 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic text-center py-2">
                No comments yet. Leave a note of encouragement for the team.
              </p>
            )}

            {/* Comment Input Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 h-9 px-3 text-xs rounded-sm border border-line bg-white text-navy outline-none focus:ring-2 focus:ring-emerald"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={!commentText.trim()}
                icon={<Send className="w-3.5 h-3.5 text-emerald" />}
              >
                Send
              </Button>
            </form>
          </div>
        )}
      </div>
    </Card>
  );
};
