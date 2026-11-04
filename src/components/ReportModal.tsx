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

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CARTO',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-modal overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 text-[#17171F]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
              📍
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#17171F]">Report Dirty Spot</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Pin an area needing cleanup and set a community bounty.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#17171F] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Photo of Dirty Area <span className="text-rose-500">*</span>
            </label>

            {photoUrl ? (
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                <img src={photoUrl} alt="Reported spot" className="w-full h-full object-cover" />
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
                <label className="flex flex-col items-center justify-center p-5 sm:p-6 border-2 border-dashed border-slate-300 hover:border-[#16A34A] rounded-xl cursor-pointer bg-slate-50 hover:bg-green-50/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <span className="text-xs font-bold text-[#17171F] text-center">
                    Snap Photo with Camera
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 text-center">
                    or choose an image from device
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
                  <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
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
                        className="text-left p-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-green-50/60 hover:border-green-300 transition-all text-xs"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-12 sm:h-14 object-cover rounded-lg mb-1"
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

          {/* Interactive Map Picker & GPS Section */}
          <div className="space-y-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
                Spot Location <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGetLiveLocation}
                disabled={isLocating}
                className="text-[11px] font-bold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-green-200 shadow-xs"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Acquiring GPS...
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3.5 h-3.5 text-[#16A34A]" />
                    Use Live GPS
                  </>
                )}
              </button>
            </div>

            {/* Place Search Bar */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs shadow-xs">
                {isSearchingPlace ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#16A34A] animate-spin flex-shrink-0" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
                <input
                  type="text"
                  value={placeQuery}
                  onChange={handlePlaceSearch}
                  placeholder="Type an address or city to search..."
                  className="w-full text-xs bg-transparent text-[#17171F] placeholder:text-slate-400 focus:outline-none"
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
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-green-50 hover:text-[#16A34A] border-b border-slate-100 last:border-b-0 flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Leaflet Picker Map */}
            <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
              <div ref={pickerMapContainerRef} className="w-full h-full z-0" />
              <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs flex items-center gap-1">
                <span>📍 Drag or click map to move pin</span>
              </div>
            </div>

            {/* Selected Address Display */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <p className="font-bold text-[#17171F] truncate">
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
                  className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#16A34A] hover:border-green-300 transition-colors shadow-xs"
                >
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Spot Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken glass & food wrappers beside playground"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-[#17171F] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:bg-white placeholder:text-slate-400 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Context
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on waste types, accessibility, gloves recommended, etc."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-[#17171F] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:bg-white placeholder:text-slate-400 resize-none min-h-[56px]"
              />
            </div>
          </div>

          {/* Severity and Est. Waste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as SeverityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all border min-h-[40px] ${
                      severity === level
                        ? level === 'high'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                          : level === 'medium'
                          ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                          : 'bg-[#16A34A] text-white border-green-700 shadow-xs'
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
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-[#17171F] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:bg-white min-h-[40px]"
              />
            </div>
          </div>

          {/* Community Bounty Preview Callout */}
          <div className="bg-green-50/80 p-4 rounded-xl border border-green-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#17171F] block">
                  Automatic Community Bounty
                </span>
                <span className="text-[11px] text-green-700">
                  Awarded to the volunteer who submits verified proof of cleaning this spot
                </span>
              </div>
            </div>
            <span className="text-lg font-black font-mono text-[#16A34A] flex-shrink-0">
              +{calculateBounty()} pts
            </span>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-[#17171F] rounded-xl hover:bg-slate-100 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!photoUrl || !title.trim()}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-extrabold bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl shadow-btn-green disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
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
