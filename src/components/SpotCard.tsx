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
  Share2,
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
  const [copiedShare, setCopiedShare] = useState(false);

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

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const formattedDate = new Date(spot.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="relative bg-[#1A1A24]/95 rounded-3xl border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 overflow-hidden shadow-xl shadow-black/25 hover:shadow-emerald-500/10">
      {/* Top Accent Line */}
      <div
        className={`h-1.5 w-full ${
          isCleaned
            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
            : 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-sm'
        }`}
      />

      {/* Top Header: Reporter & Mission Status - Mobile optimized spacing */}
      <div className="p-3.5 sm:p-5 border-b border-white/[0.08] bg-[#1E1E2B] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={spot.reporterAvatar}
              alt={spot.reporterName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-[#1E1E2B] ${
                isCleaned ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white truncate">
                {spot.reporterName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">
                Scout
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Calendar className="w-3 h-3 text-slate-500" />
                {formattedDate}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => onOpenMap(spot)}
                className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors text-left group"
                title={spot.location.address || 'View on map'}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[170px] sm:max-w-[300px]">
                  {spot.location.address || `${spot.location.lat.toFixed(4)}, ${spot.location.lng.toFixed(4)}`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Distinct Status & Bounty Pill */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
          {isCleaned ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 text-xs font-extrabold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Restored & Verified
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 text-xs font-extrabold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Needs Cleaning
              </span>
              <span className="text-xs font-mono font-black text-white bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 px-2.5 py-1 rounded-xl shadow-xs">
                +{spot.rewardPoints} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Visual Display: Interactive Slider or Open Mission Photo */}
      <div className="bg-slate-950">
        {isCleaned ? (
          <BeforeAfterSlider
            beforeImage={spot.beforePhotoUrl}
            afterImage={spot.verification!.afterPhotoUrl}
          />
        ) : (
          <div className="relative aspect-[16/10] overflow-hidden group">
            <img
              src={spot.beforePhotoUrl}
              alt={spot.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-full border border-white/20 shadow-md backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Littered Spot Reported
              </span>
            </div>

            <div className="absolute bottom-4 right-4">
              <button
                type="button"
                onClick={() => onCleanSpot(spot)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-btn-green hover:scale-105 active:scale-95 transition-all min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-white" />
                I Cleaned This Spot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Body Details */}
      <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug mb-1.5">
            {spot.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {spot.description}
          </p>
        </div>

        {/* Tags & Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {spot.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
            >
              #{tag}
            </span>
          ))}
          {spot.estimatedWasteKg && (
            <span className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.06] text-slate-200 font-mono border border-white/10 inline-flex items-center gap-1.5 font-bold">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              ~{spot.estimatedWasteKg} kg waste
            </span>
          )}
          <span
            className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
              spot.severity === 'high'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                : spot.severity === 'medium'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
            }`}
          >
            {spot.severity.toUpperCase()} Priority
          </span>
        </div>

        {/* Verified Cleanup Certificate Seal (If Cleaned) */}
        {isCleaned && spot.verification && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <img
                  src={spot.verification.cleanerAvatar}
                  alt={spot.verification.cleanerName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <div>
                  <span className="text-xs font-extrabold text-white block">
                    Restored by {spot.verification.cleanerName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Completed on {new Date(spot.verification.cleanedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
                <Award className="w-4 h-4 text-amber-200" />
                +{spot.verification.pointsEarned} pts rewarded
              </div>
            </div>

            {spot.verification.notes && (
              <p className="text-xs text-slate-200 italic bg-[#13131D] p-3 rounded-lg border border-emerald-500/20 leading-relaxed">
                "{spot.verification.notes}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-300 font-mono pt-1">
              <span className="inline-flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                GPS Verified: {formatDistance(spot.verification.distanceFromOriginMeters)} proximity
              </span>
              <span>•</span>
              <span className="text-slate-400">On-site photographic proof confirmed</span>
            </div>
          </div>
        )}

        {/* Social Action Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.08] flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            {/* Respect (Like) Button */}
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all border min-h-[40px] ${
                spot.hasLiked
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-xs'
                  : 'bg-white/[0.06] text-slate-300 border border-white/10 hover:bg-white/[0.1] hover:text-white'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  spot.hasLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                } ${likeAnimating ? 'scale-125' : 'scale-100'}`}
              />
              <span>{spot.likesCount} Respect</span>
            </button>

            {/* Comments Toggle */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] hover:text-white transition-colors min-h-[40px]"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{spot.comments.length} Comments</span>
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-colors flex items-center gap-1 text-xs min-h-[40px]"
              title="Copy Link to Spot"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && <span className="text-emerald-400 text-[10px] font-bold">Copied!</span>}
            </button>
          </div>

          {/* Action Trigger */}
          {isNeedsCleaning ? (
            <button
              type="button"
              onClick={() => onCleanSpot(spot)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-btn-green hover:scale-[1.02] active:scale-95 transition-all min-h-[40px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>I Cleaned This</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenMap(spot)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 transition-all min-h-[40px]"
            >
              <span>Explore on Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Expandable Comments Drawer */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 animate-in fade-in slide-in-from-top-2">
            {spot.comments.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {spot.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 border border-white/10"
                    />
                    <div className="bg-[#14141E] rounded-xl p-3 flex-1 border border-white/[0.08]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-white text-[11px]">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2 text-center">No comments yet. Be the first to cheer!</p>
            )}

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/10"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write an encouraging message..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-500 min-h-[40px]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs min-h-[40px] min-w-[40px] flex items-center justify-center"
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
