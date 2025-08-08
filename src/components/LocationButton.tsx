import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LocationButtonProps {
  onPress: () => void;
  isFollowing: boolean;
}

const LocationButton: React.FC<LocationButtonProps> = ({
  onPress,
  isFollowing,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Add a subtle scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[styles.button, isFollowing && styles.activeButton]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Icon
          name="my-location"
          size={24}
          color={isFollowing ? '#4285F4' : '#666'}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 1000,
  },
  button: {
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
  activeButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#4285F4',
  },
});

export default LocationButton;
