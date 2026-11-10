import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import type { Spot, UserProfile } from '../types';
import {
  MapPin,
  Sparkles,
  X,
  Crosshair,
  Search,
  Layers,
  RotateCcw,
  Loader2,
  Plus,
} from 'lucide-react';
import { searchLocations, GeocodeSearchResult } from '../utils/geo';
import {
  PageHeader,
  Card,
  Button,
  IconButton,
  Badge,
  Avatar,
} from './ui';

interface MapViewProps {
  spots: Spot[];
  selectedSpot?: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  onCleanSpot: (spot: Spot) => void;
  currentUser: UserProfile;
  onOpenReportModal?: () => void;
}

type MapTileStyle = 'streets' | 'terrain' | 'satellite';

const TILE_PROVIDERS: Record<
  MapTileStyle,
  { url: string; maxZoom: number; attribution: string; name: string }
> = {
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
  onOpenReportModal,
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] =
      spots.length > 0
        ? [spots[0].location.lat, spots[0].location.lng]
        : [15.2832, 73.9862];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

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

  // Update Tile Layer
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

  // Render Spots as Custom Markers (Coral for needs clean, Emerald for restored)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filteredSpots = spots.filter((s) => {
      if (mapFilter === 'all') return true;
      return s.status === mapFilter;
    });

    filteredSpots.forEach((spot) => {
      const isSelected = activeSpot?.id === spot.id;
      const isCleaned = spot.status === 'cleaned';

      // Brand mapping: Coral #F0533D for Needs Clean, Emerald #00B86B for Restored
      const markerColor = isCleaned ? '#00B86B' : '#F0533D';
      const markerEmoji = isCleaned ? '✨' : '⚠️';

      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-180 ${
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
              box-shadow: 0 4px 12px rgba(23, 37, 54, 0.25);
              border: 2px solid white;
            ">
              <span style="transform: rotate(45deg); font-size: ${isSelected ? '15px' : '12px'};">
                ${markerEmoji}
              </span>
            </div>
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
  }, [spots, mapFilter, activeSpot, onSelectSpot]);

  // Place Search
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
            <div class="w-4 h-4 rounded-full bg-emerald border-2 border-white shadow-md ring-4 ring-emerald/20 animate-pulse"></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
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

  const needsCleanCount = spots.filter((s) => s.status === 'needs_cleaning').length;
  const restoredCount = spots.filter((s) => s.status === 'cleaned').length;

  return (
    <div className="space-y-6">
      {/* 1. SHARED PAGE HEADER */}
      <PageHeader
        title="Interactive Civic Clean Map"
        description="Explore littered spots and restored transformations pinned by community volunteers across your city."
        action={
          onOpenReportModal && (
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
              onClick={onOpenReportModal}
            >
              Report dirty spot
            </Button>
          )
        }
      />

      {/* 2. MAP IN A 20px-RADIUS CONTAINER */}
      <Card
        variant="default"
        className="p-0 overflow-hidden relative h-[640px] shadow-sm border border-line"
      >
        {/* Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* TOP FLOATING CONTROLS BAR */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-none">
          {/* Left: Filter Chips & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pointer-events-auto">
            {/* Filter Chips Container (Solid White, Crisp & High-Contrast) */}
            <div className="bg-white p-1.5 rounded-sm border border-line shadow-sm flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMapFilter('all')}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors select-none ${
                  mapFilter === 'all'
                    ? 'bg-navy text-white'
                    : 'text-muted hover:text-navy'
                }`}
              >
                All ({spots.length})
              </button>

              <button
                type="button"
                onClick={() => setMapFilter('needs_cleaning')}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors flex items-center gap-1.5 select-none ${
                  mapFilter === 'needs_cleaning'
                    ? 'bg-coral text-white'
                    : 'text-coral hover:bg-coral-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-coral inline-block" />
                Needs clean ({needsCleanCount})
              </button>

              <button
                type="button"
                onClick={() => setMapFilter('cleaned')}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors flex items-center gap-1.5 select-none ${
                  mapFilter === 'cleaned'
                    ? 'bg-emerald text-white'
                    : 'text-emerald hover:bg-emerald-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald inline-block" />
                Restored ({restoredCount})
              </button>
            </div>

            {/* Place Search Bar */}
            <div className="relative min-w-[220px] sm:w-64">
              <div className="bg-white flex items-center gap-2 px-3.5 py-2 rounded-sm border border-line shadow-sm">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald animate-spin flex-shrink-0" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchDropdown(true);
                  }}
                  placeholder="Search city, locality..."
                  className="bg-transparent border-none outline-none text-xs text-navy placeholder:text-muted/60 w-full font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="text-muted hover:text-navy text-xs p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Geocode Search Results Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-line rounded-sm shadow-md overflow-hidden z-30 max-h-52 overflow-y-auto">
                  {searchResults.map((place, idx) => (
                    <button
                      key={`${place.lat}-${place.lng}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSearchResult(place)}
                      className="w-full px-3.5 py-2 text-left text-xs hover:bg-navy-50 border-b border-line/60 last:border-b-0 flex items-start gap-2 text-navy transition-colors font-medium"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-tight">
                        {place.display_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Map Utility Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto self-end sm:self-auto">
            {/* Layer switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="h-9 px-3 bg-white hover:bg-navy-50 border border-line rounded-sm shadow-sm text-xs font-semibold text-navy flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald" />
                <span>{TILE_PROVIDERS[tileStyle].name}</span>
              </button>

              {showLayerMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLayerMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-line rounded-sm shadow-md py-1 z-20">
                    {(Object.keys(TILE_PROVIDERS) as MapTileStyle[]).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          setTileStyle(style);
                          setShowLayerMenu(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between font-medium ${
                          tileStyle === style
                            ? 'font-bold text-emerald bg-emerald-50'
                            : 'text-navy hover:bg-navy-50'
                        }`}
                      >
                        <span>{TILE_PROVIDERS[style].name}</span>
                        {tileStyle === style && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Fit all spots */}
            <IconButton
              label="Fit all cleanup spots in view"
              size="sm"
              variant="secondary"
              onClick={handleFitAllSpots}
              className="bg-white shadow-sm border border-line"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </IconButton>

            {/* Locate me */}
            <IconButton
              label="Center on my location"
              size="sm"
              variant="secondary"
              onClick={handleLocateMe}
              className="bg-white shadow-sm border border-line"
            >
              <Crosshair className="w-3.5 h-3.5 text-emerald" />
            </IconButton>
          </div>
        </div>

        {/* BOTTOM SHEET / SIDE PANEL PREVIEW (20px Card style) */}
        {activeSpot && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 pointer-events-auto animate-slideUp">
            <Card
              variant="default"
              className="p-4 sm:p-5 shadow-modal border-line-strong relative"
            >
              <IconButton
                label="Close preview"
                size="sm"
                variant="ghost"
                onClick={() => setActiveSpot(null)}
                className="absolute top-3 right-3 text-muted hover:text-navy"
              >
                <X className="w-3.5 h-3.5" />
              </IconButton>

              <div className="space-y-3 text-left">
                {/* Status + Points */}
                <div className="flex items-center gap-2">
                  {activeSpot.status === 'cleaned' ? (
                    <Badge variant="restored" size="sm">
                      Restored & verified
                    </Badge>
                  ) : (
                    <Badge variant="coral" size="sm">
                      Needs clean
                    </Badge>
                  )}
                  <Badge variant="points" size="sm">
                    +{activeSpot.rewardPoints} pts
                  </Badge>
                </div>

                {/* Photo Preview */}
                <div className="relative w-full h-36 rounded-sm overflow-hidden bg-navy-100 border border-line">
                  <img
                    src={
                      activeSpot.status === 'cleaned' && activeSpot.verification
                        ? activeSpot.verification.afterPhotoUrl
                        : activeSpot.beforePhotoUrl
                    }
                    alt={activeSpot.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-sm bg-navy/80">
                      {activeSpot.status === 'cleaned' ? 'After Proof' : 'Before Photo'}
                    </span>
                  </div>
                </div>

                {/* Spot Details */}
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-base text-navy line-clamp-1">
                    {activeSpot.title}
                  </h4>
                  <p className="text-xs text-muted truncate flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-emerald flex-shrink-0" />
                    <span>{activeSpot.location.address}</span>
                  </p>
                </div>

                {/* Action Button */}
                {activeSpot.status === 'needs_cleaning' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    icon={<Sparkles className="w-3.5 h-3.5 text-lime" />}
                    onClick={() => onCleanSpot(activeSpot)}
                  >
                    Clean this spot & earn +{activeSpot.rewardPoints} pts
                  </Button>
                ) : (
                  <div className="pt-2 flex items-center justify-between text-xs text-muted border-t border-line">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Avatar
                        src={activeSpot.verification?.cleanerAvatar}
                        name={activeSpot.verification?.cleanerName}
                        size="xs"
                      />
                      <span>By {activeSpot.verification?.cleanerName}</span>
                    </span>
                    <span className="text-emerald font-bold">Restored</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};
