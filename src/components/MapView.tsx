import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Spot, UserProfile } from '../types';
import { AlertTriangle, CheckCircle2, MapPin, Sparkles, X } from 'lucide-react';

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
  currentUser,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeSpot, setActiveSpot] = useState<Spot | null>(selectedSpot || null);

  useEffect(() => {
    if (selectedSpot) {
      setActiveSpot(selectedSpot);
    }
  }, [selectedSpot]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center (Central Park NYC or first spot)
    const centerLat = activeSpot ? activeSpot.location.lat : spots[0]?.location.lat || 40.7829;
    const centerLng = activeSpot ? activeSpot.location.lng : spots[0]?.location.lng || -73.9654;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // 100% Free OpenStreetMap CartoDB Positron / OSM Standard tiles (understated and non-glossy!)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when spots change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      const isCleaned = spot.status === 'cleaned';
      const bgColor = isCleaned ? '#2D513B' : '#BA4A2B';
      const symbol = isCleaned ? '✓' : '!';

      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${symbol}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([spot.location.lat, spot.location.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveSpot(spot);
        onSelectSpot(spot);
        map.panTo([spot.location.lat, spot.location.lng]);
      });

      markersRef.current.push(marker);
    });

    if (activeSpot) {
      map.panTo([activeSpot.location.lat, activeSpot.location.lng]);
    }
  }, [spots, activeSpot, onSelectSpot]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[460px] rounded-lg border border-[#E3E3DC] overflow-hidden shadow-sm">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Legend / Stats */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-none border border-[#E3E3DC] rounded-md p-2.5 shadow-sm text-xs space-y-1.5 hidden sm:block">
        <div className="font-semibold text-[#181A19] text-[11px] uppercase tracking-wider">
          Map Legend
        </div>
        <div className="flex items-center gap-2 text-[#535A55]">
          <span className="w-3 h-3 rounded-full bg-[#BA4A2B] border border-white flex-shrink-0"></span>
          <span>Needs Cleaning ({spots.filter((s) => s.status === 'needs_cleaning').length})</span>
        </div>
        <div className="flex items-center gap-2 text-[#535A55]">
          <span className="w-3 h-3 rounded-full bg-[#2D513B] border border-white flex-shrink-0"></span>
          <span>Cleaned & Restored ({spots.filter((s) => s.status === 'cleaned').length})</span>
        </div>
      </div>

      {/* Active Spot Card Overlay (Bottom / Drawer) */}
      {activeSpot && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-20 bg-white rounded-lg border border-[#E3E3DC] shadow-modal p-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                activeSpot.status === 'cleaned'
                  ? 'bg-[#E7EFEA] text-[#233F2E]'
                  : 'bg-[#FDEEEA] text-[#842D18]'
              }`}
            >
              {activeSpot.status === 'cleaned' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#2D513B]" />
                  Cleaned
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-[#BA4A2B]" />
                  Open Bounty: +{activeSpot.rewardPoints} pts
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => setActiveSpot(null)}
              className="p-1 text-[#7E8681] hover:text-[#181A19] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 items-center mb-3">
            <img
              src={
                activeSpot.status === 'cleaned' && activeSpot.verification
                  ? activeSpot.verification.afterPhotoUrl
                  : activeSpot.beforePhotoUrl
              }
              alt={activeSpot.title}
              className="w-16 h-16 rounded object-cover border border-[#E3E3DC] flex-shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-[#181A19] truncate">{activeSpot.title}</h4>
              <p className="text-xs text-[#535A55] line-clamp-1">{activeSpot.description}</p>
              <p className="text-[11px] text-[#7E8681] flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-[#2D513B] flex-shrink-0" />
                <span className="truncate">{activeSpot.location.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#F0EFEA]">
            <button
              type="button"
              onClick={() => onSelectSpot(activeSpot)}
              className="text-xs font-medium text-[#2D513B] hover:underline"
            >
              View Full Post →
            </button>

            {activeSpot.status === 'needs_cleaning' && (
              <button
                type="button"
                onClick={() => onCleanSpot(activeSpot)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#2D513B] text-white rounded hover:bg-[#233F2E] flex items-center gap-1 shadow-sm"
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

