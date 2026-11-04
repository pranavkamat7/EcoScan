import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Spot, UserProfile, CleanVerification, GeoLocation } from '../types';
import {
  calculateHaversineDistance,
  formatDistance,
  requestDeviceLocation,
} from '../utils/geo';
import { calculateCleanupPoints } from '../utils/rewards';

interface CleanSubmissionModalProps {
  spot: Spot | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitClean: (spotId: string, verification: CleanVerification) => void;
  currentUser: UserProfile;
}

const PRESET_CLEAN_PHOTOS = [
  {
    name: 'Restored Park Green',
    url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80',
    notes: 'Picked up broken glass and loose wrappers. Area is completely safe for people and pets.',
  },
  {
    name: 'Clean Path & Riverbank',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
    notes: 'Cleared all cans and plastic bottles with 3 trash bags. Natural grass and riverbank is clean.',
  },
  {
    name: 'Swept Cobblestone Alley',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    notes: 'Removed all debris and cardboard. Swept clean and sorted recycling.',
  },
];

export const CleanSubmissionModal: React.FC<CleanSubmissionModalProps> = ({
  spot,
  isOpen,
  onClose,
  onSubmitClean,
  currentUser,
}) => {
  if (!isOpen || !spot) return null;

  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [cleanerNotes, setCleanerNotes] = useState('');
  const [cleanerLocation, setCleanerLocation] = useState<GeoLocation>({
    lat: spot.location.lat + 0.0001,
    lng: spot.location.lng + 0.0001,
    address: spot.location.address,
    accuracyMeters: 4,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [forceSimulateNearby, setForceSimulateNearby] = useState(true);

  const distanceMeters = calculateHaversineDistance(spot.location, cleanerLocation);
  const isLocationVerified = distanceMeters <= 250;

  const pointsCalc = calculateCleanupPoints(
    spot.severity,
    isLocationVerified,
    distanceMeters
  );

  useEffect(() => {
    if (!forceSimulateNearby) {
      handleGetLiveGPS();
    }
  }, [forceSimulateNearby]);

  const handleGetLiveGPS = async () => {
    setIsLocating(true);
    try {
      const loc = await requestDeviceLocation();
      setCleanerLocation(loc);
      setForceSimulateNearby(false);
    } catch {
      // fallback
    } finally {
      setIsLocating(false);
    }
  };

  const handleSimulateOnSite = () => {
    setForceSimulateNearby(true);
    const jitter = 0.00012;
    setCleanerLocation({
      lat: spot.location.lat + (Math.random() - 0.5) * jitter,
      lng: spot.location.lng + (Math.random() - 0.5) * jitter,
      address: spot.location.address,
      accuracyMeters: 5,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAfterPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!afterPhotoUrl) return;

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#16A34A', '#22C55E', '#15803D', '#EAB308', '#17171F'],
    });

    const verification: CleanVerification = {
      cleanerId: currentUser.id,
      cleanerName: currentUser.name,
      cleanerAvatar: currentUser.avatar,
      afterPhotoUrl,
      cleanedAt: new Date().toISOString(),
      location: cleanerLocation,
      distanceFromOriginMeters: distanceMeters,
      isLocationVerified,
      notes: cleanerNotes.trim() || 'Completed thorough civic cleanup and sorted recyclables.',
      pointsEarned: pointsCalc.totalPoints,
    };

    onSubmitClean(spot.id, verification);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#1A1A24] rounded-3xl border border-white/[0.1] shadow-2xl overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-white/[0.08] bg-[#121217]/60">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
              ✨
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">Submit Cleanup Proof</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Upload your 'After' photo and verify proximity to claim bounty points.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Target Spot Summary Header */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#121217] border border-white/[0.08]">
            <img
              src={spot.beforePhotoUrl}
              alt={spot.title}
              className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-xs flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full inline-block mb-1">
                Mission Spot
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-white truncate">{spot.title}</h4>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate">{spot.location.address}</span>
              </p>
            </div>
          </div>

          {/* Clean 'After' Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Photo of Cleaned Area (After) <span className="text-rose-400">*</span>
            </label>

            {afterPhotoUrl ? (
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#121217] shadow-xs">
                <img
                  src={afterPhotoUrl}
                  alt="Restored proof"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAfterPhotoUrl('')}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 text-xs bg-black/80 hover:bg-black text-white rounded-xl font-medium backdrop-blur-xs transition-colors border border-white/10"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <label className="flex flex-col items-center justify-center p-5 sm:p-6 border-2 border-dashed border-white/20 hover:border-emerald-500 rounded-2xl cursor-pointer bg-white/[0.03] hover:bg-emerald-500/10 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-white text-center">
                    Snap 'After' Photo with Camera
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 text-center">
                    or choose a cleaned photo from file
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                    Or select a sample clean photo for testing:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_CLEAN_PHOTOS.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => {
                          setAfterPhotoUrl(preset.url);
                          setCleanerNotes(preset.notes);
                        }}
                        className="text-left p-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all text-xs"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-12 sm:h-14 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[11px] font-bold text-slate-300 block truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Proximity Verification Box */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
              isLocationVerified
                ? 'bg-emerald-500/10 border-emerald-500/25'
                : 'bg-orange-500/10 border-orange-500/25'
            }`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2.5">
                {isLocationVerified ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isLocationVerified
                      ? 'On-Site Location Verified (< 250m)'
                      : 'Outside Proximity Threshold'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Calculated distance: <strong className="text-emerald-400 font-mono font-bold">{formatDistance(distanceMeters)}</strong> away from original report spot.
                  </p>
                </div>
              </div>

              {/* Simulation switch for desktop testing */}
              <button
                type="button"
                onClick={handleSimulateOnSite}
                className="text-[11px] font-bold text-emerald-400 bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1.5 rounded-xl border border-white/10 shadow-xs flex items-center gap-1 flex-shrink-0 min-h-[36px]"
                title="Simulate standing right next to the spot"
              >
                <Navigation className="w-3 h-3 text-emerald-400" />
                Simulate On-Site
              </button>
            </div>
          </div>

          {/* Cleaner Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Cleanup Notes / Details
            </label>
            <textarea
              rows={2}
              value={cleanerNotes}
              onChange={(e) => setCleanerNotes(e.target.value)}
              placeholder="e.g. Collected 2 large bags of cans, sorted recyclables, swept pathway..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white/[0.08] placeholder:text-slate-500 resize-none min-h-[56px]"
            />
          </div>

          {/* Rewards Calculation Pill */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 sm:p-4.5 rounded-2xl text-white flex items-center justify-between shadow-xl shadow-emerald-600/20 gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-200 flex-shrink-0" />
              <div>
                <span className="text-xs font-extrabold block">Reward Points Earned</span>
                <span className="text-[11px] text-emerald-100">
                  Includes priority bounty, verified GPS proximity & proof bonus
                </span>
              </div>
            </div>
            <span className="text-xl font-black font-mono text-amber-200 flex-shrink-0">
              +{pointsCalc.totalPoints} pts
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08] flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!afterPhotoUrl}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-btn-green disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              Submit Proof & Claim Bounty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
