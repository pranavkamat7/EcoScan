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
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const customPin = L.divIcon({
          className: 'custom-spot-marker',
          html: `
            <div style="background-color: #EF4444; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 3px solid white;">
              <span style="transform: rotate(45deg); color: white; font-size: 15px;">📍</span>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([location.lat, location.lng], {
          draggable: true,
          icon: customPin,
        }).addTo(map);

        marker.on('dragend', async (e: any) => {
          const latlng = e.target.getLatLng();
          const lat = latlng.lat;
          const lng = latlng.lng;
          try {
            const addr = await reverseGeocode(lat, lng);
            setLocation({ lat, lng, address: addr, accuracyMeters: 5 });
          } catch {
            setLocation((prev) => ({ ...prev, lat, lng }));
          }
        });

        map.on('click', async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          try {
            const addr = await reverseGeocode(lat, lng);
            setLocation({ lat, lng, address: addr, accuracyMeters: 5 });
          } catch {
            setLocation((prev) => ({ ...prev, lat, lng }));
          }
        });

        pickerMapInstanceRef.current = map;
        pickerMarkerRef.current = marker;
      } else {
        pickerMapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Keep marker in sync with state
  useEffect(() => {
    if (pickerMarkerRef.current && pickerMapInstanceRef.current) {
      pickerMarkerRef.current.setLatLng([location.lat, location.lng]);
      pickerMapInstanceRef.current.setView([location.lat, location.lng], 15);
    }
  }, [location.lat, location.lng]);

  const handleGetLiveLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const loc = await requestDeviceLocation();
      setLocation(loc);
      if (pickerMapInstanceRef.current && pickerMarkerRef.current) {
        pickerMapInstanceRef.current.setView([loc.lat, loc.lng], 15);
        pickerMarkerRef.current.setLatLng([loc.lat, loc.lng]);
      }
    } catch (err: any) {
      setLocationError(err.message || 'Could not fetch device GPS. Please click on map to position.');
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
    setLocation({
      lat: place.lat,
      lng: place.lng,
      address: place.display_name,
      accuracyMeters: 10,
    });
    setPlaceQuery('');
    setShowDropdown(false);
    if (pickerMapInstanceRef.current) {
      pickerMapInstanceRef.current.flyTo([place.lat, place.lng], 15);
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

  const calculateBounty = (): number => {
    switch (severity) {
      case 'high':
        return 350;
      case 'medium':
        return 200;
      case 'low':
      default:
        return 100;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const bounty = calculateBounty();

    onSubmit({
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterAvatar: currentUser.avatar,
      title: title.trim(),
      description: description.trim() || 'Civic spot requiring community cleanup.',
      beforePhotoUrl: photoUrl,
      location,
      severity,
      rewardPoints: bounty,
      tags: tags.length > 0 ? tags : ['CivicSpot'],
      estimatedWasteKg: estimatedKg,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C2B24]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] shadow-modal overflow-hidden my-4 sm:my-6 text-[#1C2B24]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E2DCCD] bg-[#F4F1EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#B3432E] text-white flex items-center justify-center font-bold text-sm shadow-subtle flex-shrink-0">
              📍
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#1C2B24]">Report a dirty spot</h2>
              <p className="text-xs text-[#6B7468]">
                Pin a littered area needing cleanup and set a community bounty.
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
          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#1C2B24] mb-1.5">
              Photo of dirty area <span className="text-[#B3432E]">*</span>
            </label>

            {photoUrl ? (
              <div className="relative aspect-[16/10] rounded-[6px] overflow-hidden border border-[#E2DCCD] bg-[#F4F1EA]">
                <img src={photoUrl} alt="Reported spot" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
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
                    Take photo with camera
                  </span>
                  <span className="text-[11px] text-[#6B7468] text-center">
                    or select an image from your device
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Sample mess presets */}
                <div className="pt-1">
                  <span className="text-[11px] text-[#6B7468] block mb-1">
                    Or select a sample dirty spot for testing:
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

          {/* Interactive Map Picker & GPS Section */}
          <div className="space-y-2.5 bg-[#F4F1EA] p-3.5 rounded-[6px] border border-[#E2DCCD]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1C2B24] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1E6B4B]" />
                Spot location <span className="text-[#B3432E]">*</span>
              </label>
              <button
                type="button"
                onClick={handleGetLiveLocation}
                disabled={isLocating}
                className="text-[11px] font-medium text-[#1E6B4B] hover:underline flex items-center gap-1"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Finding GPS...
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3 h-3 text-[#1E6B4B]" />
                    Use live GPS
                  </>
                )}
              </button>
            </div>

            {/* Place Search Bar */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-[#FFFDF8] px-3 py-1.5 rounded-[6px] border border-[#E2DCCD] text-xs">
                {isSearchingPlace ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#1E6B4B] animate-spin flex-shrink-0" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-[#6B7468] flex-shrink-0" />
                )}
                <input
                  type="text"
                  value={placeQuery}
                  onChange={handlePlaceSearch}
                  placeholder="Type an address or city to search..."
                  className="w-full text-xs bg-transparent text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none"
                />
              </div>

              {/* Autocomplete dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#FFFDF8] rounded-[6px] border border-[#E2DCCD] shadow-dropdown overflow-hidden z-30 max-h-48 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPlace(item)}
                      className="w-full text-left px-3 py-2 text-xs text-[#1C2B24] hover:bg-[#F4F1EA] border-b border-[#E2DCCD] last:border-b-0 flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#B3432E] flex-shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Leaflet Picker Map */}
            <div className="relative w-full h-40 rounded-[6px] overflow-hidden border border-[#E2DCCD] bg-[#FFFDF8]">
              <div ref={pickerMapContainerRef} className="w-full h-full z-0" />
              <div className="absolute top-2 left-2 z-10 bg-[#FFFDF8]/90 px-2 py-0.5 rounded-[4px] border border-[#E2DCCD] text-[10px] text-[#1C2B24]">
                📍 Drag or click map to move pin
              </div>
            </div>

            {/* Selected Address Display */}
            <div className="bg-[#FFFDF8] p-2.5 rounded-[6px] border border-[#E2DCCD] text-xs">
              <p className="font-medium text-[#1C2B24] truncate">
                {location.address || 'Locating address...'}
              </p>
              <p className="text-[11px] text-[#6B7468] tabular-nums mt-0.5">
                Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
              </p>
            </div>

            {locationError && (
              <p className="text-xs text-[#B3432E] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {locationError}
              </p>
            )}

            {/* Quick city switcher presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] text-[#6B7468]">Sample cities:</span>
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
                  className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] hover:border-[#1E6B4B] transition-colors"
                >
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                Spot title <span className="text-[#B3432E]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken glass & wrappers beside riverside path"
                className="w-full px-3 py-2 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none focus:border-[#1E6B4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                Description / Details
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on types of litter, gloves recommended, accessibility..."
                className="w-full px-3 py-2 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none focus:border-[#1E6B4B] resize-none"
              />
            </div>
          </div>

          {/* Severity and Est. Waste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                Severity level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as SeverityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-[4px] capitalize transition-colors border ${
                      severity === level
                        ? level === 'high'
                          ? 'bg-[#B3432E] text-white border-[#B3432E]'
                          : level === 'medium'
                          ? 'bg-[#D9822B] text-white border-[#D9822B]'
                          : 'bg-[#1E6B4B] text-white border-[#1E6B4B]'
                        : 'bg-[#FFFDF8] text-[#6B7468] border-[#E2DCCD] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                Estimated waste (kg)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={estimatedKg}
                onChange={(e) => setEstimatedKg(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] tabular-nums focus:outline-none focus:border-[#1E6B4B]"
              />
            </div>
          </div>

          {/* Community Bounty Preview Callout */}
          <div className="bg-[#EAF3EE] p-3 rounded-[6px] border border-[#E2DCCD] flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-[#1C2B24] block">
                Automatic civic bounty
              </span>
              <span className="text-[11px] text-[#6B7468]">
                Awarded to whichever neighbour submits verified photo proof of cleaning this spot
              </span>
            </div>
            <span className="font-semibold text-sm text-[#1E6B4B] tabular-nums flex-shrink-0">
              +{calculateBounty()} pts
            </span>
          </div>

          {/* Submit Action */}
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
              disabled={!photoUrl || !title.trim()}
              className="px-4 py-2 text-xs font-medium bg-[#1E6B4B] hover:bg-[#18553B] text-white rounded-[6px] disabled:opacity-40 transition-colors shadow-subtle flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Publish spot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
