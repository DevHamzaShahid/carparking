import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CompassOverlayProps {
  heading: number;
  isCalibrated: boolean;
  onPress: () => void;
}

const CompassOverlay: React.FC<CompassOverlayProps> = ({
  heading,
  isCalibrated,
  onPress,
}) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: -heading, // Negative because we want to rotate counter-clockwise
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [heading, rotateAnim]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.compassContainer, !isCalibrated && styles.uncalibrated]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.compass,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="navigation" size={24} color="#4285F4" />
        </Animated.View>

        {!isCalibrated && (
          <View style={styles.calibrationIndicator}>
            <Text style={styles.calibrationText}>Calibrating...</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
  },
  compassContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uncalibrated: {
    backgroundColor: '#FFE0B2',
  },
  compass: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calibrationIndicator: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  calibrationText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: 'bold',
  },
});

export default CompassOverlay;
