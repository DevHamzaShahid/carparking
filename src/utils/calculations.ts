import { Location, FOVCone } from '../types';

// Earth's radius in meters
const EARTH_RADIUS = 6371000;

/**
 * Calculate the distance between two points using the Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
};

/**
 * Calculate the bearing between two points
 */
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return bearing;
};

/**
 * Interpolate between two headings, handling the 0/360 degree boundary
 */
export const interpolateHeading = (
  heading1: number,
  heading2: number,
  factor: number,
): number => {
  let diff = heading2 - heading1;

  // Handle the 0/360 degree boundary
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  const interpolated = heading1 + diff * factor;
  return (interpolated + 360) % 360;
};

/**
 * Calculate the midpoint between two locations
 */
export const calculateMidpoint = (loc1: Location, loc2: Location): Location => {
  const lat1 = (loc1.latitude * Math.PI) / 180;
  const lon1 = (loc1.longitude * Math.PI) / 180;
  const lat2 = (loc2.latitude * Math.PI) / 180;
  const lon2 = (loc2.longitude * Math.PI) / 180;

  const Bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
  const By = Math.cos(lat2) * Math.sin(lon2 - lon1);

  const midLat = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By),
  );

  const midLon = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

  return {
    latitude: (midLat * 180) / Math.PI,
    longitude: (midLon * 180) / Math.PI,
  };
};

/**
 * Calculate a point at a given distance and bearing from a starting point
 */
export const calculateDestinationPoint = (
  startLat: number,
  startLon: number,
  distance: number,
  bearing: number,
): Location => {
  const angularDistance = distance / EARTH_RADIUS;
  const bearingRad = (bearing * Math.PI) / 180;
  const lat1 = (startLat * Math.PI) / 180;
  const lon1 = (startLon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad),
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lon2 * 180) / Math.PI,
  };
};

/**
 * Calculate the field of view cone for a given location and heading
 */
export const calculateFOVCone = (
  center: Location,
  heading: number,
  angle: number = 60, // Default 60-degree FOV
  distance: number = 100, // Default 100 meters
): FOVCone => {
  return {
    center,
    heading,
    angle,
    distance,
  };
};

/**
 * Check if a point is within the field of view cone
 */
export const isPointInFOV = (cone: FOVCone, point: Location): boolean => {
  const bearing = calculateBearing(
    cone.center.latitude,
    cone.center.longitude,
    point.latitude,
    point.longitude,
  );

  const distance = calculateDistance(
    cone.center.latitude,
    cone.center.longitude,
    point.latitude,
    point.longitude,
  );

  // Check if point is within distance
  if (distance > cone.distance) {
    return false;
  }

  // Check if point is within angle
  const angleDiff = Math.abs(bearing - cone.heading);
  const normalizedAngleDiff = Math.min(angleDiff, 360 - angleDiff);

  return normalizedAngleDiff <= cone.angle / 2;
};

/**
 * Smooth heading transition using exponential smoothing
 */
export const smoothHeading = (
  currentHeading: number,
  targetHeading: number,
  smoothingFactor: number = 0.1,
): number => {
  return interpolateHeading(currentHeading, targetHeading, smoothingFactor);
};

/**
 * Calculate the optimal camera zoom level based on distance
 */
export const calculateOptimalZoom = (distance: number): number => {
  // Zoom levels: 1 (world) to 20 (building)
  if (distance > 50000) return 10; // 50km+
  if (distance > 10000) return 12; // 10km+
  if (distance > 5000) return 14; // 5km+
  if (distance > 1000) return 16; // 1km+
  if (distance > 100) return 18; // 100m+
  return 20; // <100m
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else if (meters < 10000) {
    return `${(meters / 1000).toFixed(1)}km`;
  } else {
    return `${Math.round(meters / 1000)}km`;
  }
};

/**
 * Format time for display
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
