import React, { useState } from 'react';
import {
  MapPin,
  Heart,
  MessageSquare,
  Share2,
  Send,
  Sparkles,
} from 'lucide-react';
import type { Spot, UserProfile } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Avatar } from './Avatar';

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
    <article className="bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] overflow-hidden transition-colors hover:border-[#D5CEBE]">
      {/* 1. HERO PHOTO SECTION: Full-width at the top */}
      <div className="relative w-full">
        {isCleaned && spot.verification ? (
          <BeforeAfterSlider
            beforeImage={spot.beforePhotoUrl}
            afterImage={spot.verification.afterPhotoUrl}
            aspectRatioClass="aspect-[16/10] sm:aspect-[16/9]"
          />
        ) : (
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#1C2B24] overflow-hidden">
            <img
              src={spot.beforePhotoUrl}
              alt={spot.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Tags at bottom corners */}
            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-white bg-[#B3432E] rounded-[4px] shadow-subtle">
                Needs clean
              </span>
            </div>
            {spot.rewardPoints > 0 && (
              <div className="absolute bottom-3 right-3 z-10">
                <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-white bg-[#D9822B] rounded-[4px] shadow-subtle tabular-nums">
                  +{spot.rewardPoints} pts bounty
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. CARD CONTENT: Quiet, editorial, human */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Single clean line: Author avatar + name · location · date · points */}
        <div className="flex items-center gap-2 text-xs text-[#6B7468] flex-wrap leading-tight">
          <Avatar
            src={primaryAuthor.avatar}
            name={primaryAuthor.name}
            size="xs"
            indicator={isCleaned ? 'clean' : 'needs_clean'}
          />

          <span className="font-medium text-[#1C2B24]">
            {primaryAuthor.roleText}
          </span>

          <span className="text-[#A39E93]">·</span>

          <button
            type="button"
            onClick={() => onOpenMap(spot)}
            className="hover:text-[#1E6B4B] transition-colors truncate max-w-[200px] text-left underline-offset-2 hover:underline"
            title={spot.location.address || 'View on map'}
          >
            {spot.location.address || 'Location on map'}
          </button>

          <span className="text-[#A39E93]">·</span>

          <span className="tabular-nums">{formattedDate}</span>

          <span className="text-[#A39E93]">·</span>

          <span className="font-semibold text-[#1E6B4B] tabular-nums">
            +{spot.rewardPoints} pts
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-[#1C2B24] leading-snug">
            {spot.title}
          </h3>

          {spot.description && (
            <p className="text-xs sm:text-sm text-[#6B7468] leading-relaxed line-clamp-3">
              {spot.description}
            </p>
          )}

          {/* Cleanup note if verified */}
          {isCleaned && spot.verification?.notes && (
            <div className="pt-1">
              <p className="text-xs text-[#6B7468] italic border-l-2 border-[#2F8F5B] pl-2.5 py-0.5">
                "{spot.verification.notes}"
              </p>
            </div>
          )}
        </div>

        {/* 3. CARD ACTIONS ROW: Clean & understated */}
        <div className="pt-2 border-t border-[#E2DCCD] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-[#6B7468]">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 transition-colors ${
                spot.hasLiked ? 'text-[#B3432E] font-medium' : 'hover:text-[#1C2B24]'
              }`}
              title="Like this restoration"
            >
              <Heart
                className={`w-4 h-4 ${spot.hasLiked ? 'fill-[#B3432E] stroke-[#B3432E]' : ''}`}
              />
              <span className="tabular-nums">{spot.likesCount || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-[#1C2B24] transition-colors"
              title="View comments"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="tabular-nums">{spot.comments?.length || 0}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-[#1C2B24] transition-colors"
              title="Share link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {copiedShare ? 'Copied' : 'Share'}
              </span>
            </button>
          </div>

          {/* If spot needs cleaning: clear single action button */}
          {isNeedsCleaning && (
            <button
              type="button"
              onClick={() => onCleanSpot(spot)}
              className="bg-[#1E6B4B] hover:bg-[#18553B] text-white text-xs font-medium px-3.5 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 shadow-subtle"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clean this spot</span>
            </button>
          )}

          {isCleaned && (
            <span className="text-[11px] font-medium text-[#2F8F5B] flex items-center gap-1">
              <span>Restored</span>
            </span>
          )}
        </div>

        {/* 4. EXPANDABLE COMMENTS */}
        {showComments && (
          <div className="pt-3 border-t border-[#E2DCCD] space-y-3">
            {spot.comments?.length > 0 && (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {spot.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2 text-xs">
                    <Avatar
                      src={comment.authorAvatar}
                      name={comment.authorName}
                      size="xs"
                    />
                    <div className="flex-1 bg-[#F4F1EA] p-2.5 rounded-[6px] border border-[#E2DCCD]">
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="font-semibold text-[#1C2B24]">
                          {comment.authorName}
                        </span>
                        <span className="text-[#A39E93] text-[10px] tabular-nums">
                          {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-[#1C2B24] leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                size="xs"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a message to the community..."
                className="flex-1 px-3 py-1.5 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none focus:border-[#1E6B4B]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-1.5 bg-[#1E6B4B] hover:bg-[#18553B] text-white rounded-[6px] text-xs font-medium disabled:opacity-40 transition-colors"
                title="Send comment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};
