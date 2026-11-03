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
          address = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
        }

        resolve({
          lat: latitude,
          lng: longitude,
          accuracyMeters: Math.round(accuracy),
          address,
        });
      },
      (error) => {
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
 * Free accurate reverse geocoding via OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    }

    const data = await response.json();
    if (data && data.address) {
      const street =
        data.address.road ||
        data.address.pedestrian ||
        data.address.suburb ||
        data.address.neighbourhood ||
        data.address.street;
      const locality =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        data.address.state;

      if (street && locality) {
        return `${street}, ${locality}`;
      } else if (street) {
        return street;
      } else if (locality) {
        return locality;
      }
      return data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    }
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  } catch {
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  }
}

export interface GeocodeSearchResult {
  display_name: string;
  lat: number;
  lng: number;
  type?: string;
}

/**
 * Free place search via OpenStreetMap Nominatim (supports cities, streets, landmarks)
 */
export async function searchLocations(query: string): Promise<GeocodeSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&limit=5&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
    }));
  } catch {
    return [];
  }
}

/**
 * Curated preset cities and famous locations for fast testing
 */
export const SAMPLE_CITIES = [
  { name: 'Central Park, New York', lat: 40.7829, lng: -73.9654 },
  { name: 'Mission District, San Francisco', lat: 37.7599, lng: -122.4148 },
  { name: 'Hyde Park, London', lat: 51.5073, lng: -0.1657 },
  { name: 'Marine Drive, Mumbai', lat: 18.9432, lng: 72.8236 },
  { name: 'Shibuya Crossing, Tokyo', lat: 35.6595, lng: 139.7004 },
  { name: 'Friedrichshain, Berlin', lat: 52.5158, lng: 13.4543 },
];
