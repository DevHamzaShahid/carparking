import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FOVCone as FOVConeType } from '../types';

interface FOVConeProps {
  fovCone: FOVConeType;
  visible: boolean;
}

const FOVCone: React.FC<FOVConeProps> = ({ fovCone, visible }) => {
  if (!visible) return null;

  const { center, heading, angle, distance } = fovCone;

  // Convert distance to screen pixels (approximate)
  const screenDistance = Math.min(distance * 100, 200); // Max 200px

  // Calculate cone points
  const headingRad = (heading * Math.PI) / 180;
  const angleRad = (angle * Math.PI) / 180;

  const leftAngle = headingRad - angleRad / 2;
  const rightAngle = headingRad + angleRad / 2;

  const leftPoint = {
    x: Math.cos(leftAngle) * screenDistance,
    y: Math.sin(leftAngle) * screenDistance,
  };

  const rightPoint = {
    x: Math.cos(rightAngle) * screenDistance,
    y: Math.sin(rightAngle) * screenDistance,
  };

  // Create SVG path for the cone
  const pathData = `
    M 0 0
    L ${leftPoint.x} ${leftPoint.y}
    A ${screenDistance} ${screenDistance} 0 0 1 ${rightPoint.x} ${rightPoint.y}
    Z
  `;

  return (
    <View style={styles.container}>
      <Svg
        width={screenDistance * 2}
        height={screenDistance * 2}
        style={styles.svg}
      >
        <Defs>
          <LinearGradient id="fovGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="rgba(66, 133, 244, 0.3)" />
            <Stop offset="100%" stopColor="rgba(66, 133, 244, 0.1)" />
          </LinearGradient>
        </Defs>
        <Path
          d={pathData}
          fill="url(#fovGradient)"
          stroke="rgba(66, 133, 244, 0.5)"
          strokeWidth="1"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    zIndex: 500,
  },
  svg: {
    position: 'absolute',
  },
});

export default FOVCone;
