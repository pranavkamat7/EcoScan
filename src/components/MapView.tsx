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

type MapTileStyle = 'voyager' | 'dark' | 'satellite';

const TILE_PROVIDERS: Record<MapTileStyle, { url: string; maxZoom: number; attribution: string; name: string }> = {
  voyager: {
    name: 'Vibrant Streets',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri',
  },
  dark: {
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
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
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('voyager');
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

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const activeTile = TILE_PROVIDERS[tileStyle];
    const newLayer = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      maxZoom: activeTile.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [tileStyle]);

  // Update Markers when spots, filter, or activeSpot change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const visibleSpots = spots.filter((s) => {
      if (mapFilter === 'all') return true;
      return s.status === mapFilter;
    });

    visibleSpots.forEach((spot) => {
      const isCleaned = spot.status === 'cleaned';
      const isSelected = activeSpot?.id === spot.id;

      const markerHtml = isCleaned
        ? `
          <div class="map-marker-pin" style="
            width: ${isSelected ? '44px' : '36px'};
            height: ${isSelected ? '44px' : '36px'};
            background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45);
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
        `
        : `
          <div class="map-marker-pin" style="
            width: ${isSelected ? '44px' : '36px'};
            height: ${isSelected ? '44px' : '36px'};
            background: linear-gradient(135deg, #FF5722 0%, #EF4444 100%);
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        `;

      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
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
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[550px] rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP FLOATING CONTROLS BAR */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-none">
        {/* Left: Filter Buttons & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pointer-events-auto">
          {/* Status Filters */}
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mapFilter === 'all'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All ({spots.length})
            </button>
            <button
              type="button"
              onClick={() => setMapFilter('needs_cleaning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapFilter === 'needs_cleaning'
                  ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-btn-orange'
                  : 'text-orange-600 hover:bg-orange-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              Needs Clean ({spots.filter((s) => s.status === 'needs_cleaning').length})
            </button>
            <button
              type="button"
              onClick={() => setMapFilter('cleaned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapFilter === 'cleaned'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              Restored ({spots.filter((s) => s.status === 'cleaned').length})
            </button>
          </div>

          {/* Place Search Bar */}
          <div className="relative min-w-[240px] sm:w-72">
            <div className="bg-white/95 backdrop-blur-md flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-violet-600 animate-spin flex-shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search any place or city..."
                className="w-full text-xs bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown search results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-modal overflow-hidden z-30 max-h-60 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-900 border-b border-slate-100 last:border-b-0 flex items-start gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map Layers & Utility Dock */}
        <div className="flex items-center gap-2 self-end sm:self-auto pointer-events-auto">
          {/* Map Layer Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 shadow-md text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Change Map Style"
            >
              <Layers className="w-4 h-4 text-violet-600" />
              <span className="hidden sm:inline">{TILE_PROVIDERS[tileStyle].name}</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-modal p-1.5 z-30">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 py-1 block">
                  Map View Style
                </span>
                {(['voyager', 'satellite', 'dark'] as MapTileStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      setTileStyle(style);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      tileStyle === style
                        ? 'bg-purple-50 text-purple-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
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
            className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 shadow-md text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Fit All Spots on Screen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 shadow-md text-violet-600 hover:bg-slate-50 transition-colors"
            title="Center on My Live Location"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Active Spot Preview Drawer (Bottom Left) */}
      {activeSpot && (
        <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-modal p-4.5 animate-in fade-in slide-in-from-bottom-4 text-slate-900">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                activeSpot.status === 'cleaned'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}
            >
              {activeSpot.status === 'cleaned' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  Transformed & Cleaned
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  Open Bounty: +{activeSpot.rewardPoints} pts
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => setActiveSpot(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3.5 items-center mb-3.5">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 shadow-xs bg-slate-100">
              <img
                src={
                  activeSpot.status === 'cleaned' && activeSpot.verification
                    ? activeSpot.verification.afterPhotoUrl
                    : activeSpot.beforePhotoUrl
                }
                alt={activeSpot.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/80 text-white font-mono">
                {activeSpot.status === 'cleaned' ? 'Restored' : 'Littered'}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-slate-900 truncate">{activeSpot.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                {activeSpot.description}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate">{activeSpot.location.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onSelectSpot(activeSpot)}
              className="text-xs font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 transition-colors"
            >
              <span>View Full Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {activeSpot.status === 'needs_cleaning' && (
              <button
                type="button"
                onClick={() => onCleanSpot(activeSpot)}
                className="px-4 py-1.5 text-xs font-extrabold bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl flex items-center gap-1.5 shadow-btn-orange hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>I Cleaned This Spot</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
