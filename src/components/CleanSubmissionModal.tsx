import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Navigation,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Spot, UserProfile, CleanVerification, GeoLocation } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import {
  calculateHaversineDistance,
  formatDistance,
  requestDeviceLocation,
} from '../utils/geo';
import { calculateCleanupPoints } from '../utils/rewards';
import {
  Modal,
  Button,
  Badge,
  Textarea,
} from './ui';

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
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingPhoto(true);
        const compressed = await compressImageFile(file, 1200, 0.75);
        setAfterPhotoUrl(compressed);
      } catch (err) {
        console.warn('Compression fallback:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAfterPhotoUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const handleGetLiveGPS = async () => {
    setIsLocating(true);
    try {
      const loc = await requestDeviceLocation();
      setCleanerLocation(loc);
      setForceSimulateNearby(false);
    } catch {
      // fallback keeps simulated nearby location
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!afterPhotoUrl) return;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0F291E', '#D4F63D', '#238253', '#FFFFFF'],
      });
    } catch {
      // ignore
    }

    const verification: CleanVerification = {
      afterPhotoUrl,
      cleanerId: currentUser.id,
      cleanerName: currentUser.name,
      cleanerAvatar: currentUser.avatar || '',
      cleanedAt: new Date().toISOString(),
      location: cleanerLocation,
      distanceFromOriginMeters: Math.round(distanceMeters),
      gpsDistanceMeters: Math.round(distanceMeters),
      isLocationVerified,
      verified: isLocationVerified,
      pointsEarned: pointsCalc.totalPoints,
      notes: cleanerNotes.trim() || 'Cleaned and restored by neighbourhood volunteer.',
    };

    onSubmitClean(spot.id, verification);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Clean Proof & Claim Bounty"
      description={`Spot: ${spot.title}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Comparison: Before Spot Photo + After Photo Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Before Spot Reference */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-navy">
              Original dirty spot (reference)
            </label>
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-line bg-navy-50/50">
              <img
                src={spot.beforePhotoUrl}
                alt="Before condition"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2">
                <Badge variant="coral" size="sm">
                  Before
                </Badge>
              </div>
            </div>
            <p className="text-[11px] text-muted truncate">{spot.location.address}</p>
          </div>

          {/* After Photo Upload / Capture */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-navy">
              Restored after photo *
            </label>
            {afterPhotoUrl ? (
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-line group bg-navy-50/50">
                <img
                  src={afterPhotoUrl}
                  alt="Restored condition"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAfterPhotoUrl('')}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-navy/80 hover:bg-navy text-white text-[11px] rounded-sm transition-colors"
                >
                  Retake
                </button>
                <div className="absolute bottom-2 left-2">
                  <Badge variant="restored" size="sm">
                    After
                  </Badge>
                </div>
              </div>
            ) : isCompressingPhoto ? (
              <div className="flex flex-col items-center justify-center aspect-[4/3] border border-line rounded-sm bg-navy-50/50 p-4 text-center">
                <Loader2 className="w-8 h-8 text-emerald animate-spin mb-2" />
                <p className="text-xs font-semibold text-navy">Optimizing after proof...</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-line hover:border-emerald rounded-sm cursor-pointer bg-navy-50/50 hover:bg-navy-50 transition-colors p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald text-white flex items-center justify-center mb-2 shadow-sm">
                  <Camera className="w-5 h-5 stroke-[1.75]" />
                </div>
                <p className="text-xs font-semibold text-navy">Take or upload after photo</p>
                <p className="text-[10px] text-muted mt-0.5">Show clean area clearly</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Demo Clean Photo Presets */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-muted block">
            Or pick a verified restored proof:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_CLEAN_PHOTOS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setAfterPhotoUrl(preset.url);
                  setCleanerNotes(preset.notes);
                }}
                className="p-1.5 rounded-sm border border-line bg-white hover:bg-navy-50 transition-colors text-left space-y-1 text-xs"
              >
                <div className="h-12 rounded-sm overflow-hidden bg-navy-50">
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold text-navy truncate text-[11px]">
                  {preset.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* GPS Proximity Check */}
        <div className="p-3.5 rounded-sm border border-line bg-navy-50/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald" />
              <span className="text-xs font-semibold text-navy">
                On-site GPS Verification
              </span>
            </div>
            {isLocationVerified ? (
              <Badge variant="restored" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                Verified on-site ({Math.round(distanceMeters)}m)
              </Badge>
            ) : (
              <Badge variant="needs_clean" size="sm">
                {Math.round(distanceMeters)}m away
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Haversine distance match:{' '}
              <strong className="text-navy font-semibold tabular-nums">
                {formatDistance(distanceMeters)}
              </strong>
            </span>
            <button
              type="button"
              onClick={handleGetLiveGPS}
              disabled={isLocating}
              className="text-emerald hover:underline font-semibold text-xs inline-flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Cleanup notes (optional)"
          placeholder="e.g. Cleared 2 large sacks of plastic and cans. Area swept clean."
          value={cleanerNotes}
          onChange={(e) => setCleanerNotes(e.target.value)}
          rows={2}
        />

        {/* Bounty Summary */}
        <div className="p-3.5 rounded-sm bg-navy-50/60 border border-line flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-navy block">
              Bounty Reward to Claim
            </span>
            <span className="text-[11px] text-muted">
              Total points earned for verified cleanup
            </span>
          </div>
          <Badge variant="points" size="md">
            +{pointsCalc.totalPoints} pts
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3 pb-3 sm:pb-0 border-t border-line">
          <Button type="button" variant="ghost" size="md" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            disabled={!afterPhotoUrl}
            icon={<Sparkles className="w-4 h-4 text-lime" />}
          >
            Submit proof & claim bounty
          </Button>
        </div>
      </form>
    </Modal>
  );
};
