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
    <article className="relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
      {/* Top Accent Gradient Line: Violet-Purple for Cleaned, Fiery Sunset Orange-Red for Open */}
      <div
        className={`h-1 w-full ${
          isCleaned
            ? 'bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600'
            : 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 shadow-sm'
        }`}
      />

      {/* Top Header: Reporter & Mission Status */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={spot.reporterAvatar}
              alt={spot.reporterName}
              className="w-10 h-10 rounded-full object-cover border-2 border-violet-400 shadow-xs"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                isCleaned ? 'bg-violet-600' : 'bg-orange-500'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 truncate">
                {spot.reporterName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                Scout
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formattedDate}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => onOpenMap(spot)}
                className="flex items-center gap-1 text-slate-600 hover:text-violet-700 cursor-pointer transition-colors text-left group"
                title={spot.location.address || 'View on map'}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[200px] sm:max-w-[320px]">
                  {spot.location.address || `${spot.location.lat.toFixed(4)}, ${spot.location.lng.toFixed(4)}`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Distinct Status & Bounty Pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isCleaned ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              Restored & Verified
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full bg-orange-50 text-orange-700 border border-orange-200 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                Needs Cleaning
              </span>
              <span className="text-xs font-mono font-black text-white bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 px-2.5 py-1 rounded-xl shadow-btn-orange">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-btn-orange hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-white" />
                I Cleaned This Spot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Body Details */}
      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 leading-snug mb-1.5">
            {spot.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {spot.description}
          </p>
        </div>

        {/* Tags & Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {spot.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200"
            >
              #{tag}
            </span>
          ))}
          {spot.estimatedWasteKg && (
            <span className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 font-mono border border-slate-200 inline-flex items-center gap-1.5 font-bold">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              ~{spot.estimatedWasteKg} kg waste
            </span>
          )}
          <span
            className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
              spot.severity === 'high'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : spot.severity === 'medium'
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}
          >
            {spot.severity.toUpperCase()} Priority
          </span>
        </div>

        {/* Verified Cleanup Certificate Seal (If Cleaned) */}
        {isCleaned && spot.verification && (
          <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <img
                  src={spot.verification.cleanerAvatar}
                  alt={spot.verification.cleanerName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-violet-500 shadow-sm"
                />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    Restored by {spot.verification.cleanerName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Completed on {new Date(spot.verification.cleanedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
                <Award className="w-4 h-4 text-amber-300" />
                +{spot.verification.pointsEarned} pts rewarded
              </div>
            </div>

            {spot.verification.notes && (
              <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-purple-100 leading-relaxed">
                "{spot.verification.notes}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-purple-800 font-mono pt-1">
              <span className="inline-flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                GPS Verified: {formatDistance(spot.verification.distanceFromOriginMeters)} proximity
              </span>
              <span>•</span>
              <span className="text-slate-500">On-site photographic proof confirmed</span>
            </div>
          </div>
        )}

        {/* Social Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            {/* Respect (Like) Button */}
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                spot.hasLiked
                  ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-violet-600" />
              <span>{spot.comments.length} Comments</span>
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors flex items-center gap-1 text-xs"
              title="Copy Link to Spot"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && <span className="text-violet-600 text-[10px] font-bold">Copied!</span>}
            </button>
          </div>

          {/* Action Trigger */}
          {isNeedsCleaning ? (
            <button
              type="button"
              onClick={() => onCleanSpot(spot)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-btn-orange hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>I Cleaned This</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenMap(spot)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-violet-700 hover:text-violet-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all"
            >
              <span>Explore on Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Expandable Comments Drawer */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2">
            {spot.comments.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {spot.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 border border-slate-200"
                    />
                    <div className="bg-slate-50 rounded-xl p-3 flex-1 border border-slate-200">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-1">
                No comments yet. Write an encouraging word for the community!
              </p>
            )}

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-slate-200"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write an encouraging message..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-500 hover:to-indigo-500 transition-all shadow-sm"
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
