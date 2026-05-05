/**
 * Frontend Routing Service
 * 
 * This service provides an abstraction layer for routing functionality,
 * preparing for future Google Maps integration while working with mock data.
 * 
 * Environment Variables for Future Integration:
 * - VITE_GOOGLE_MAPS_API_KEY: Google Maps JavaScript API key
 * - VITE_ROUTING_PROVIDER: 'mock' (default) or 'google_maps'
 */

// Routing provider types
export const ROUTING_PROVIDERS = {
  MOCK: 'mock',
  GOOGLE_MAPS: 'google_maps'
};

// Travel modes
export const TRAVEL_MODES = {
  DRIVING: 'driving',
  WALKING: 'walking',
  BICYCLING: 'bicycling',
  TRANSIT: 'transit'
};

/**
 * Route Point class
 */
export class RoutePoint {
  constructor(latitude, longitude, name, address = null, placeId = null) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.address = address;
    this.placeId = placeId;
  }
}

/**
 * Route Segment class
 */
export class RouteSegment {
  constructor({
    startPoint,
    endPoint,
    distanceMeters,
    durationSeconds,
    distanceText,
    durationText,
    travelMode = TRAVEL_MODES.DRIVING,
    polyline = null,
    instructions = null
  }) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.distanceMeters = distanceMeters;
    this.durationSeconds = durationSeconds;
    this.distanceText = distanceText;
    this.durationText = durationText;
    this.travelMode = travelMode;
    this.polyline = polyline;
    this.instructions = instructions || [];
  }
}

/**
 * Route Response class
 */
export class RouteResponse {
  constructor({
    segments,
    totalDistanceMeters,
    totalDurationSeconds,
    totalDistanceText,
    totalDurationText,
    overviewPolyline = null,
    waypoints = null,
    status = 'OK',
    errorMessage = null
  }) {
    this.segments = segments;
    this.totalDistanceMeters = totalDistanceMeters;
    this.totalDurationSeconds = totalDurationSeconds;
    this.totalDistanceText = totalDistanceText;
    this.totalDurationText = totalDurationText;
    this.overviewPolyline = overviewPolyline;
    this.waypoints = waypoints;
    this.status = status;
    this.errorMessage = errorMessage;
  }
}

/**
 * Abstract Routing Service Interface
 */
export class RoutingServiceInterface {
  async calculateRoute(origin, destination, options = {}) {
    throw new Error('calculateRoute method must be implemented');
  }
  
  async calculateDistanceMatrix(origins, destinations, options = {}) {
    throw new Error('calculateDistanceMatrix method must be implemented');
  }
  
  async getTravelTime(origin, destination, options = {}) {
    throw new Error('getTravelTime method must be implemented');
  }
}

/**
 * Mock Routing Service Implementation
 */
export class MockRoutingService extends RoutingServiceInterface {
  constructor() {
    super();
    
    // Configuration for mock calculations
    this.config = {
      averageSpeedKmh: {
        [TRAVEL_MODES.DRIVING]: 30,    // Urban areas like Colombo
        [TRAVEL_MODES.WALKING]: 5,     // Walking speed
        [TRAVEL_MODES.BICYCLING]: 15,  // Cycling speed
        [TRAVEL_MODES.TRANSIT]: 20     // Public transport average
      },
      roadDistanceFactor: 1.3,  // Real roads are ~1.3x longer than straight-line
      trafficFactors: {
        peak: 1.5,     // Peak hours - 50% slower
        normal: 1.0,   // Normal traffic
        light: 0.8     // Light traffic - 20% faster
      }
    };
  }
  
  /**
   * Calculate great-circle distance using Haversine formula
   */
  _haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
  
  /**
   * Estimate road distance from straight-line distance
   */
  _estimateRoadDistance(straightDistanceM) {
    return straightDistanceM * this.config.roadDistanceFactor;
  }
  
  /**
   * Calculate travel duration in seconds
   */
  _calculateDuration(distanceM, travelMode = TRAVEL_MODES.DRIVING, trafficCondition = 'normal') {
    const speedKmh = this.config.averageSpeedKmh[travelMode] || 30;
    const trafficFactor = this.config.trafficFactors[trafficCondition] || 1.0;
    
    // Calculate time: distance (km) / speed (km/h) * 3600 (sec/h)
    const durationHours = (distanceM / 1000) / (speedKmh * trafficFactor);
    return Math.round(durationHours * 3600);
  }
  
  /**
   * Format distance for display
   */
  _formatDistance(distanceM) {
    if (distanceM < 1000) {
      return `${Math.round(distanceM)} m`;
    } else {
      return `${(distanceM / 1000).toFixed(1)} km`;
    }
  }
  
  /**
   * Format duration for display
   */
  _formatDuration(durationS) {
    if (durationS < 60) {
      return `${durationS} sec`;
    } else if (durationS < 3600) {
      return `${Math.round(durationS / 60)} min`;
    } else {
      const hours = Math.floor(durationS / 3600);
      const minutes = Math.round((durationS % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }
  
  /**
   * Generate mock turn-by-turn instructions
   */
  _generateMockInstructions(start, end) {
    const straightDistance = this._haversineDistance(
      start.latitude, start.longitude,
      end.latitude, end.longitude
    );
    
    return [
      `Head southeast from ${start.name}`,
      `Turn right onto main road`,
      `Continue for ${this._formatDistance(straightDistance * 0.8)}`,
      `Turn left toward ${end.name}`,
      `Arrive at ${end.name}`
    ];
  }
  
  async calculateRoute(origin, destination, options = {}) {
    const {
      waypoints = [],
      optimizeWaypoints = false,
      travelMode = TRAVEL_MODES.DRIVING,
      departureTime = null,
      avoidTolls = false,
      avoidHighways = false
    } = options;
    
    try {
      // Create route points list
      let routePoints = [origin];
      
      if (waypoints.length > 0) {
        if (optimizeWaypoints) {
          // Simple optimization: sort waypoints by distance from origin
          const waypointsWithDistance = waypoints.map(wp => ({
            waypoint: wp,
            distance: this._haversineDistance(
              origin.latitude, origin.longitude,
              wp.latitude, wp.longitude
            )
          }));
          
          const sortedWaypoints = waypointsWithDistance
            .sort((a, b) => a.distance - b.distance)
            .map(item => item.waypoint);
          
          routePoints.push(...sortedWaypoints);
        } else {
          routePoints.push(...waypoints);
        }
      }
      
      routePoints.push(destination);
      
      // Calculate segments
      const segments = [];
      let totalDistance = 0;
      let totalDuration = 0;
      
      for (let i = 0; i < routePoints.length - 1; i++) {
        const startPoint = routePoints[i];
        const endPoint = routePoints[i + 1];
        
        // Calculate distances and times
        const straightDistance = this._haversineDistance(
          startPoint.latitude, startPoint.longitude,
          endPoint.latitude, endPoint.longitude
        );
        const roadDistance = this._estimateRoadDistance(straightDistance);
        const duration = this._calculateDuration(roadDistance, travelMode);
        
        // Create segment
        const segment = new RouteSegment({
          startPoint,
          endPoint,
          distanceMeters: roadDistance,
          durationSeconds: duration,
          distanceText: this._formatDistance(roadDistance),
          durationText: this._formatDuration(duration),
          travelMode,
          polyline: null, // Could generate encoded polyline
          instructions: this._generateMockInstructions(startPoint, endPoint)
        });
        
        segments.push(segment);
        totalDistance += roadDistance;
        totalDuration += duration;
      }
      
      return new RouteResponse({
        segments,
        totalDistanceMeters: totalDistance,
        totalDurationSeconds: totalDuration,
        totalDistanceText: this._formatDistance(totalDistance),
        totalDurationText: this._formatDuration(totalDuration),
        overviewPolyline: null,
        waypoints,
        status: 'OK'
      });
      
    } catch (error) {
      return new RouteResponse({
        segments: [],
        totalDistanceMeters: 0,
        totalDurationSeconds: 0,
        totalDistanceText: '0 km',
        totalDurationText: '0 min',
        status: 'ERROR',
        errorMessage: `Route calculation failed: ${error.message}`
      });
    }
  }
  
  async calculateDistanceMatrix(origins, destinations, options = {}) {
    const { travelMode = TRAVEL_MODES.DRIVING, departureTime = null } = options;
    
    const matrix = {
      status: 'OK',
      originAddresses: origins.map(pt => `${pt.name} (${pt.latitude.toFixed(4)}, ${pt.longitude.toFixed(4)})`),
      destinationAddresses: destinations.map(pt => `${pt.name} (${pt.latitude.toFixed(4)}, ${pt.longitude.toFixed(4)})`),
      rows: []
    };
    
    for (const origin of origins) {
      const row = { elements: [] };
      
      for (const destination of destinations) {
        const [distanceM, durationS] = await this.getTravelTime(origin, destination, { travelMode, departureTime });
        
        const element = {
          distance: {
            value: Math.round(distanceM),
            text: this._formatDistance(distanceM)
          },
          duration: {
            value: durationS,
            text: this._formatDuration(durationS)
          },
          status: 'OK'
        };
        
        row.elements.push(element);
      }
      
      matrix.rows.push(row);
    }
    
    return matrix;
  }
  
  async getTravelTime(origin, destination, options = {}) {
    const { travelMode = TRAVEL_MODES.DRIVING, departureTime = null } = options;
    
    const straightDistance = this._haversineDistance(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    );
    const roadDistance = this._estimateRoadDistance(straightDistance);
    const duration = this._calculateDuration(roadDistance, travelMode);
    
    return [roadDistance, duration];
  }
}

/**
 * Google Maps Routing Service (Placeholder for future integration)
 */
export class GoogleMapsRoutingService extends RoutingServiceInterface {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    
    // Check if Google Maps JavaScript API is loaded
    if (typeof google === 'undefined') {
      throw new Error(
        'Google Maps JavaScript API is not loaded. ' +
        'Please include the API script in your HTML or use the MockRoutingService for development.'
      );
    }
    
    this.directionsService = new google.maps.DirectionsService();
    this.distanceService = new google.maps.DistanceMatrixService();
  }
  
  async calculateRoute(origin, destination, options = {}) {
    // Implementation would use Google Maps Directions API
    // https://developers.google.com/maps/documentation/javascript/directions
    throw new Error('Google Maps integration is not yet implemented');
  }
  
  async calculateDistanceMatrix(origins, destinations, options = {}) {
    // Implementation would use Google Maps Distance Matrix API
    // https://developers.google.com/maps/documentation/javascript/distancematrix
    throw new Error('Google Maps integration is not yet implemented');
  }
  
  async getTravelTime(origin, destination, options = {}) {
    // Implementation would use Google Maps APIs
    throw new Error('Google Maps integration is not yet implemented');
  }
}

/**
 * Routing Service Factory
 */
export class RoutingServiceFactory {
  static createService(provider = ROUTING_PROVIDERS.MOCK, options = {}) {
    switch (provider) {
      case ROUTING_PROVIDERS.MOCK:
        return new MockRoutingService();
        
      case ROUTING_PROVIDERS.GOOGLE_MAPS:
        const apiKey = options.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error(
            'Google Maps API key is required. ' +
            'Set VITE_GOOGLE_MAPS_API_KEY environment variable or pass apiKey in options.'
          );
        }
        return new GoogleMapsRoutingService(apiKey);
        
      default:
        throw new Error(`Unsupported routing provider: ${provider}`);
    }
  }
}

/**
 * Global routing service instance
 */
let routingService = null;

export function getRoutingService() {
  if (!routingService) {
    // Check environment variable for provider preference
    const provider = import.meta.env.VITE_ROUTING_PROVIDER || ROUTING_PROVIDERS.MOCK;
    
    try {
      routingService = RoutingServiceFactory.createService(provider);
    } catch (error) {
      console.warn(`Failed to create ${provider} routing service, falling back to mock:`, error.message);
      routingService = RoutingServiceFactory.createService(ROUTING_PROVIDERS.MOCK);
    }
  }
  
  return routingService;
}

export function setRoutingService(service) {
  routingService = service;
}

/**
 * Utility functions for easy integration
 */

/**
 * Calculate travel time between coordinates
 */
export async function calculateTravelTime(
  originLat,
  originLon,
  destLat,
  destLon,
  originName = 'Origin',
  destName = 'Destination',
  options = {}
) {
  const service = getRoutingService();
  
  const origin = new RoutePoint(originLat, originLon, originName);
  const destination = new RoutePoint(destLat, destLon, destName);
  
  return await service.getTravelTime(origin, destination, options);
}

/**
 * Plan multi-stop route
 */
export async function planMultiStopRoute(
  depotLat,
  depotLon,
  stops,
  depotName = 'Depot',
  options = {}
) {
  const {
    optimizeOrder = true,
    returnToDepot = true,
    travelMode = TRAVEL_MODES.DRIVING
  } = options;
  
  const service = getRoutingService();
  
  // Create route points
  const depot = new RoutePoint(depotLat, depotLon, depotName);
  
  const waypoints = stops.map(stop => new RoutePoint(
    stop.latitude,
    stop.longitude,
    stop.name
  ));
  
  // Determine destination
  const destination = returnToDepot ? depot : (waypoints.pop() || depot);
  
  return await service.calculateRoute(depot, destination, {
    waypoints,
    optimizeWaypoints: optimizeOrder,
    travelMode
  });
}

/**
 * Integration helper for React components
 */
export function useRouting() {
  const service = getRoutingService();
  
  return {
    calculateRoute: service.calculateRoute.bind(service),
    calculateDistanceMatrix: service.calculateDistanceMatrix.bind(service),
    getTravelTime: service.getTravelTime.bind(service),
    planMultiStopRoute,
    calculateTravelTime,
    TRAVEL_MODES,
    ROUTING_PROVIDERS
  };
}

export default {
  getRoutingService,
  setRoutingService,
  RoutingServiceFactory,
  RoutePoint,
  RouteSegment,
  RouteResponse,
  MockRoutingService,
  GoogleMapsRoutingService,
  useRouting,
  calculateTravelTime,
  planMultiStopRoute,
  TRAVEL_MODES,
  ROUTING_PROVIDERS
};