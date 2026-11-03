import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  X,
  Camera,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle,
  Search,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { GeoLocation, SeverityLevel, Spot, UserProfile } from '../types';
import {
  requestDeviceLocation,
  reverseGeocode,
  searchLocations,
  SAMPLE_CITIES,
  GeocodeSearchResult,
} from '../utils/geo';

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

  // Map Picker Refs & State
  const pickerMapContainerRef = useRef<HTMLDivElement>(null);
  const pickerMapInstanceRef = useRef<L.Map | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Search state
  const [placeQuery, setPlaceQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeSearchResult[]>([]);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      handleGetLiveLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!pickerMapContainerRef.current) return;

      if (!pickerMapInstanceRef.current) {
        const map = L.map(pickerMapContainerRef.current, {
          center: [location.lat, location.lng],
          zoom: 15,
          zoomControl: false,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const customPinIcon = L.divIcon({
          className: 'custom-spot-marker',
          html: `
            <div style="
              width: 38px;
              height: 38px;
              background: linear-gradient(135deg, #FF5722 0%, #E11D48 100%);
              border: 3px solid #ffffff;
              border-radius: 50%;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 18px rgba(225, 29, 72, 0.7);
              cursor: grab;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const marker = L.marker([location.lat, location.lng], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', async () => {
          const latLng = marker.getLatLng();
          const newAddress = await reverseGeocode(latLng.lat, latLng.lng);
          setLocation({
            lat: latLng.lat,
            lng: latLng.lng,
            address: newAddress,
            accuracyMeters: 5,
          });
        });

        map.on('click', async (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          const newAddress = await reverseGeocode(e.latlng.lat, e.latlng.lng);
          setLocation({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            address: newAddress,
            accuracyMeters: 5,
          });
        });

        pickerMarkerRef.current = marker;
        pickerMapInstanceRef.current = map;
      } else {
        pickerMapInstanceRef.current.invalidateSize();
        pickerMapInstanceRef.current.setView([location.lat, location.lng], 15);
        pickerMarkerRef.current?.setLatLng([location.lat, location.lng]);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (pickerMapInstanceRef.current && pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([location.lat, location.lng]);
      pickerMapInstanceRef.current.setView([location.lat, location.lng], 15, { animate: true });
    }
  }, [location.lat, location.lng]);

  if (!isOpen) return null;

  const handleGetLiveLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const loc = await requestDeviceLocation();
      setLocation(loc);
    } catch {
      setLocationError('Could not acquire GPS. You can drag the pin or search your address below.');
    } finally {
      setIsLocating(false);
    }
  };

  const handlePlaceSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setPlaceQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearchingPlace(false);
      return;
    }

    setIsSearchingPlace(true);
    setShowDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingPlace(false);
      }
    }, 400);
  };

  const handleSelectPlace = (place: GeocodeSearchResult) => {
    setPlaceQuery(place.display_name.split(',').slice(0, 2).join(', '));
    setShowDropdown(false);
    setLocation({
      lat: place.lat,
      lng: place.lng,
      address: place.display_name.split(',').slice(0, 3).join(','),
      accuracyMeters: 10,
    });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-modal overflow-hidden my-6 animate-in fade-in zoom-in-95 text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center font-bold text-lg shadow-xs">
              📍
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Report a Dirty Spot</h2>
              <p className="text-xs text-slate-500">
                Pin the dirty spot on the live map and upload photographic proof.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Photo Capture Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Photo of Dirty Area <span className="text-rose-500">*</span>
            </label>

            {photoUrl ? (
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                <img
                  src={photoUrl}
                  alt="Captured dirty area"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 text-xs bg-black/75 hover:bg-black/90 text-white rounded-lg font-medium backdrop-blur-xs transition-colors"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-violet-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-purple-50/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Snap with Camera or Upload Image
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Supports JPG, PNG, WebP from mobile or desktop
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
                  <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                    Or select a sample photo for testing:
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
                        className="text-left p-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-purple-50/50 hover:border-violet-300 transition-all text-xs"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-14 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[11px] font-bold text-slate-700 block truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INTERACTIVE LOCATION PICKER MAP */}
          <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Select Precise Location on Map
              </span>
              <button
                type="button"
                onClick={handleGetLiveLocation}
                disabled={isLocating}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Acquiring GPS...
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3.5 h-3.5 text-violet-600" />
                    Use Live GPS
                  </>
                )}
              </button>
            </div>

            {/* Place Search Bar */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs shadow-xs">
                {isSearchingPlace ? (
                  <Loader2 className="w-3.5 h-3.5 text-violet-600 animate-spin flex-shrink-0" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
                <input
                  type="text"
                  value={placeQuery}
                  onChange={handlePlaceSearch}
                  placeholder="Type an address or city to search..."
                  className="w-full text-xs bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Autocomplete dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-modal overflow-hidden z-30 max-h-48 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPlace(item)}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-900 border-b border-slate-100 last:border-b-0 flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Leaflet Picker Map */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
              <div ref={pickerMapContainerRef} className="w-full h-full z-0" />
              <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs flex items-center gap-1">
                <span>📍 Drag or click map to move pin</span>
              </div>
            </div>

            {/* Selected Address Display */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <p className="font-bold text-slate-900 truncate">
                {location.address || 'Locating address...'}
              </p>
              <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
              </p>
            </div>

            {locationError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {locationError}
              </p>
            )}

            {/* Quick city switcher presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-bold">Quick Presets:</span>
              {SAMPLE_CITIES.slice(0, 4).map((city) => (
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
                  className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-violet-700 hover:border-violet-300 transition-colors shadow-xs"
                >
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Spot Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Park Walkway Plastic Litter"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description & Obstacles
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what kind of trash is there, hazards, or cleanup tips..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Severity & Bounty Rewards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as SeverityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border capitalize transition-all ${
                      severity === level
                        ? level === 'high'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : level === 'medium'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Est. Waste (Kg)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={estimatedKg}
                onChange={(e) => setEstimatedKg(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Community Bounty Preview Callout */}
          <div className="bg-orange-50/80 p-4 rounded-xl border border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <div>
                <span className="text-xs font-bold text-orange-900 block">
                  Automatic Community Bounty
                </span>
                <span className="text-[11px] text-orange-700">
                  Awarded to the volunteer who submits verified proof of cleaning this spot
                </span>
              </div>
            </div>
            <span className="text-lg font-black font-mono text-orange-600">
              +{calculateBounty()} pts
            </span>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!photoUrl || !title.trim()}
              className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-btn-orange disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Publish Cleanup Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
