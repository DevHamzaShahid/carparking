# Google Maps Clone - React Native

A comprehensive Google Maps clone built with React Native that replicates core features such as real-time navigation, location tracking, route rendering, and full integration with device sensors (accelerometer, gyroscope, and magnetometer) for compass functionality.

## 🚀 Features

### Core Navigation Features

- **Real-time Navigation**: Turn-by-turn navigation with smooth camera animations
- **Location Tracking**: High-accuracy GPS tracking with continuous updates
- **Route Rendering**: Visual route display with polyline overlays
- **Destination Markers**: Clear destination and waypoint markers

### Compass & Sensor Integration

- **Device Compass**: Real-time compass using magnetometer, accelerometer, and gyroscope
- **Dynamic Map Orientation**: Map automatically aligns with user's real-world direction
- **Calibration Status**: Visual feedback for compass calibration
- **Smooth Heading Detection**: Accurate heading calculation with sensor fusion

### Camera & Animation

- **Auto-follow Mode**: Camera automatically follows user's movement and heading
- **Smooth Animations**: Fluid camera transitions during navigation
- **3D Perspective**: Tilted view during navigation for better orientation
- **Zoom Optimization**: Automatic zoom adjustment based on context

### User Interface

- **Professional UI**: Clean, modern interface similar to Google Maps
- **Navigation Overlay**: Turn-by-turn instructions with progress tracking
- **Map Controls**: Easy switching between map types (standard, satellite, hybrid)
- **Location Button**: Quick return to user's current location
- **Compass Overlay**: Visual compass with calibration status

### Performance & Accuracy

- **High Performance**: Optimized for smooth 60fps animations
- **Accurate Sensors**: Proper sensor fusion for reliable compass readings
- **Responsive UI**: No noticeable lag in animations or updates
- **Battery Efficient**: Optimized location and sensor tracking

## 📱 Screenshots

_[Screenshots will be added after running the app]_

## 🛠 Installation

### Prerequisites

- Node.js (v18 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- Google Maps API Key

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd parkingApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies (iOS only)**

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure Google Maps API**

   **For Android:**

   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Add the API key to `android/app/src/main/AndroidManifest.xml`:

   ```xml
   <meta-data
     android:name="com.google.android.geo.API_KEY"
     android:value="YOUR_API_KEY_HERE"/>
   ```

   **For iOS:**

   - Add the API key to `ios/AppDelegate.mm`:

   ```objc
   [GMSServices provideAPIKey:@"YOUR_API_KEY_HERE"];
   ```

5. **Configure permissions**

   **Android:**

   - Ensure the following permissions are in `android/app/src/main/AndroidManifest.xml`:

   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

   **iOS:**

   - Add location usage descriptions to `ios/Info.plist`:

   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>This app needs location access to provide navigation features.</string>
   <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
   <string>This app needs location access to provide navigation features.</string>
   ```

6. **Run the application**

   **Android:**

   ```bash
   npx react-native run-android
   ```

   **iOS:**

   ```bash
   npx react-native run-ios
   ```

## 🎯 Usage

### Basic Navigation

1. **Start the app** - The app will request location permissions
2. **Wait for GPS lock** - The blue dot shows your current location
3. **Tap anywhere on the map** - This sets a destination and starts navigation
4. **Follow the route** - Turn-by-turn instructions appear at the top

### Compass Features

- **Automatic orientation** - The map rotates to match your real-world direction
- **Compass calibration** - The compass icon shows calibration status
- **Manual reset** - Tap the compass to reset to north-up orientation

### Map Controls

- **Map type selector** - Switch between standard, satellite, and hybrid views
- **Location button** - Tap to center the map on your current location
- **Navigation controls** - Stop navigation or view route details

## 🏗 Architecture

### Services

- **LocationService**: Handles GPS tracking and location permissions
- **SensorService**: Manages device sensors (accelerometer, gyroscope, magnetometer)
- **NavigationService**: Handles route calculation and navigation state

### Components

- **MapView**: Main map component with all overlays
- **CompassOverlay**: Visual compass with rotation animations
- **NavigationOverlay**: Turn-by-turn instructions and progress
- **LocationButton**: Quick location centering
- **MapControls**: Map type selection and controls

### Hooks

- **useMapState**: Custom hook for managing map state and services

### Utils

- **calculations.ts**: Mathematical utilities for distance, bearing, and coordinate calculations

## 🔧 Configuration

### Sensor Configuration

The app uses the following sensor settings:

- **Accelerometer**: 100Hz sampling rate
- **Gyroscope**: 100Hz sampling rate
- **Magnetometer**: 100Hz sampling rate
- **GPS**: High accuracy mode, 5m distance filter

### Performance Settings

- **Animation duration**: 500ms for smooth transitions
- **Location update interval**: 1 second
- **Compass update rate**: 300ms for responsive heading
- **Camera animation**: 1000ms for route following

## 🐛 Troubleshooting

### Common Issues

**Location not working:**

- Ensure location permissions are granted
- Check if GPS is enabled on the device
- Verify Google Maps API key is correctly configured

**Compass not calibrating:**

- Move the device in a figure-8 pattern
- Ensure you're away from magnetic interference
- Check if device has magnetometer sensor

**App crashes on startup:**

- Clear build cache: `npx react-native start --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- For iOS: `cd ios && pod install && cd ..`

**Performance issues:**

- Ensure device has sufficient RAM
- Close other GPS-intensive apps
- Check if battery saver mode is disabled

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section above
- Review the React Native documentation

## 🔄 Updates

This app is actively maintained and updated with:

- Latest React Native versions
- New Google Maps features
- Performance optimizations
- Bug fixes and improvements
