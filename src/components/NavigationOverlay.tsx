import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationState } from '../types';

const { width } = Dimensions.get('window');

interface NavigationOverlayProps {
  navigation: NavigationState;
  onStopNavigation: () => void;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  navigation,
  onStopNavigation,
}) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getCurrentInstruction = (): string => {
    if (!navigation.route || navigation.route.length === 0) {
      return 'Calculating route...';
    }

    if (navigation.currentStep >= navigation.route.length) {
      return 'You have arrived at your destination';
    }

    return (
      navigation.route[navigation.currentStep].instruction ||
      'Continue straight'
    );
  };

  const getInstructionIcon = (): string => {
    const instruction = getCurrentInstruction().toLowerCase();

    if (instruction.includes('turn left')) return 'turn-left';
    if (instruction.includes('turn right')) return 'turn-right';
    if (instruction.includes('keep left')) return 'keep-left';
    if (instruction.includes('keep right')) return 'keep-right';
    if (instruction.includes('arrived')) return 'place';
    if (instruction.includes('start')) return 'play-arrow';

    return 'straight';
  };

  return (
    <View style={styles.container}>
      {/* Top navigation bar */}
      <LinearGradient
        colors={['rgba(66, 133, 244, 0.95)', 'rgba(66, 133, 244, 0.9)']}
        style={styles.navigationBar}
      >
        <View style={styles.navigationContent}>
          <View style={styles.instructionContainer}>
            <Icon
              name={getInstructionIcon()}
              size={32}
              color="white"
              style={styles.instructionIcon}
            />
            <View style={styles.instructionText}>
              <Text style={styles.instruction}>{getCurrentInstruction()}</Text>
              {navigation.estimatedDistance > 0 && (
                <Text style={styles.distance}>
                  {formatDistance(navigation.estimatedDistance)} •{' '}
                  {formatTime(navigation.estimatedTime)}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={onStopNavigation}
            activeOpacity={0.8}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Progress indicator */}
      {navigation.totalSteps > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (navigation.currentStep / navigation.totalSteps) * 100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {navigation.currentStep + 1} of {navigation.totalSteps}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navigationBar: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  navigationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  instructionIcon: {
    marginRight: 15,
  },
  instructionText: {
    flex: 1,
  },
  instruction: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  distance: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default NavigationOverlay;
