import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type MapType = 'standard' | 'satellite' | 'hybrid';

interface MapControlsProps {
  mapType: MapType;
  onMapTypeChange: (mapType: MapType) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  onMapTypeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnim = React.useRef(new Animated.Value(0)).current;

  const mapTypes: { type: MapType; label: string; icon: string }[] = [
    { type: 'standard', label: 'Standard', icon: 'map' },
    { type: 'satellite', label: 'Satellite', icon: 'satellite' },
    { type: 'hybrid', label: 'Hybrid', icon: 'layers' },
  ];

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);

    Animated.timing(expandAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleMapTypeSelect = (selectedType: MapType) => {
    onMapTypeChange(selectedType);
    if (isExpanded) {
      toggleExpanded();
    }
  };

  const currentMapType = mapTypes.find(mt => mt.type === mapType);

  return (
    <View style={styles.container}>
      {/* Map type selector */}
      <View style={styles.mapTypeContainer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={toggleExpanded}
          activeOpacity={0.8}
        >
          <Icon name={currentMapType?.icon || 'map'} size={20} color="#666" />
          <Text style={styles.mainButtonText}>{currentMapType?.label}</Text>
          <Icon
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.expandableContainer,
            {
              maxHeight: expandAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 150],
              }),
              opacity: expandAnim,
            },
          ]}
        >
          {mapTypes.map(mapTypeOption => (
            <TouchableOpacity
              key={mapTypeOption.type}
              style={[
                styles.mapTypeOption,
                mapType === mapTypeOption.type && styles.selectedOption,
              ]}
              onPress={() => handleMapTypeSelect(mapTypeOption.type)}
              activeOpacity={0.8}
            >
              <Icon
                name={mapTypeOption.icon}
                size={18}
                color={mapType === mapTypeOption.type ? '#4285F4' : '#666'}
              />
              <Text
                style={[
                  styles.mapTypeOptionText,
                  mapType === mapTypeOption.type && styles.selectedOptionText,
                ]}
              >
                {mapTypeOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    zIndex: 1000,
  },
  mapTypeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    minWidth: 120,
  },
  mainButtonText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  expandableContainer: {
    overflow: 'hidden',
  },
  mapTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  mapTypeOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#4285F4',
    fontWeight: '500',
  },
});

export default MapControls;
