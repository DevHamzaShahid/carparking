import { Location, RoutePoint, NavigationState } from '../types';
import LocationService from './LocationService';

class NavigationService {
  private currentRoute: RoutePoint[] = [];
  private currentState: NavigationState = {
    isNavigating: false,
    destination: undefined,
    route: [],
    currentStep: 0,
    totalSteps: 0,
    estimatedTime: 0,
    estimatedDistance: 0,
  };
  private listeners: ((state: NavigationState) => void)[] = [];

  async calculateRoute(
    origin: Location,
    destination: Location,
  ): Promise<RoutePoint[]> {
    // For demo purposes, we'll create a simple route with waypoints
    // In a real app, you'd use a routing API like Google Directions API
    const route: RoutePoint[] = [];

    // Calculate intermediate points for a more realistic route
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const lat =
        origin.latitude + (destination.latitude - origin.latitude) * progress;
      const lng =
        origin.longitude +
        (destination.longitude - origin.longitude) * progress;

      const point: RoutePoint = {
        latitude: lat,
        longitude: lng,
        heading: this.calculateBearing(
          lat,
          lng,
          destination.latitude,
          destination.longitude,
        ),
        instruction: this.generateInstruction(i, steps),
        distance: LocationService.calculateDistance(
          lat,
          lng,
          destination.latitude,
          destination.longitude,
        ),
      };

      route.push(point);
    }

    return route;
  }

  private calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    return LocationService.calculateBearing(lat1, lon1, lat2, lon2);
  }

  private generateInstruction(step: number, totalSteps: number): string {
    if (step === 0) {
      return 'Start navigation';
    } else if (step === totalSteps) {
      return 'You have arrived at your destination';
    } else {
      const instructions = [
        'Continue straight',
        'Keep left',
        'Keep right',
        'Turn slightly left',
        'Turn slightly right',
        'Turn left',
        'Turn right',
      ];
      return instructions[step % instructions.length];
    }
  }

  startNavigation(destination: Location) {
    if (this.currentState.isNavigating) {
      this.stopNavigation();
    }

    this.currentState = {
      isNavigating: true,
      destination,
      route: [],
      currentStep: 0,
      totalSteps: 0,
      estimatedTime: 0,
      estimatedDistance: 0,
    };

    this.notifyListeners();
  }

  async setRoute(route: RoutePoint[]) {
    this.currentRoute = route;
    this.currentState.route = route;
    this.currentState.totalSteps = route.length;
    this.currentState.estimatedDistance = this.calculateTotalDistance(route);
    this.currentState.estimatedTime = this.estimateTravelTime(
      this.currentState.estimatedDistance,
    );

    this.notifyListeners();
  }

  private calculateTotalDistance(route: RoutePoint[]): number {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const current = route[i];
      const next = route[i + 1];
      totalDistance += LocationService.calculateDistance(
        current.latitude,
        current.longitude,
        next.latitude,
        next.longitude,
      );
    }
    return totalDistance;
  }

  private estimateTravelTime(distance: number): number {
    // Assume average speed of 30 km/h (8.33 m/s)
    const averageSpeed = 8.33; // m/s
    return distance / averageSpeed; // seconds
  }

  updateCurrentLocation(location: Location) {
    if (!this.currentState.isNavigating || this.currentRoute.length === 0) {
      return;
    }

    // Find the closest route point
    let closestPoint = 0;
    let minDistance = Infinity;

    for (let i = 0; i < this.currentRoute.length; i++) {
      const routePoint = this.currentRoute[i];
      const distance = LocationService.calculateDistance(
        location.latitude,
        location.longitude,
        routePoint.latitude,
        routePoint.longitude,
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = i;
      }
    }

    // Update current step if we've moved significantly
    if (closestPoint !== this.currentState.currentStep) {
      this.currentState.currentStep = closestPoint;
      this.notifyListeners();
    }
  }

  stopNavigation() {
    this.currentState = {
      isNavigating: false,
      destination: undefined,
      route: [],
      currentStep: 0,
      totalSteps: 0,
      estimatedTime: 0,
      estimatedDistance: 0,
    };
    this.currentRoute = [];
    this.notifyListeners();
  }

  getCurrentNavigationState(): NavigationState {
    return { ...this.currentState };
  }

  getCurrentRoute(): RoutePoint[] {
    return [...this.currentRoute];
  }

  getCurrentInstruction(): string {
    if (
      !this.currentState.isNavigating ||
      this.currentState.route.length === 0
    ) {
      return '';
    }

    const currentStep = this.currentState.currentStep;
    if (currentStep < this.currentState.route.length) {
      return this.currentState.route[currentStep].instruction || '';
    }

    return '';
  }

  getDistanceToDestination(location: Location): number {
    if (!this.currentState.destination) {
      return 0;
    }

    return LocationService.calculateDistance(
      location.latitude,
      location.longitude,
      this.currentState.destination.latitude,
      this.currentState.destination.longitude,
    );
  }

  addNavigationListener(listener: (state: NavigationState) => void) {
    this.listeners.push(listener);
  }

  removeNavigationListener(listener: (state: NavigationState) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentState));
  }
}

export default new NavigationService();
