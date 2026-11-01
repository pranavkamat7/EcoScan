import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Loader2,
  Sliders,
  ShieldCheck,
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
    name: 'Clean Path & Riverbank',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
    notes: 'Cleared all cans and plastic bottles with 2 trash bags. Natural grass is now visible.',
  },
  {
    name: 'Swept Cobblestone Alley',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    notes: 'Removed all debris and cardboard. Swept clean and notified recycling center.',
  },
  {
    name: 'Restored Park Green',
    url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80',
    notes: 'Picked up broken glass and loose wrappers. Area is completely safe for people and pets.',
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
    lat: spot.location.lat + 0.0001, // Default nearby (within ~15m)
    lng: spot.location.lng + 0.0001,
    address: spot.location.address,
    accuracyMeters: 4,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [forceSimulateNearby, setForceSimulateNearby] = useState(true);

  // Calculate distance between spot and cleaner's coordinates
  const distanceMeters = calculateHaversineDistance(spot.location, cleanerLocation);
  // Match threshold is 250 meters
  const isLocationVerified = distanceMeters <= 250;

  const pointsCalc = calculateCleanupPoints(
    spot.severity,
    isLocationVerified,
    distanceMeters
  );

  useEffect(() => {
    // If not simulating nearby, try getting device location
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
      // Fallback
    } finally {
      setIsLocating(false);
    }
  };

  const handleSimulateOnSite = () => {
    setForceSimulateNearby(true);
    // Slight jitter 12-25m away
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

    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2D513B', '#4D8262', '#E7EFEA', '#F2F7F4', '#C24A2C'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-lg border border-[#E3E3DC] shadow-modal overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E3DC] bg-[#F2F7F4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2D513B] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#14231A]">Submit Cleaned Proof</h2>
              <p className="text-xs text-[#535A55]">
                Match location and upload the cleaned area photo to earn reward points.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#7E8681] hover:text-[#181A19] hover:bg-[#E3E3DC]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Reference: Original Dirty Spot */}
          <div className="p-3 bg-[#F9F9F6] rounded-md border border-[#E3E3DC] flex gap-3 items-center">
            <img
              src={spot.beforePhotoUrl}
              alt="Original spot"
              className="w-16 h-16 rounded object-cover border border-[#E3E3DC] flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-semibold text-[#BA4A2B] block">
                Target Cleanup Spot
              </span>
              <p className="text-xs font-semibold text-[#181A19] truncate">{spot.title}</p>
              <p className="text-[11px] text-[#7E8681] truncate">{spot.location.address}</p>
            </div>
          </div>

          {/* After Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1.5">
              Photo of Cleaned Area <span className="text-[#BA4A2B]">*</span>
            </label>

            {afterPhotoUrl ? (
              <div className="relative aspect-[16/10] rounded-md overflow-hidden border border-[#2D513B] bg-[#181A19]">
                <img
                  src={afterPhotoUrl}
                  alt="Cleaned area proof"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAfterPhotoUrl('')}
                  className="absolute top-2 right-2 px-2.5 py-1 text-xs bg-black/70 text-white rounded hover:bg-black font-medium"
                >
                  Change Photo
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#2D513B] text-white text-[10px] font-semibold tracking-wider uppercase">
                  ✓ After Proof Loaded
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#CACECB] hover:border-[#2D513B] rounded-md cursor-pointer bg-[#F9F9F6] transition-colors">
                  <Camera className="w-6 h-6 text-[#2D513B] mb-1" />
                  <span className="text-xs font-semibold text-[#181A19]">
                    Snap Cleaned Spot Photo
                  </span>
                  <span className="text-[10px] text-[#7E8681]">or upload from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Quick Presets for Demo */}
                <div className="pt-1">
                  <span className="text-[11px] text-[#7E8681] block mb-1">
                    Or select a verified clean photo to test immediately:
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
                        className="text-left p-1.5 rounded border border-[#E3E3DC] bg-[#F9F9F6] hover:bg-[#EDF3EE] hover:border-[#2D513B] transition-colors"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-12 object-cover rounded mb-1"
                        />
                        <span className="text-[10px] font-medium text-[#2C302D] block truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Matching Verification Box */}
          <div
            className={`p-3.5 rounded-md border transition-colors ${
              isLocationVerified
                ? 'bg-[#F2F7F4] border-[#4D8262]/40 text-[#14231A]'
                : 'bg-[#FDF7F5] border-[#BA4A2B]/40 text-[#842D18]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                {isLocationVerified ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#2D513B]" />
                    <span>Location Matched! (Verified on-site)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#BA4A2B]" />
                    <span>Location Check: Outside Spot Boundary</span>
                  </>
                )}
              </span>

              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-[#E3E3DC]">
                {formatDistance(distanceMeters)} away
              </span>
            </div>

            <p className="text-xs text-[#535A55] leading-relaxed mb-2">
              {isLocationVerified
                ? `Your current GPS is within ${distanceMeters}m of original spot. Full GPS bonus points will be awarded!`
                : `You appear to be ${formatDistance(distanceMeters)} away from the target coordinates.`}
            </p>

            {/* Live GPS vs On-Site Simulator toggle (helpful for testing on laptop) */}
            <div className="flex items-center gap-2 pt-2 border-t border-black/5">
              <button
                type="button"
                onClick={handleSimulateOnSite}
                className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                  forceSimulateNearby
                    ? 'bg-[#2D513B] text-white border-[#2D513B]'
                    : 'bg-white text-[#2C302D] border-[#E3E3DC] hover:bg-[#F2F2EC]'
                }`}
              >
                ✓ On-Site GPS Simulation (14m)
              </button>
              <button
                type="button"
                onClick={handleGetLiveGPS}
                disabled={isLocating}
                className="text-[11px] px-2.5 py-1 rounded bg-white text-[#2C302D] border border-[#E3E3DC] hover:bg-[#F2F2EC] flex items-center gap-1"
              >
                {isLocating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3 text-[#2D513B]" />
                )}
                Use Raw Browser GPS
              </button>
            </div>
          </div>

          {/* Cleaner Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1">
              Cleanup Notes / Details
            </label>
            <textarea
              rows={2}
              value={cleanerNotes}
              onChange={(e) => setCleanerNotes(e.target.value)}
              placeholder="e.g., Cleaned with 3 friends, segregated plastics and glass for recycling..."
              className="w-full px-3 py-2 text-xs rounded-md bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
            />
          </div>

          {/* Reward Points Calculation Ledger */}
          <div className="bg-[#F9F9F6] border-2 border-dashed border-[#CACECB] rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E3E3DC]">
              <span className="text-xs font-bold text-[#181A19] flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                Civic Bounty Ledger
              </span>
              <span className="text-[10px] text-[#7E8681] font-mono">Verified Claim</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {pointsCalc.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[#535A55]">
                  <span>{item.label}</span>
                  <span className="font-mono text-[#181A19] font-bold">+{item.points} pts</span>
                </div>
              ))}
              <div className="pt-2.5 border-t border-[#E3E3DC] flex justify-between font-bold text-[#2D513B] text-sm">
                <span>Total Points Credited</span>
                <span className="font-mono font-bold text-base text-[#2D513B]">
                  +{pointsCalc.totalPoints} pts
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3E3DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#535A55] hover:text-[#181A19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!afterPhotoUrl}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2D513B] rounded-md hover:bg-[#233F2E] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Submit & Claim Reward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

