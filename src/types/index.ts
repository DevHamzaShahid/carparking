export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface SensorData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  magnetometer: {
    x: number;
    y: number;
    z: number;
  };
}

export interface MapCamera {
  center: Location;
  pitch: number;
  heading: number;
  zoom: number;
  altitude?: number;
}

export interface NavigationState {
  isNavigating: boolean;
  destination?: Location;
  route?: RoutePoint[];
  currentStep?: number;
  totalSteps?: number;
  estimatedTime?: number;
  estimatedDistance?: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  heading?: number;
  instruction?: string;
  distance?: number;
}

export interface CompassState {
  heading: number;
  isCalibrated: boolean;
  accuracy: number;
}

export interface MapState {
  camera: MapCamera;
  userLocation: Location | null;
  compass: CompassState;
  navigation: NavigationState;
  isFollowingUser: boolean;
  mapType: 'standard' | 'satellite' | 'hybrid';
}

export interface FOVCone {
  center: Location;
  heading: number;
  angle: number;
  distance: number;
}
