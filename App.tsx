/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MapView from './src/components/MapView';
import { Location } from './src/types';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const handleLocationUpdate = (location: Location) => {
    console.log('Location updated:', location);
  };

  const handleNavigationStart = (destination: Location) => {
    console.log('Navigation started to:', destination);
    Alert.alert(
      'Navigation Started',
      `Navigating to destination at ${destination.latitude.toFixed(
        4,
      )}, ${destination.longitude.toFixed(4)}`,
      [{ text: 'OK' }],
    );
  };

  const handleNavigationStop = () => {
    console.log('Navigation stopped');
    Alert.alert('Navigation Stopped', 'Navigation has been cancelled.');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <MapView
          onLocationUpdate={handleLocationUpdate}
          onNavigationStart={handleNavigationStart}
          onNavigationStop={handleNavigationStop}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
