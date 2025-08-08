import Geolocation, {
  GeoPosition,
  GeoError,
} from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { Location } from '../types';

class LocationService {
  private watchId: number | null = null;
  private listeners: ((location: Location) => void)[] = [];
  private errorListeners: ((error: string) => void)[] = [];
  private isTracking = false;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    } else if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location to provide navigation.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  }

  async getCurrentLocation(): Promise<Location | null> {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };
          resolve(location);
        },
        (error: GeoError) => {
          this.notifyErrorListeners(
            `Failed to get current location: ${error.message}`,
          );
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  startLocationTracking() {
    if (this.isTracking) return;

    this.isTracking = true;
    this.watchId = Geolocation.watchPosition(
      (position: GeoPosition) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        this.notifyListeners(location);
      },
      (error: GeoError) => {
        this.notifyErrorListeners(`Location tracking error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // Update every 5 meters
        interval: 1000, // Update every second
        fastestInterval: 500, // Fastest update interval
        showLocationDialog: true,
        forceRequestLocation: true,
      },
    );
  }

  stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  addLocationListener(listener: (location: Location) => void) {
    this.listeners.push(listener);
  }

  removeLocationListener(listener: (location: Location) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  addErrorListener(listener: (error: string) => void) {
    this.errorListeners.push(listener);
  }

  removeErrorListener(listener: (error: string) => void) {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  private notifyListeners(location: Location) {
    this.listeners.forEach(listener => listener(location));
  }

  private notifyErrorListeners(error: string) {
    this.errorListeners.forEach(listener => listener(error));
  }

  isTrackingEnabled(): boolean {
    return this.isTracking;
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
  }
}

export default new LocationService();
