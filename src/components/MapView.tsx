import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Spot, UserProfile } from '../types';
import { AlertTriangle, CheckCircle2, MapPin, Sparkles, X, Crosshair, ArrowRight } from 'lucide-react';

interface MapViewProps {
  spots: Spot[];
  selectedSpot?: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  onCleanSpot: (spot: Spot) => void;
  currentUser: UserProfile;
}

export const MapView: React.FC<MapViewProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  onCleanSpot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeSpot, setActiveSpot] = useState<Spot | null>(selectedSpot || null);
  const [mapFilter, setMapFilter] = useState<'all' | 'needs_cleaning' | 'cleaned'>('all');

  useEffect(() => {
    if (selectedSpot) {
      setActiveSpot(selectedSpot);
    }
  }, [selectedSpot]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const centerLat = activeSpot ? activeSpot.location.lat : spots[0]?.location.lat || 40.7829;
    const centerLng = activeSpot ? activeSpot.location.lng : spots[0]?.location.lng || -73.9654;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false, // We'll add clean controls
      scrollWheelZoom: true,
    });

    // Clean, understated CartoDB Voyager map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when spots or filter change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const visibleSpots = spots.filter((s) => {
      if (mapFilter === 'all') return true;
      return s.status === mapFilter;
    });

    visibleSpots.forEach((spot) => {
      const isCleaned = spot.status === 'cleaned';
      const isSelected = activeSpot?.id === spot.id;
      const bgColor = isCleaned ? '#2D513B' : '#BA4A2B';
      const symbol = isCleaned ? '✓' : '!';

      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            color: white;
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: ${isSelected ? '16px' : '13px'};
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          ">
            ${symbol}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([spot.location.lat, spot.location.lng], { icon: customIcon }).addTo(map);

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

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15, {
          animate: true,
        });
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] rounded-xl border border-[#E3E3DC] overflow-hidden shadow-xs">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Filter Bar */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1 bg-white/95 p-1 rounded-lg border border-[#E3E3DC] shadow-xs">
        <button
          type="button"
          onClick={() => setMapFilter('all')}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            mapFilter === 'all'
              ? 'bg-[#181A19] text-white'
              : 'text-[#535A55] hover:text-[#181A19]'
          }`}
        >
          All ({spots.length})
        </button>
        <button
          type="button"
          onClick={() => setMapFilter('needs_cleaning')}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
            mapFilter === 'needs_cleaning'
              ? 'bg-[#BA4A2B] text-white'
              : 'text-[#842D18] hover:bg-[#FDF7F5]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Needs Clean ({spots.filter((s) => s.status === 'needs_cleaning').length})
        </button>
        <button
          type="button"
          onClick={() => setMapFilter('cleaned')}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
            mapFilter === 'cleaned'
              ? 'bg-[#2D513B] text-white'
              : 'text-[#233F2E] hover:bg-[#F2F7F4]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Restored ({spots.filter((s) => s.status === 'cleaned').length})
        </button>
      </div>

      {/* GPS Locate Me Button */}
      <button
        type="button"
        onClick={handleLocateMe}
        className="absolute top-3.5 right-3.5 z-10 p-2.5 rounded-lg bg-white border border-[#E3E3DC] shadow-xs text-[#535A55] hover:text-[#181A19] hover:bg-[#F9F9F6] transition-colors"
        title="Find My Location on Map"
      >
        <Crosshair className="w-4 h-4 text-[#2D513B]" />
      </button>

      {/* Empty State Callout */}
      {spots.length === 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-white border border-[#E3E3DC] rounded-full px-4 py-2 shadow-sm text-xs text-[#535A55] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2D513B] animate-pulse"></span>
          <span>No spots pinned yet. Click <strong>"+ Report Spot at Location"</strong> above to pin one!</span>
        </div>
      )}

      {/* Active Spot Card Overlay (Bottom Drawer) */}
      {activeSpot && (
        <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-20 bg-white rounded-xl border-2 border-[#E3E3DC] shadow-2xl p-4.5 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                activeSpot.status === 'cleaned'
                  ? 'bg-[#E7EFEA] text-[#14231A] border border-[#2D513B]/20'
                  : 'bg-[#FDEEEA] text-[#842D18] border border-[#C24A2C]/20'
              }`}
            >
              {activeSpot.status === 'cleaned' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D513B]" />
                  Cleaned & Restored
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#BA4A2B]" />
                  Open Bounty: +{activeSpot.rewardPoints} pts
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => setActiveSpot(null)}
              className="p-1 text-[#7E8681] hover:text-[#181A19] rounded hover:bg-[#F2F2EC]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3.5 items-center mb-3.5">
            <img
              src={
                activeSpot.status === 'cleaned' && activeSpot.verification
                  ? activeSpot.verification.afterPhotoUrl
                  : activeSpot.beforePhotoUrl
              }
              alt={activeSpot.title}
              className="w-20 h-20 rounded-lg object-cover border border-[#E3E3DC] flex-shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-[#181A19] truncate">{activeSpot.title}</h4>
              <p className="text-xs text-[#535A55] line-clamp-2 mt-0.5 leading-relaxed">
                {activeSpot.description}
              </p>
              <p className="text-[11px] text-[#7E8681] flex items-center gap-1 mt-1 truncate font-mono">
                <MapPin className="w-3 h-3 text-[#2D513B] flex-shrink-0" />
                <span className="truncate">{activeSpot.location.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-[#F0EFEA]">
            <button
              type="button"
              onClick={() => onSelectSpot(activeSpot)}
              className="text-xs font-semibold text-[#2D513B] hover:underline flex items-center gap-1"
            >
              <span>View Full Report</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {activeSpot.status === 'needs_cleaning' && (
              <button
                type="button"
                onClick={() => onCleanSpot(activeSpot)}
                className="px-3.5 py-1.5 text-xs font-bold bg-[#2D513B] text-white rounded-md hover:bg-[#233F2E] flex items-center gap-1.5 shadow-xs hover:scale-105 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>I Cleaned This</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
