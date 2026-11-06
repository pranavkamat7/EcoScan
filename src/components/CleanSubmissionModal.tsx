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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C2B24]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] shadow-modal overflow-hidden my-4 sm:my-6 text-[#1C2B24]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E2DCCD] bg-[#F4F1EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#2F8F5B] text-white flex items-center justify-center font-bold text-sm shadow-subtle flex-shrink-0">
              ✓
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#1C2B24]">Submit cleanup proof</h2>
              <p className="text-xs text-[#6B7468]">
                Upload your 'After' photo and verify proximity to claim bounty points.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#6B7468] hover:text-[#1C2B24] hover:bg-[#E2DCCD] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Target Spot Summary Header */}
          <div className="flex items-center gap-3 p-3 rounded-[6px] bg-[#F4F1EA] border border-[#E2DCCD]">
            <img
              src={spot.beforePhotoUrl}
              alt={spot.title}
              className="w-14 h-14 rounded-[4px] object-cover border border-[#E2DCCD] flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-[#B3432E] uppercase tracking-wider block mb-0.5">
                Target spot
              </span>
              <h4 className="font-semibold text-xs sm:text-sm text-[#1C2B24] truncate">{spot.title}</h4>
              <p className="text-xs text-[#6B7468] flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#B3432E] flex-shrink-0" />
                <span className="truncate">{spot.location.address}</span>
              </p>
            </div>
          </div>

          {/* Clean 'After' Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#1C2B24] mb-1.5">
              Photo of cleaned area (After) <span className="text-[#B3432E]">*</span>
            </label>

            {afterPhotoUrl ? (
              <div className="relative aspect-[16/10] rounded-[6px] overflow-hidden border border-[#E2DCCD] bg-[#F4F1EA]">
                <img
                  src={afterPhotoUrl}
                  alt="Restored proof"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAfterPhotoUrl('')}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 text-xs bg-[#1C2B24]/80 hover:bg-[#1C2B24] text-white rounded-[4px] font-medium transition-colors"
                >
                  Change photo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-5 border border-dashed border-[#D5CEBE] hover:border-[#1E6B4B] rounded-[6px] cursor-pointer bg-[#F4F1EA]/50 hover:bg-[#EAF3EE] transition-colors group">
                  <Camera className="w-5 h-5 text-[#1E6B4B] mb-1.5" />
                  <span className="text-xs font-semibold text-[#1C2B24] text-center">
                    Snap 'After' photo with camera
                  </span>
                  <span className="text-[11px] text-[#6B7468] text-center">
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
                  <span className="text-[11px] text-[#6B7468] block mb-1">
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
                        className="text-left p-1.5 rounded-[6px] border border-[#E2DCCD] bg-[#FFFDF8] hover:border-[#1E6B4B] transition-colors text-xs"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-12 object-cover rounded-[4px] mb-1"
                        />
                        <span className="text-[11px] font-medium text-[#1C2B24] block truncate">
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
            className={`p-3 rounded-[6px] border transition-colors ${
              isLocationVerified
                ? 'bg-[#EAF3EE] border-[#1E6B4B]/30'
                : 'bg-[#FDF6ED] border-[#D9822B]/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2">
                {isLocationVerified ? (
                  <ShieldCheck className="w-4 h-4 text-[#1E6B4B] flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#D9822B] flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-semibold text-[#1C2B24]">
                    {isLocationVerified
                      ? 'On-site location verified (< 250m)'
                      : 'Outside proximity threshold'}
                  </h4>
                  <p className="text-[11px] text-[#6B7468] mt-0.5">
                    Calculated distance: <strong className="text-[#1C2B24] tabular-nums font-semibold">{formatDistance(distanceMeters)}</strong> away from reported spot.
                  </p>
                </div>
              </div>

              {/* Simulation switch for desktop testing */}
              <button
                type="button"
                onClick={handleSimulateOnSite}
                className="text-xs font-medium text-[#1E6B4B] bg-[#FFFDF8] hover:bg-[#F4F1EA] px-2.5 py-1 rounded-[4px] border border-[#E2DCCD] shadow-subtle flex items-center gap-1 flex-shrink-0"
                title="Simulate standing right next to the spot"
              >
                <Navigation className="w-3 h-3 text-[#1E6B4B]" />
                Simulate on-site
              </button>
            </div>
          </div>

          {/* Cleaner Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
              Cleanup notes / Details
            </label>
            <textarea
              rows={2}
              value={cleanerNotes}
              onChange={(e) => setCleanerNotes(e.target.value)}
              placeholder="e.g. Collected 2 bags of cans, swept sidewalk, sorted recyclables..."
              className="w-full px-3 py-1.5 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none focus:border-[#1E6B4B] resize-none"
            />
          </div>

          {/* Rewards Calculation Strip */}
          <div className="bg-[#EAF3EE] p-3 rounded-[6px] border border-[#E2DCCD] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1E6B4B] flex-shrink-0" />
              <div>
                <span className="font-semibold text-[#1C2B24] block">Reward points to be credited</span>
                <span className="text-[11px] text-[#6B7468]">
                  Includes spot bounty & verified on-site proof bonus
                </span>
              </div>
            </div>
            <span className="font-semibold text-sm text-[#1E6B4B] tabular-nums flex-shrink-0">
              +{pointsCalc.totalPoints} pts
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DCCD]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-[#6B7468] hover:text-[#1C2B24] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!afterPhotoUrl}
              className="px-4 py-2 text-xs font-medium bg-[#1E6B4B] hover:bg-[#18553B] text-white rounded-[6px] shadow-subtle disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit proof & claim bounty</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
