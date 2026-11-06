import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import type { Spot, UserProfile } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Sparkles,
  X,
  Crosshair,
  ArrowRight,
  Search,
  Layers,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { searchLocations, GeocodeSearchResult } from '../utils/geo';

interface MapViewProps {
  spots: Spot[];
  selectedSpot?: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  onCleanSpot: (spot: Spot) => void;
  currentUser: UserProfile;
}

type MapTileStyle = 'streets' | 'terrain' | 'satellite';

const TILE_PROVIDERS: Record<MapTileStyle, { url: string; maxZoom: number; attribution: string; name: string }> = {
  streets: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  },
  terrain: {
    name: 'Clean Terrain',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors, HOT',
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri',
  },
};

export const MapView: React.FC<MapViewProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  onCleanSpot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeSpot, setActiveSpot] = useState<Spot | null>(selectedSpot || null);
  const [mapFilter, setMapFilter] = useState<'all' | 'needs_cleaning' | 'cleaned'>('all');
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (selectedSpot) {
      setActiveSpot(selectedSpot);
    }
  }, [selectedSpot]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenterLat = activeSpot ? activeSpot.location.lat : spots[0]?.location.lat || 40.7829;
    const initialCenterLng = activeSpot ? activeSpot.location.lng : spots[0]?.location.lng || -73.9654;

    const map = L.map(mapContainerRef.current, {
      center: [initialCenterLat, initialCenterLng],
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    const activeTile = TILE_PROVIDERS[tileStyle];
    const tileLayer = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      maxZoom: activeTile.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile style when user selects a different one
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.remove();
    const activeTile = TILE_PROVIDERS[tileStyle];
    const newTileLayer = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      maxZoom: activeTile.maxZoom,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [tileStyle]);

  // Render Spots as Custom Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filteredSpots = spots.filter((s) => {
      if (mapFilter === 'all') return true;
      return s.status === mapFilter;
    });

    filteredSpots.forEach((spot) => {
      const isSelected = activeSpot?.id === spot.id;
      const isCleaned = spot.status === 'cleaned';

      const markerColor = isCleaned ? '#16A34A' : '#EF4444';
      const markerEmoji = isCleaned ? '✨' : '⚠️';

      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-300 ${
            isSelected ? 'scale-125 z-30' : 'hover:scale-110'
          }">
            <div style="
              background-color: ${markerColor};
              width: ${isSelected ? '38px' : '32px'};
              height: ${isSelected ? '38px' : '32px'};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              border: 3px solid white;
            ">
              <span style="transform: rotate(45deg); font-size: ${isSelected ? '16px' : '13px'};">
                ${markerEmoji}
              </span>
            </div>
            ${
              isSelected
                ? `<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-md"></div>`
                : ''
            }
          </div>
        `,
        iconSize: isSelected ? [38, 38] : [32, 32],
        iconAnchor: isSelected ? [19, 38] : [16, 32],
      });

      const marker = L.marker([spot.location.lat, spot.location.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(map);

      marker.on('click', () => {
        setActiveSpot(spot);
        onSelectSpot(spot);
        map.panTo([spot.location.lat, spot.location.lng], { animate: true });
      });

      markersRef.current.push(marker);
    });

    if (activeSpot) {
      map.panTo([activeSpot.location.lat, activeSpot.location.lng], { animate: true });
    }
  }, [spots, activeSpot, mapFilter, onSelectSpot]);

  // Handle Search Input with Debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectSearchResult = (place: GeocodeSearchResult) => {
    setSearchQuery(place.display_name.split(',').slice(0, 2).join(', '));
    setShowSearchDropdown(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userIcon = L.divIcon({
          className: 'custom-spot-marker',
          html: `
            <div class="user-location-marker">
              <div class="user-location-pulse"></div>
              <div class="user-location-dot"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        userMarkerRef.current = L.marker([latitude, longitude], {
          icon: userIcon,
          zIndexOffset: 2000,
        }).addTo(map);

        map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.2 });
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleFitAllSpots = () => {
    const map = mapInstanceRef.current;
    if (!map || spots.length === 0) return;

    const bounds = L.latLngBounds(spots.map((s) => [s.location.lat, s.location.lng]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[520px] rounded-[12px] border border-[#E2DCCD] overflow-hidden shadow-subtle bg-[#F4F1EA]">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP FLOATING CONTROLS BAR */}
      <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Filter Buttons & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pointer-events-auto">
          {/* Status Filters */}
          <div className="bg-[#FFFDF8] p-1 rounded-[6px] border border-[#E2DCCD] shadow-subtle flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapFilter('all')}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                mapFilter === 'all'
                  ? 'bg-[#1C2B24] text-white'
                  : 'text-[#6B7468] hover:text-[#1C2B24]'
              }`}
            >
              All ({spots.length})
            </button>
            <button
              type="button"
              onClick={() => setMapFilter('needs_cleaning')}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors flex items-center gap-1 ${
                mapFilter === 'needs_cleaning'
                  ? 'bg-[#B3432E] text-white'
                  : 'text-[#B3432E] hover:bg-[#F4F1EA]'
              }`}
            >
              Needs clean ({spots.filter((s) => s.status === 'needs_cleaning').length})
            </button>
            <button
              type="button"
              onClick={() => setMapFilter('cleaned')}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors flex items-center gap-1 ${
                mapFilter === 'cleaned'
                  ? 'bg-[#2F8F5B] text-white'
                  : 'text-[#2F8F5B] hover:bg-[#F4F1EA]'
              }`}
            >
              Restored ({spots.filter((s) => s.status === 'cleaned').length})
            </button>
          </div>

          {/* Place Search Bar */}
          <div className="relative min-w-[220px] sm:w-64">
            <div className="bg-[#FFFDF8] flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[#E2DCCD] shadow-subtle">
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-[#1E6B4B] animate-spin flex-shrink-0" />
              ) : (
                <Search className="w-3.5 h-3.5 text-[#6B7468] flex-shrink-0" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search any place or town..."
                className="w-full text-xs bg-transparent text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  className="text-[#6B7468] hover:text-[#1C2B24]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown search results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#FFFDF8] rounded-[6px] border border-[#E2DCCD] shadow-dropdown overflow-hidden z-30 max-h-56 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3 py-2 text-xs text-[#1C2B24] hover:bg-[#F4F1EA] border-b border-[#E2DCCD] last:border-b-0 flex items-start gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#B3432E] flex-shrink-0 mt-0.5" />
                    <span className="truncate">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map Layers & Utility Dock */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto pointer-events-auto">
          {/* Map Layer Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="bg-[#FFFDF8] px-2.5 py-1.5 rounded-[6px] border border-[#E2DCCD] shadow-subtle text-[#1C2B24] hover:bg-[#F4F1EA] transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Change map style"
            >
              <Layers className="w-3.5 h-3.5 text-[#1E6B4B]" />
              <span className="hidden sm:inline">{TILE_PROVIDERS[tileStyle].name}</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#FFFDF8] rounded-[6px] border border-[#E2DCCD] shadow-dropdown p-1 z-30">
                <span className="text-[11px] text-[#6B7468] px-2 py-1 block">
                  Map view style
                </span>
                {(['streets', 'terrain', 'satellite'] as MapTileStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      setTileStyle(style);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs font-medium transition-colors flex items-center justify-between ${
                      tileStyle === style
                        ? 'bg-[#EAF3EE] text-[#1E6B4B] font-semibold'
                        : 'text-[#1C2B24] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <span>{TILE_PROVIDERS[style].name}</span>
                    {tileStyle === style && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fit all spots */}
          <button
            type="button"
            onClick={handleFitAllSpots}
            className="bg-[#FFFDF8] p-2 rounded-[6px] border border-[#E2DCCD] shadow-subtle text-[#1C2B24] hover:bg-[#F4F1EA] transition-colors"
            title="Fit all spots on screen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            className="bg-[#FFFDF8] p-2 rounded-[6px] border border-[#E2DCCD] shadow-subtle text-[#1E6B4B] hover:bg-[#F4F1EA] transition-colors"
            title="Center on my live location"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Active Spot Preview Drawer (Bottom Left) */}
      {activeSpot && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-auto sm:w-[380px] z-20 bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] shadow-dropdown p-4 text-[#1C2B24]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span
              className={`inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${
                activeSpot.status === 'cleaned'
                  ? 'bg-[#2F8F5B] text-white'
                  : 'bg-[#B3432E] text-white'
              }`}
            >
              {activeSpot.status === 'cleaned'
                ? 'Restored'
                : `Needs clean · +${activeSpot.rewardPoints} pts`}
            </span>
            <button
              type="button"
              onClick={() => setActiveSpot(null)}
              className="p-1 text-[#6B7468] hover:text-[#1C2B24] rounded-[4px] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 items-center mb-3">
            <div className="relative w-16 h-16 rounded-[6px] overflow-hidden border border-[#E2DCCD] flex-shrink-0 bg-[#F4F1EA]">
              <img
                src={
                  activeSpot.status === 'cleaned' && activeSpot.verification
                    ? activeSpot.verification.afterPhotoUrl
                    : activeSpot.beforePhotoUrl
                }
                alt={activeSpot.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs text-[#1C2B24] truncate">{activeSpot.title}</h4>
              <p className="text-[11px] text-[#6B7468] line-clamp-2 mt-0.5">
                {activeSpot.description}
              </p>
              <p className="text-[11px] text-[#6B7468] flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-[#B3432E] flex-shrink-0" />
                <span className="truncate">{activeSpot.location.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2DCCD]">
            <button
              type="button"
              onClick={() => onSelectSpot(activeSpot)}
              className="text-xs font-medium text-[#1E6B4B] hover:underline flex items-center gap-1 transition-colors"
            >
              <span>View full card</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {activeSpot.status === 'needs_cleaning' && (
              <button
                type="button"
                onClick={() => onCleanSpot(activeSpot)}
                className="px-3 py-1.5 text-xs font-medium bg-[#1E6B4B] hover:bg-[#18553B] text-white rounded-[6px] transition-colors shadow-subtle"
              >
                Clean this spot
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
