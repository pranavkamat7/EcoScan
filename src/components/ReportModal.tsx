import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  MapPin,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { GeoLocation, SeverityLevel, Spot, UserProfile } from '../types';
import { requestDeviceLocation, SAMPLE_CITIES } from '../utils/geo';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newSpot: Omit<Spot, 'id' | 'createdAt' | 'likesCount' | 'comments' | 'status'>) => void;
  currentUser: UserProfile;
}

const PRESET_MESSES = [
  {
    name: 'Park Lawn Litter',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1000&q=80',
    title: 'Plastic & can waste across public lawn',
    severity: 'medium' as SeverityLevel,
  },
  {
    name: 'Urban Back Alley',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1000&q=80',
    title: 'Torn trash bags & cardboard obstructing walkway',
    severity: 'high' as SeverityLevel,
  },
  {
    name: 'Water Creek Debris',
    url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=1000&q=80',
    title: 'Discarded plastic bottles trapped along creek stones',
    severity: 'medium' as SeverityLevel,
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [tagsInput, setTagsInput] = useState('Litter, PublicSpace');
  const [estimatedKg, setEstimatedKg] = useState<number>(10);

  const [location, setLocation] = useState<GeoLocation>({
    lat: 40.7829,
    lng: -73.9654,
    address: 'Central Park West, New York',
    accuracyMeters: 5,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Auto-fetch location on open
  useEffect(() => {
    if (isOpen) {
      handleGetLiveLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGetLiveLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const loc = await requestDeviceLocation();
      setLocation(loc);
    } catch (err: any) {
      setLocationError('Could not acquire GPS automatically. Using default location coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateBounty = () => {
    if (severity === 'high') return 350;
    if (severity === 'medium') return 220;
    return 130;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: description.trim() || 'Civic cleanup mission reported by community scout.',
      beforePhotoUrl: photoUrl,
      severity,
      tags: tags.length > 0 ? tags : ['CivicCleanup'],
      location,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterAvatar: currentUser.avatar,
      rewardPoints: calculateBounty(),
      estimatedWasteKg: Number(estimatedKg) || 8,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-lg border border-[#E3E3DC] shadow-modal overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E3DC] bg-[#F9F9F6]">
          <div>
            <h2 className="text-base font-semibold text-[#181A19]">Report a Dirty Area</h2>
            <p className="text-xs text-[#535A55]">
              Capture photo & live GPS to create a cleanup mission for the community.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#7E8681] hover:text-[#181A19] hover:bg-[#E3E3DC]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Photo Capture Section */}
          <div>
            <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1.5">
              Photo of Dirty Area <span className="text-[#BA4A2B]">*</span>
            </label>

            {photoUrl ? (
              <div className="relative aspect-[16/10] rounded-md overflow-hidden border border-[#E3E3DC] bg-[#181A19]">
                <img
                  src={photoUrl}
                  alt="Captured dirty area"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 px-2.5 py-1 text-xs bg-black/70 text-white rounded hover:bg-black font-medium"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#CACECB] hover:border-[#2D513B] rounded-md cursor-pointer bg-[#F9F9F6] transition-colors">
                    <Camera className="w-6 h-6 text-[#535A55] mb-1" />
                    <span className="text-xs font-medium text-[#181A19]">Snap with Camera</span>
                    <span className="text-[10px] text-[#7E8681]">or browse photo file</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Quick Presets for easy demonstration */}
                <div className="pt-1">
                  <span className="text-[11px] text-[#7E8681] block mb-1">
                    Or select a sample photo to test quickly:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_MESSES.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => {
                          setPhotoUrl(preset.url);
                          setTitle(preset.title);
                          setSeverity(preset.severity);
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

          {/* Live Location Capture */}
          <div className="bg-[#F4F4F0] p-3.5 rounded-md border border-[#E3E3DC] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2C302D] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2D513B]" />
                Live GPS Location
              </span>
              <button
                type="button"
                onClick={handleGetLiveLocation}
                disabled={isLocating}
                className="text-[11px] font-medium text-[#2D513B] hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Locating...
                  </>
                ) : (
                  'Re-fetch GPS'
                )}
              </button>
            </div>

            <div className="text-xs text-[#181A19]">
              <p className="font-medium truncate">{location.address || 'Detecting address...'}</p>
              <p className="font-mono text-[11px] text-[#7E8681]">
                Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
                {location.accuracyMeters && ` (±${location.accuracyMeters}m accuracy)`}
              </p>
            </div>

            {locationError && (
              <p className="text-[11px] text-[#BA4A2B] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {locationError}
              </p>
            )}

            {/* Quick city switcher for desktop testing */}
            <div className="pt-1 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-[#7E8681]">Preset Spot:</span>
              {SAMPLE_CITIES.slice(0, 3).map((city) => (
                <button
                  type="button"
                  key={city.name}
                  onClick={() =>
                    setLocation({
                      lat: city.lat,
                      lng: city.lng,
                      address: city.name,
                      accuracyMeters: 5,
                    })
                  }
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#E3E3DC] text-[#535A55] hover:text-[#181A19]"
                >
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Caption */}
          <div>
            <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1">
              Title / Summary <span className="text-[#BA4A2B]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Riverside Trail Overgrown Litter Pile"
              className="w-full px-3 py-2 text-sm rounded-md bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1">
              Description & Context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what kind of trash is there, accessibility, tools recommended (bags, gloves)..."
              className="w-full px-3 py-2 text-sm rounded-md bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
            />
          </div>

          {/* Severity & Waste estimation */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('low')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    severity === 'low'
                      ? 'bg-emerald-50 border-[#2D513B] text-[#2D513B] shadow-xs ring-1 ring-[#2D513B]'
                      : 'bg-white border-[#E3E3DC] text-[#535A55] hover:bg-[#F9F9F6]'
                  }`}
                >
                  <span className="block font-bold">Low</span>
                  <span className="text-[10px] opacity-75 font-normal">Light litter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('medium')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    severity === 'medium'
                      ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-xs ring-1 ring-amber-600'
                      : 'bg-white border-[#E3E3DC] text-[#535A55] hover:bg-[#F9F9F6]'
                  }`}
                >
                  <span className="block font-bold">Medium</span>
                  <span className="text-[10px] opacity-75 font-normal">Multi-bag area</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('high')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    severity === 'high'
                      ? 'bg-rose-50 border-[#BA4A2B] text-[#842D18] shadow-xs ring-1 ring-[#BA4A2B]'
                      : 'bg-white border-[#E3E3DC] text-[#535A55] hover:bg-[#F9F9F6]'
                  }`}
                >
                  <span className="block font-bold">High</span>
                  <span className="text-[10px] opacity-75 font-normal">Heavy dumping</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1">
                Estimated Waste (kg)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="100"
                  step="2"
                  value={estimatedKg}
                  onChange={(e) => setEstimatedKg(Number(e.target.value))}
                  className="flex-1 accent-[#2D513B] cursor-pointer"
                />
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#F2F2EC] border border-[#E3E3DC] min-w-[65px] text-center">
                  ~{estimatedKg} kg
                </span>
              </div>
            </div>
          </div>

          {/* Bounty Reward Info Banner */}
          <div className="p-3 rounded-md bg-[#EDF3EE] border border-[#2D513B]/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#233F2E]">
              <Sparkles className="w-4 h-4 text-[#2D513B]" />
              <span>Bounty offered to the cleaner:</span>
            </div>
            <span className="font-mono font-bold text-sm text-[#2D513B]">
              +{calculateBounty()} pts
            </span>
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
              disabled={!photoUrl || !title.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2D513B] rounded-md hover:bg-[#233F2E] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              Post Dirty Spot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

