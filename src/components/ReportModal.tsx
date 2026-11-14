import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Camera,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle,
  Search,
  Crosshair,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import { GeoLocation, SeverityLevel, Spot, UserProfile } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import {
  requestDeviceLocation,
  reverseGeocode,
  searchLocations,
  SAMPLE_CITIES,
  GeocodeSearchResult,
} from '../utils/geo';
import {
  Modal,
  ProgressBar,
  Input,
  Textarea,
  Button,
  Badge,
} from './ui';

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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [tagsInput, setTagsInput] = useState('Litter, PublicSpace');
  const [estimatedKg, setEstimatedKg] = useState<number>(10);

  const [location, setLocation] = useState<GeoLocation>({
    lat: 15.2832,
    lng: 73.9862,
    address: 'Margao, Goa, India',
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
      setStep(1);
      handleGetLiveLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== 2) return;

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

        const markerIcon = L.divIcon({
          className: 'custom-spot-marker',
          html: `
            <div style="background-color: #E0533C; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(15,41,30,0.3); border: 2px solid white;">
              <span style="transform: rotate(45deg); font-size: 13px;">⚠️</span>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([location.lat, location.lng], {
          icon: markerIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', async () => {
          const latLng = marker.getLatLng();
          const addr = await reverseGeocode(latLng.lat, latLng.lng);
          setLocation({
            lat: latLng.lat,
            lng: latLng.lng,
            address: addr,
            accuracyMeters: 5,
          });
        });

        map.on('click', async (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng);
          setLocation({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            address: addr,
            accuracyMeters: 5,
          });
        });

        pickerMapInstanceRef.current = map;
        pickerMarkerRef.current = marker;
      } else {
        pickerMapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, step, location.lat, location.lng]);

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
      setLocationError(err.message || 'Could not fetch device GPS. Please pick a location manually.');
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
    if (pickerMapInstanceRef.current && pickerMarkerRef.current) {
      pickerMapInstanceRef.current.flyTo([place.lat, place.lng], 15);
      pickerMarkerRef.current.setLatLng([place.lat, place.lng]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingPhoto(true);
        // Automatically optimize photo to lightweight crisp JPEG (<100KB)
        // so it reliably syncs to Firestore cloud without size errors
        const compressed = await compressImageFile(file, 1200, 0.75);
        setPhotoUrl(compressed);
      } catch (err) {
        console.warn('Compression fallback to standard read:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotoUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressingPhoto(false);
      }
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!photoUrl || !title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      beforePhotoUrl: photoUrl,
      location,
      severity,
      rewardPoints: calculateBounty(),
      estimatedWasteKg: estimatedKg,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterAvatar: currentUser.avatar || '',
      tags: tags.length ? tags : ['Litter'],
    });

    onClose();
  };

  const stepProgress = step === 1 ? 33 : step === 2 ? 66 : 100;

  // Fixed bottom action bar - Always pinned and responsive across all devices
  const modalFooter = (
    <div className="w-full">
      {step === 1 && (
        <div className="flex items-center justify-end w-full">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            disabled={!photoUrl || isCompressingPhoto}
            iconRight={<ArrowRight className="w-4 h-4" />}
            onClick={() => setStep(2)}
          >
            Next: Pin location
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex items-center justify-between gap-2.5 w-full">
          <Button
            variant="ghost"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setStep(1)}
          >
            Back
          </Button>

          <Button
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial"
            iconRight={<ArrowRight className="w-4 h-4" />}
            onClick={() => setStep(3)}
          >
            Next: Spot details
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex items-center justify-between gap-2.5 w-full">
          <Button
            type="button"
            variant="ghost"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setStep(2)}
          >
            Back
          </Button>

          <Button
            form="report-spot-form"
            type="submit"
            variant="primary"
            size="md"
            disabled={!title.trim()}
            onClick={(e) => {
              if (title.trim()) handleSubmit(e);
            }}
            icon={<Sparkles className="w-4 h-4 text-lime" />}
            className="flex-1 sm:flex-initial shadow-sm"
          >
            <span className="hidden sm:inline">Submit dirty spot & launch bounty</span>
            <span className="sm:hidden">Submit & launch</span>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report a Littered Spot"
      description={`Step ${step} of 3: ${
        step === 1
          ? 'Upload initial photo proof'
          : step === 2
          ? 'Pin precise location on map'
          : 'Spot description & estimated waste'
      }`}
      size="lg"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* Step Progress Bar */}
        <ProgressBar
          value={stepProgress}
          variant="lime"
          valueLabel={`Step ${step} / 3`}
        />

        {/* STEP 1: PHOTO CAPTURE & UPLOAD */}
        {step === 1 && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-navy">
                Take or upload dirty spot photo
              </label>

              {photoUrl ? (
                <div className="relative w-full aspect-[16/10] max-h-56 rounded-sm overflow-hidden border border-line group bg-navy-50/50">
                  <img
                    src={photoUrl}
                    alt="Preview of dirty spot"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-navy/80 hover:bg-navy text-white text-xs rounded-sm transition-colors shadow-sm"
                  >
                    Replace photo
                  </button>
                  <div className="absolute bottom-2.5 left-2.5">
                    <Badge variant="coral" size="sm">
                      Before Proof
                    </Badge>
                  </div>
                </div>
              ) : isCompressingPhoto ? (
                <div className="flex flex-col items-center justify-center w-full aspect-[16/10] max-h-56 border border-line rounded-sm bg-navy-50/50 p-6 text-center">
                  <Loader2 className="w-8 h-8 text-emerald animate-spin mb-3" />
                  <p className="text-sm font-semibold text-navy">
                    Optimizing photo for cloud feed...
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Compressing image payload to ensure instant syncing
                  </p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-[16/10] max-h-52 border-2 border-dashed border-line hover:border-emerald rounded-sm cursor-pointer bg-navy-50/50 hover:bg-navy-50 transition-colors p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald text-white flex items-center justify-center mb-2 shadow-sm">
                    <Camera className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <p className="text-sm font-semibold text-navy">
                    Snap a photo or browse device
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    JPEG, PNG, WebP up to 10MB
                  </p>
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

            {/* Quick Photo URL or Presets */}
            <div className="pt-2 border-t border-line space-y-1.5">
              <span className="text-xs font-medium text-muted block">
                Or pick a quick demo mess to test:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_MESSES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(preset.url);
                      setTitle(preset.title);
                      setSeverity(preset.severity);
                    }}
                    className="p-1.5 text-left rounded-sm border border-line bg-white hover:bg-navy-50 transition-colors text-xs space-y-1"
                  >
                    <div className="h-12 sm:h-14 rounded-sm overflow-hidden bg-navy-50">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-semibold text-navy truncate text-[10px] sm:text-[11px]">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION PICKER */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            {/* Search and GPS Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search address or landmark..."
                  value={placeQuery}
                  onChange={handlePlaceSearch}
                  startIcon={<Search className="w-3.5 h-3.5 text-muted" />}
                />
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-sm shadow-md overflow-hidden z-20 max-h-40 overflow-y-auto">
                    {searchResults.map((place, idx) => (
                      <button
                        key={`${place.lat}-${place.lng}-${idx}`}
                        type="button"
                        onClick={() => handleSelectPlace(place)}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-navy-50 border-b border-line text-navy truncate"
                      >
                        {place.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="secondary"
                size="md"
                onClick={handleGetLiveLocation}
                isLoading={isLocating}
                icon={<Crosshair className="w-4 h-4 text-emerald" />}
              >
                Use GPS
              </Button>
            </div>

            {/* Interactive Leaflet Pin Picker */}
            <div className="relative w-full h-48 sm:h-56 rounded-sm border border-line overflow-hidden">
              <div ref={pickerMapContainerRef} className="w-full h-full z-0" />
            </div>

            <div className="p-2.5 sm:p-3 rounded-sm bg-navy-50/70 border border-line flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
              <div className="text-left text-xs min-w-0">
                <span className="font-semibold text-navy block text-[11px]">Selected Coordinates:</span>
                <p className="text-muted truncate text-xs">{location.address}</p>
                <span className="text-[10px] text-muted/70 tabular-nums">
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS & BOUNTY SUBMIT */}
        {step === 3 && (
          <form id="report-spot-form" onSubmit={handleSubmit} className="space-y-3 animate-fadeIn text-left">
            <Input
              label="Spot title *"
              placeholder="e.g. Broken beer bottles & fast food bags along trail"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="Description (optional)"
              placeholder="Provide details about accessibility, hazards, or cleanup tips..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Severity level
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['low', 'medium', 'high'] as SeverityLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-1.5 sm:py-2 text-xs rounded-sm border transition-colors select-none capitalize ${
                        severity === lvl
                          ? 'bg-emerald text-white border-emerald font-semibold shadow-xs'
                          : 'bg-white text-muted border-line hover:text-navy hover:bg-navy-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Estimated waste (kg)
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={estimatedKg}
                  onChange={(e) => setEstimatedKg(Number(e.target.value) || 1)}
                  className="w-full h-8 sm:h-9 rounded-sm bg-white text-navy text-xs sm:text-sm px-3 border border-line outline-none focus:ring-2 focus:ring-emerald focus:border-emerald tabular-nums"
                />
              </div>
            </div>

            {/* Combined Civic Bounty & EcoScaners 48h Team Guarantee Banner (Single Slim Row) */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-50/80 border border-emerald-300 flex items-center justify-between gap-2.5 text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-heading font-bold text-navy text-xs">
                      Civic Cleanup Bounty
                    </span>
                    <span className="inline-flex items-center text-[9px] font-extrabold text-emerald-950 bg-emerald-200/90 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      48h Team SLA
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-tight truncate">
                    Community clean or EcoScaners Team deploys in 48h
                  </p>
                </div>
              </div>
              <Badge variant="points" size="md" className="flex-shrink-0 shadow-xs">
                +{calculateBounty()} pts
              </Badge>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
