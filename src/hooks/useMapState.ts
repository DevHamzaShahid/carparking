import { useState, useCallback, useEffect } from 'react';
import { Location, MapState, CompassState, NavigationState } from '../types';
import LocationService from '../services/LocationService';
import SensorService from '../services/SensorService';
import NavigationService from '../services/NavigationService';

export const useMapState = () => {
  const [mapState, setMapState] = useState<MapState>({
    camera: {
      center: { latitude: 37.78825, longitude: -122.4324 },
      pitch: 0,
      heading: 0,
      zoom: 15,
    },
    userLocation: null,
    compass: {
      heading: 0,
      isCalibrated: false,
      accuracy: 0,
    },
    navigation: {
      isNavigating: false,
      destination: undefined,
      route: [],
      currentStep: 0,
      totalSteps: 0,
      estimatedTime: 0,
      estimatedDistance: 0,
    },
    isFollowingUser: true,
    mapType: 'standard',
  });

  const updateUserLocation = useCallback((location: Location) => {
    setMapState(prev => ({
      ...prev,
      userLocation: location,
      camera: {
        ...prev.camera,
        center: location,
      },
    }));
  }, []);

  const updateCompassState = useCallback((compassState: CompassState) => {
    setMapState(prev => ({
      ...prev,
      compass: compassState,
    }));
  }, []);

  const updateNavigationState = useCallback(
    (navigationState: NavigationState) => {
      setMapState(prev => ({
        ...prev,
        navigation: navigationState,
      }));
    },
    [],
  );

  const setFollowingUser = useCallback((isFollowing: boolean) => {
    setMapState(prev => ({
      ...prev,
      isFollowingUser: isFollowing,
    }));
  }, []);

  const setMapType = useCallback(
    (mapType: 'standard' | 'satellite' | 'hybrid') => {
      setMapState(prev => ({
        ...prev,
        mapType,
      }));
    },
    [],
  );

  const updateCamera = useCallback((camera: Partial<MapState['camera']>) => {
    setMapState(prev => ({
      ...prev,
      camera: {
        ...prev.camera,
        ...camera,
      },
    }));
  }, []);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const hasPermission = await LocationService.requestPermissions();
        if (hasPermission) {
          LocationService.startLocationTracking();
          SensorService.startSensors();

          const initialLocation = await LocationService.getCurrentLocation();
          if (initialLocation) {
            updateUserLocation(initialLocation);
          }
        }
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();

    return () => {
      LocationService.stopLocationTracking();
      SensorService.stopSensors();
    };
  }, [updateUserLocation]);

  // Location listeners
  useEffect(() => {
    const handleLocationUpdate = (location: Location) => {
      updateUserLocation(location);
      NavigationService.updateCurrentLocation(location);
    };

    const handleLocationError = (error: string) => {
      console.error('Location error:', error);
    };

    LocationService.addLocationListener(handleLocationUpdate);
    LocationService.addErrorListener(handleLocationError);

    return () => {
      LocationService.removeLocationListener(handleLocationUpdate);
      LocationService.removeErrorListener(handleLocationError);
    };
  }, [updateUserLocation]);

  // Compass listeners
  useEffect(() => {
    const handleCompassUpdate = (compassState: CompassState) => {
      updateCompassState(compassState);
    };

    SensorService.addCompassListener(handleCompassUpdate);

    return () => {
      SensorService.removeCompassListener(handleCompassUpdate);
    };
  }, [updateCompassState]);

  // Navigation listeners
  useEffect(() => {
    const handleNavigationUpdate = (navigationState: NavigationState) => {
      updateNavigationState(navigationState);
    };

    NavigationService.addNavigationListener(handleNavigationUpdate);

    return () => {
      NavigationService.removeNavigationListener(handleNavigationUpdate);
    };
  }, [updateNavigationState]);

  return {
    mapState,
    updateUserLocation,
    updateCompassState,
    updateNavigationState,
    setFollowingUser,
    setMapType,
    updateCamera,
  };
};
