import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import MapView as RNMapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
  Camera,
} from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { Location, MapState, CompassState, NavigationState } from '../types';
import LocationService from '../services/LocationService';
import SensorService from '../services/SensorService';
import NavigationService from '../services/NavigationService';
import CompassOverlay from './CompassOverlay';
import NavigationOverlay from './NavigationOverlay';
import LocationButton from './LocationButton';
import MapControls from './MapControls';

const { width, height } = Dimensions.get('window');

interface MapViewProps {
  onLocationUpdate?: (location: Location) => void;
  onNavigationStart?: (destination: Location) => void;
  onNavigationStop?: () => void;
}

const MapView: React.FC<MapViewProps> = ({
  onLocationUpdate,
  onNavigationStart,
  onNavigationStop,
}) => {
  const mapRef = useRef<RNMapView>(null);
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

  const [hasPermissions, setHasPermissions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Request permissions and initialize services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const locationPermission = await LocationService.requestPermissions();
        setHasPermissions(locationPermission);

        if (locationPermission) {
          // Start location tracking
          LocationService.startLocationTracking();
          
          // Start sensor tracking
          SensorService.startSensors();

          // Get initial location
          const initialLocation = await LocationService.getCurrentLocation();
          if (initialLocation) {
            updateUserLocation(initialLocation);
          }
        } else {
          Alert.alert(
            'Location Permission Required',
            'This app needs location access to provide navigation features.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        Alert.alert('Error', 'Failed to initialize the app. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      LocationService.stopLocationTracking();
      SensorService.stopSensors();
    };
  }, []);

  // Location tracking
  useEffect(() => {
    const handleLocationUpdate = (location: Location) => {
      updateUserLocation(location);
      onLocationUpdate?.(location);
      
      // Update navigation service
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
  }, [onLocationUpdate]);

  // Sensor tracking
  useEffect(() => {
    const handleCompassUpdate = (compassState: CompassState) => {
      setMapState(prev => ({
        ...prev,
        compass: compassState,
      }));

      // Update camera heading if following user
      if (prev.isFollowingUser && prev.userLocation) {
        updateCameraHeading(compassState.heading);
      }
    };

    SensorService.addCompassListener(handleCompassUpdate);

    return () => {
      SensorService.removeCompassListener(handleCompassUpdate);
    };
  }, []);

  // Navigation tracking
  useEffect(() => {
    const handleNavigationUpdate = (navigationState: NavigationState) => {
      setMapState(prev => ({
        ...prev,
        navigation: navigationState,
      }));

      if (navigationState.isNavigating && navigationState.route.length > 0) {
        // Animate camera to follow route
        animateCameraToRoute(navigationState.route, navigationState.currentStep);
      }
    };

    NavigationService.addNavigationListener(handleNavigationUpdate);

    return () => {
      NavigationService.removeNavigationListener(handleNavigationUpdate);
    };
  }, []);

  const updateUserLocation = useCallback((location: Location) => {
    setMapState(prev => ({
      ...prev,
      userLocation: location,
      camera: {
        ...prev.camera,
        center: location,
      },
    }));

    // Animate camera to user location if following
    if (mapState.isFollowingUser && mapRef.current) {
      animateCameraToLocation(location);
    }
  }, [mapState.isFollowingUser]);

  const updateCameraHeading = useCallback((heading: number) => {
    if (mapRef.current && mapState.isFollowingUser) {
      mapRef.current.animateCamera({
        center: mapState.camera.center,
        heading: heading,
        pitch: 45,
        zoom: 18,
      }, { duration: 500 });
    }
  }, [mapState.camera.center, mapState.isFollowingUser]);

  const animateCameraToLocation = useCallback((location: Location) => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: location,
        pitch: mapState.navigation.isNavigating ? 45 : 0,
        heading: mapState.compass.heading,
        zoom: mapState.navigation.isNavigating ? 18 : 15,
      }, { duration: 1000 });
    }
  }, [mapState.navigation.isNavigating, mapState.compass.heading]);

  const animateCameraToRoute = useCallback((route: any[], currentStep: number) => {
    if (mapRef.current && route[currentStep]) {
      const routePoint = route[currentStep];
      mapRef.current.animateCamera({
        center: routePoint,
        pitch: 45,
        heading: routePoint.heading || mapState.compass.heading,
        zoom: 18,
      }, { duration: 1000 });
    }
  }, [mapState.compass.heading]);

  const handleMapPress = useCallback((event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const destination: Location = { latitude, longitude };
    
    if (mapState.userLocation) {
      NavigationService.startNavigation(destination);
      NavigationService.calculateRoute(mapState.userLocation, destination)
        .then(route => {
          NavigationService.setRoute(route);
        });
      
      onNavigationStart?.(destination);
    }
  }, [mapState.userLocation, onNavigationStart]);

  const handleLocationButtonPress = useCallback(() => {
    if (mapState.userLocation) {
      setMapState(prev => ({ ...prev, isFollowingUser: true }));
      animateCameraToLocation(mapState.userLocation);
    }
  }, [mapState.userLocation, animateCameraToLocation]);

  const handleCompassPress = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: mapState.camera.center,
        heading: 0,
        pitch: 0,
        zoom: mapState.camera.zoom,
      }, { duration: 500 });
    }
  }, [mapState.camera.center, mapState.camera.zoom]);

  const handleStopNavigation = useCallback(() => {
    NavigationService.stopNavigation();
    onNavigationStop?.();
  }, [onNavigationStop]);

  if (!hasPermissions || isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Add loading indicator here */}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <RNMapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={true}
        showsTraffic={true}
        showsBuildings={true}
        showsIndoors={true}
        mapType={mapState.mapType}
        onPress={handleMapPress}
        initialRegion={{
          latitude: mapState.camera.center.latitude,
          longitude: mapState.camera.center.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Navigation route */}
        {mapState.navigation.route.length > 0 && (
          <Polyline
            coordinates={mapState.navigation.route}
            strokeColor="#4285F4"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Destination marker */}
        {mapState.navigation.destination && (
          <Marker
            coordinate={mapState.navigation.destination}
            title="Destination"
            description="Your destination"
            pinColor="red"
          />
        )}

        {/* Current route step marker */}
        {mapState.navigation.route.length > 0 && mapState.navigation.currentStep < mapState.navigation.route.length && (
          <Marker
            coordinate={mapState.navigation.route[mapState.navigation.currentStep]}
            title="Current Step"
            description={mapState.navigation.route[mapState.navigation.currentStep].instruction}
            pinColor="blue"
          />
        )}
      </RNMapView>

      {/* Overlays */}
      <CompassOverlay
        heading={mapState.compass.heading}
        isCalibrated={mapState.compass.isCalibrated}
        onPress={handleCompassPress}
      />

      <LocationButton
        onPress={handleLocationButtonPress}
        isFollowing={mapState.isFollowingUser}
      />

      <MapControls
        mapType={mapState.mapType}
        onMapTypeChange={(mapType) => setMapState(prev => ({ ...prev, mapType }))}
      />

      {mapState.navigation.isNavigating && (
        <NavigationOverlay
          navigation={mapState.navigation}
          onStopNavigation={handleStopNavigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default MapView;
