import { accelerometer, gyroscope, magnetometer } from 'react-native-sensors';
import { SensorData, CompassState } from '../types';

class SensorService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private magnetometerSubscription: any = null;
  private sensorData: SensorData = {
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    magnetometer: { x: 0, y: 0, z: 0 },
  };
  private compassState: CompassState = {
    heading: 0,
    isCalibrated: false,
    accuracy: 0,
  };
  private listeners: ((data: SensorData) => void)[] = [];
  private compassListeners: ((state: CompassState) => void)[] = [];

  startSensors() {
    // Start accelerometer
    this.accelerometerSubscription = accelerometer.subscribe(({ x, y, z }) => {
      this.sensorData.accelerometer = { x, y, z };
      this.updateCompass();
      this.notifyListeners();
    });

    // Start gyroscope
    this.gyroscopeSubscription = gyroscope.subscribe(({ x, y, z }) => {
      this.sensorData.gyroscope = { x, y, z };
      this.updateCompass();
      this.notifyListeners();
    });

    // Start magnetometer
    this.magnetometerSubscription = magnetometer.subscribe(({ x, y, z }) => {
      this.sensorData.magnetometer = { x, y, z };
      this.updateCompass();
      this.notifyListeners();
    });
  }

  stopSensors() {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.unsubscribe();
      this.accelerometerSubscription = null;
    }
    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.unsubscribe();
      this.gyroscopeSubscription = null;
    }
    if (this.magnetometerSubscription) {
      this.magnetometerSubscription.unsubscribe();
      this.magnetometerSubscription = null;
    }
  }

  private updateCompass() {
    const { accelerometer, magnetometer } = this.sensorData;

    // Calculate heading using magnetometer and accelerometer
    const heading = this.calculateHeading(accelerometer, magnetometer);
    const accuracy = this.calculateAccuracy(accelerometer, magnetometer);
    const isCalibrated = accuracy > 0.7;

    this.compassState = {
      heading,
      isCalibrated,
      accuracy,
    };

    this.notifyCompassListeners();
  }

  private calculateHeading(acc: any, mag: any): number {
    // Normalize accelerometer data
    const accNorm = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const accX = acc.x / accNorm;
    const accY = acc.y / accNorm;
    const accZ = acc.z / accNorm;

    // Calculate rotation matrix
    const pitch = Math.asin(-accX);
    const roll = Math.atan2(accY, accZ);

    // Rotate magnetometer data
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);

    const magX = mag.x * cosPitch + mag.z * sinPitch;
    const magY =
      mag.x * sinRoll * sinPitch + mag.y * cosRoll - mag.z * sinRoll * cosPitch;

    // Calculate heading
    let heading = Math.atan2(magY, magX);

    // Convert to degrees
    heading = (heading * 180) / Math.PI;

    // Normalize to 0-360
    heading = (heading + 360) % 360;

    return heading;
  }

  private calculateAccuracy(acc: any, mag: any): number {
    // Calculate the magnitude of magnetic field
    const magMagnitude = Math.sqrt(
      mag.x * mag.x + mag.y * mag.y + mag.z * mag.z,
    );

    // Normal range for Earth's magnetic field is around 25-65 microtesla
    const minExpected = 25;
    const maxExpected = 65;

    if (magMagnitude < minExpected || magMagnitude > maxExpected) {
      return 0.1; // Low accuracy if magnetic field is outside expected range
    }

    // Calculate accelerometer accuracy (should be close to 1g)
    const accMagnitude = Math.sqrt(
      acc.x * acc.x + acc.y * acc.y + acc.z * acc.z,
    );
    const expectedGravity = 9.81;
    const gravityAccuracy =
      1 - Math.abs(accMagnitude - expectedGravity) / expectedGravity;

    return Math.max(0, Math.min(1, gravityAccuracy));
  }

  addSensorListener(listener: (data: SensorData) => void) {
    this.listeners.push(listener);
  }

  removeSensorListener(listener: (data: SensorData) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  addCompassListener(listener: (state: CompassState) => void) {
    this.compassListeners.push(listener);
  }

  removeCompassListener(listener: (state: CompassState) => void) {
    const index = this.compassListeners.indexOf(listener);
    if (index > -1) {
      this.compassListeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.sensorData));
  }

  private notifyCompassListeners() {
    this.compassListeners.forEach(listener => listener(this.compassState));
  }

  getCurrentSensorData(): SensorData {
    return { ...this.sensorData };
  }

  getCurrentCompassState(): CompassState {
    return { ...this.compassState };
  }
}

export default new SensorService();
