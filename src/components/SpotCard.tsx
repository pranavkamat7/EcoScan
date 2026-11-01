import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Sparkles,
  Heart,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Spot, UserProfile } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { formatDistance } from '../utils/geo';

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

  const isCleaned = spot.status === 'cleaned' && spot.verification;
  const isNeedsCleaning = spot.status === 'needs_cleaning';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(spot.id, commentText.trim());
    setCommentText('');
  };

  const formattedDate = new Date(spot.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="bg-white rounded-lg border border-[#E3E3DC] shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-6">
      {/* Top Header: Reporter & Status */}
      <div className="p-4 sm:p-5 pb-3 border-b border-[#F0EFEA] flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={spot.reporterAvatar}
            alt={spot.reporterName}
            className="w-10 h-10 rounded-full object-cover border border-[#E3E3DC] flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#181A19] truncate">
                {spot.reporterName}
              </span>
              <span className="text-xs text-[#7E8681] hidden sm:inline">reported spot</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7E8681]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span>•</span>
              <span
                onClick={() => onOpenMap(spot)}
                className="flex items-center gap-1 hover:text-[#2D513B] cursor-pointer underline-offset-2 hover:underline truncate"
                title={spot.location.address || 'View on map'}
              >
                <MapPin className="w-3 h-3 text-[#2D513B] flex-shrink-0" />
                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                  {spot.location.address || `${spot.location.lat.toFixed(4)}, ${spot.location.lng.toFixed(4)}`}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex flex-col items-end flex-shrink-0">
          {isCleaned ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-[#E7EFEA] text-[#233F2E] border border-[#2D513B]/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D513B]" />
              Transformed
            </span>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-[#FDEEEA] text-[#842D18] border border-[#C24A2C]/20">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C24A2C]" />
                Needs Cleaning
              </span>
              <span className="text-[11px] font-mono font-medium text-[#A4391F]">
                +{spot.rewardPoints} pts bounty
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Visual Comparison / Photo Area */}
      <div className="bg-[#181A19]">
        {isCleaned ? (
          <BeforeAfterSlider
            beforeImage={spot.beforePhotoUrl}
            afterImage={spot.verification!.afterPhotoUrl}
          />
        ) : (
          <div className="relative aspect-[16/10] overflow-hidden bg-[#ECECE5] group">
            <img
              src={spot.beforePhotoUrl}
              alt={spot.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#842D18] text-white rounded shadow-sm">
                Dirty Spot Reported
              </span>
            </div>
            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onClick={() => onCleanSpot(spot)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#2D513B] text-white rounded shadow-md hover:bg-[#233F2E] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                I Cleaned This Spot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-base sm:text-lg text-[#181A19] leading-snug mb-2">
          {spot.title}
        </h3>
        <p className="text-sm text-[#535A55] leading-relaxed mb-4">
          {spot.description}
        </p>

        {/* Tags & Metadata */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {spot.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded bg-[#F2F2EC] text-[#535A55] border border-[#E3E3DC]"
            >
              #{tag}
            </span>
          ))}
          {spot.estimatedWasteKg && (
            <span className="px-2 py-0.5 text-xs rounded bg-[#F2F2EC] text-[#2C302D] font-mono border border-[#E3E3DC]">
              Est. ~{spot.estimatedWasteKg} kg waste
            </span>
          )}
          <span
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              spot.severity === 'high'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : spot.severity === 'medium'
                ? 'bg-stone-100 text-stone-800 border border-stone-300'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {spot.severity.toUpperCase()} Priority
          </span>
        </div>

        {/* Verification Certificate Box (If Cleaned) */}
        {isCleaned && spot.verification && (
          <div className="bg-[#F2F7F4] border border-[#4D8262]/30 rounded-md p-3.5 mb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <img
                  src={spot.verification.cleanerAvatar}
                  alt={spot.verification.cleanerName}
                  className="w-7 h-7 rounded-full object-cover border border-[#4D8262]"
                />
                <span className="text-xs font-semibold text-[#14231A]">
                  Cleaned by {spot.verification.cleanerName}
                </span>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#2D513B] text-white">
                <Award className="w-3.5 h-3.5 text-yellow-300" />
                +{spot.verification.pointsEarned} pts awarded
              </div>
            </div>

            {spot.verification.notes && (
              <p className="text-xs text-[#2C302D] italic bg-white/70 p-2 rounded border border-[#E3E3DC] mb-2">
                "{spot.verification.notes}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#535A55] font-mono">
              <span className="inline-flex items-center gap-1 text-[#2D513B] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                GPS Proximity: {formatDistance(spot.verification.distanceFromOriginMeters)} from original mark
              </span>
              <span>•</span>
              <span>Verified on-site</span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0EFEA]">
          <div className="flex items-center gap-3">
            {/* Civic Respect (Like) */}
            <button
              type="button"
              onClick={() => onLikeToggle(spot.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                spot.hasLiked
                  ? 'bg-[#FDEEEA] text-[#842D18] border-[#C24A2C]/30'
                  : 'bg-white text-[#535A55] border-[#E3E3DC] hover:bg-[#F9F9F6]'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  spot.hasLiked ? 'fill-[#C24A2C] text-[#C24A2C]' : 'text-[#7E8681]'
                }`}
              />
              <span>{spot.likesCount} Respect</span>
            </button>

            {/* Comments Toggle */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#535A55] bg-white border border-[#E3E3DC] hover:bg-[#F9F9F6] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#7E8681]" />
              <span>{spot.comments.length}</span>
            </button>
          </div>

          {/* Primary Action Button */}
          {isNeedsCleaning ? (
            <button
              type="button"
              onClick={() => onCleanSpot(spot)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#2D513B] text-white hover:bg-[#233F2E] shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>I Cleaned This</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenMap(spot)}
              className="flex items-center gap-1 text-xs font-medium text-[#535A55] hover:text-[#2D513B] transition-colors"
            >
              <span>View On Map</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Comment Section (Collapsible) */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#F0EFEA] space-y-3">
            {spot.comments.length > 0 ? (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {spot.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2 text-xs">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                    <div className="bg-[#F9F9F6] rounded-md p-2 flex-1 border border-[#E3E3DC]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-[#181A19]">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-[#7E8681]">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#535A55]">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#7E8681] italic">
                No comments yet. Be the first to congratulate or ask questions!
              </p>
            )}

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write an encouraging note..."
                className="flex-1 px-3 py-1.5 text-xs rounded-md bg-[#F9F9F6] border border-[#E3E3DC] text-[#181A19] focus:outline-none focus:ring-1 focus:ring-[#2D513B] focus:bg-white placeholder:text-[#7E8681]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-1.5 rounded-md bg-[#2D513B] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#233F2E] transition-colors"
                title="Send Comment"
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

