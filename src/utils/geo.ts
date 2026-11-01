import { GeoLocation } from '../types';

/**
 * Calculates distance between two coordinates in meters using the Haversine formula
 */
export function calculateHaversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format distance into human readable text (e.g. "45 m away", "1.4 km away")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Request real device GPS coordinates
 */
export function requestDeviceLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let address = '';
        try {
          address = await reverseGeocode(latitude, longitude);
        } catch {
          address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        resolve({
          lat: latitude,
          lng: longitude,
          accuracyMeters: Math.round(accuracy),
          address,
        });
      },
      (error) => {
        // Fallback default coordinates if user denies or in non-SSL test environment
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Free reverse geocoding via OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SpotClean-CivicApp/1.0',
      },
    });

    if (!response.ok) {
      return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    }

    const data = await response.json();
    if (data && data.address) {
      const parts = [
        data.address.road || data.address.pedestrian || data.address.suburb,
        data.address.city || data.address.town || data.address.village || data.address.county,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 2).join(',');
    }
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  } catch {
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  }
}

/**
 * Default fallback locations for desktop users or simulators
 */
export const SAMPLE_CITIES = [
  { name: 'Central Park West, New York', lat: 40.7829, lng: -73.9654 },
  { name: 'Mission District, San Francisco', lat: 37.7599, lng: -122.4148 },
  { name: 'Hyde Park, London', lat: 51.5073, lng: -0.1657 },
  { name: 'Marine Drive, Mumbai', lat: 18.9432, lng: 72.8236 },
  { name: 'Friedrichshain, Berlin', lat: 52.5158, lng: 13.4543 },
];

