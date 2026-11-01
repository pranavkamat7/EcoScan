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
  ShieldCheck,
  Scale,
} from 'lucide-react';
import type { Spot, UserProfile } from '../types';
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
  const [likeAnimating, setLikeAnimating] = useState(false);

  const isCleaned = spot.status === 'cleaned' && spot.verification;
  const isNeedsCleaning = spot.status === 'needs_cleaning';

  const handleLikeClick = () => {
    setLikeAnimating(true);
    onLikeToggle(spot.id);
    setTimeout(() => setLikeAnimating(false), 300);
  };

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
    <article className="bg-white rounded-xl border border-[#E3E3DC] shadow-xs hover:shadow-card transition-all overflow-hidden mb-6">
      {/* Top Header: Reporter & Status */}
      <div className="p-4 sm:p-5 pb-3.5 border-b border-[#F0EFEA] flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={spot.reporterAvatar}
            alt={spot.reporterName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs flex-shrink-0 ring-1 ring-[#E3E3DC]"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#181A19] truncate">
                {spot.reporterName}
              </span>
              <span className="text-[11px] text-[#7E8681] hidden sm:inline font-mono">
                • scout report
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7E8681] mt-0.5">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Calendar className="w-3 h-3 text-[#7E8681]" />
                {formattedDate}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => onOpenMap(spot)}
                className="flex items-center gap-1 hover:text-[#2D513B] cursor-pointer truncate transition-colors text-left group"
                title={spot.location.address || 'View on map'}
              >
                <MapPin className="w-3 h-3 text-[#2D513B] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[140px] sm:max-w-[220px]">
                  {spot.location.address || `${spot.location.lat.toFixed(4)}, ${spot.location.lng.toFixed(4)}`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          {isCleaned ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-[#E7EFEA] text-[#14231A] border border-[#2D513B]/25 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D513B]" />
              Transformed
            </span>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-[#FDEEEA] text-[#842D18] border border-[#C24A2C]/25 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C24A2C]" />
                Needs Cleaning
              </span>
              <span className="text-[11px] font-mono font-bold text-[#A4391F]">
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
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute top-3.5 left-3.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#842D18]/90 text-white rounded border border-white/20 shadow-sm backdrop-blur-xs">
                Littered Spot Reported
              </span>
            </div>
            <div className="absolute bottom-3.5 right-3.5">
              <button
                type="button"
                onClick={() => onCleanSpot(spot)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-[#2D513B] text-white rounded-md shadow-md hover:bg-[#233F2E] transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                I Cleaned This Spot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-base sm:text-lg text-[#181A19] leading-snug mb-2">
          {spot.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#535A55] leading-relaxed mb-4">
          {spot.description}
        </p>

        {/* Tags & Impact Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {spot.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#F2F2EC] text-[#535A55] border border-[#E3E3DC]"
            >
              #{tag}
            </span>
          ))}
          {spot.estimatedWasteKg && (
            <span className="px-2.5 py-1 text-xs rounded-md bg-[#F2F2EC] text-[#181A19] font-mono border border-[#E3E3DC] inline-flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#7E8681]" />
              ~{spot.estimatedWasteKg} kg waste
            </span>
          )}
          <span
            className={`px-2.5 py-1 text-xs rounded-md font-semibold ${
              spot.severity === 'high'
                ? 'bg-rose-50 text-[#842D18] border border-rose-200'
                : spot.severity === 'medium'
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {spot.severity.toUpperCase()} Priority
          </span>
        </div>

        {/* Verified Cleanup Certificate Seal (If Cleaned) */}
        {isCleaned && spot.verification && (
          <div className="bg-[#F2F7F4] border-2 border-[#4D8262]/30 rounded-lg p-4 mb-4 relative overflow-hidden">
            {/* Subtle background seal badge */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={spot.verification.cleanerAvatar}
                  alt={spot.verification.cleanerName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#2D513B] shadow-xs"
                />
                <div>
                  <span className="text-xs font-bold text-[#14231A] block">
                    Cleaned by {spot.verification.cleanerName}
                  </span>
                  <span className="text-[10px] text-[#535A55] font-mono">
                    Restored {new Date(spot.verification.cleanedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#2D513B] text-white shadow-xs">
                <Award className="w-3.5 h-3.5 text-yellow-300" />
                +{spot.verification.pointsEarned} pts awarded
              </div>
            </div>

            {spot.verification.notes && (
              <p className="text-xs text-[#2C302D] italic bg-white p-2.5 rounded-md border border-[#E3E3DC] mb-2.5 leading-relaxed">
                "{spot.verification.notes}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#535A55] font-mono">
              <span className="inline-flex items-center gap-1 text-[#2D513B] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                GPS Verified: {formatDistance(spot.verification.distanceFromOriginMeters)} proximity
              </span>
              <span>•</span>
              <span className="text-[#7E8681]">On-site photographic proof confirmed</span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3.5 border-t border-[#F0EFEA]">
          <div className="flex items-center gap-2.5">
            {/* Respect (Like) Button */}
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                spot.hasLiked
                  ? 'bg-[#FDEEEA] text-[#842D18] border-[#C24A2C]/30 shadow-xs'
                  : 'bg-white text-[#535A55] border-[#E3E3DC] hover:bg-[#F9F9F6] hover:text-[#181A19]'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
                  spot.hasLiked
                    ? 'fill-[#C24A2C] text-[#C24A2C]'
                    : 'text-[#7E8681]'
                } ${likeAnimating ? 'scale-130' : 'scale-100'}`}
              />
              <span>{spot.likesCount} Respect</span>
            </button>

            {/* Comments Toggle */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#535A55] bg-white border border-[#E3E3DC] hover:bg-[#F9F9F6] hover:text-[#181A19] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#7E8681]" />
              <span>{spot.comments.length} Comments</span>
            </button>
          </div>

          {/* Action Trigger */}
          {isNeedsCleaning ? (
            <button
              type="button"
              onClick={() => onCleanSpot(spot)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold bg-[#2D513B] text-white hover:bg-[#233F2E] shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>I Cleaned This</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenMap(spot)}
              className="flex items-center gap-1 text-xs font-semibold text-[#535A55] hover:text-[#2D513B] transition-colors"
            >
              <span>View On Map</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#F0EFEA] space-y-3">
            {spot.comments.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {spot.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 border border-[#E3E3DC]"
                    />
                    <div className="bg-[#F9F9F6] rounded-lg p-2.5 flex-1 border border-[#E3E3DC]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-[#181A19]">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-[#7E8681] font-mono">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#535A55] leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#7E8681] italic">
                No comments yet. Write an encouraging message to the cleaner!
              </p>
            )}

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-[#E3E3DC]"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a message of civic respect..."
                className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-[#F9F9F6] border border-[#E3E3DC] text-[#181A19] focus:outline-none focus:ring-1 focus:ring-[#2D513B] focus:bg-white placeholder:text-[#7E8681]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-lg bg-[#2D513B] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#233F2E] transition-all"
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
