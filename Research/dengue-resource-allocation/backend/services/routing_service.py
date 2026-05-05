"""
Routing Service Interface and Implementation

This module provides an abstraction layer for routing services, currently using mock data
but designed to be easily replaceable with real routing APIs like Google Maps, OpenRoute Service, etc.

Future Integration Points:
- Google Maps Roads API
- Google Maps Distance Matrix API  
- OpenRoute Service
- MapBox Directions API
"""

import os
import math
import json
from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum


class RoutingProvider(Enum):
    """Supported routing providers"""
    MOCK = "mock"
    GOOGLE_MAPS = "google_maps"
    OPENROUTE_SERVICE = "openroute"
    MAPBOX = "mapbox"


@dataclass
class RoutePoint:
    """Represents a point in a route"""
    latitude: float
    longitude: float
    name: str
    address: Optional[str] = None
    place_id: Optional[str] = None


@dataclass 
class RouteSegment:
    """Represents a segment between two route points"""
    start_point: RoutePoint
    end_point: RoutePoint
    distance_meters: float
    duration_seconds: int
    distance_text: str  # "2.5 km"
    duration_text: str  # "8 mins"
    travel_mode: str = "driving"
    polyline: Optional[str] = None  # Encoded polyline for map display
    instructions: Optional[List[str]] = None  # Turn-by-turn directions


@dataclass
class RouteResponse:
    """Complete route response"""
    segments: List[RouteSegment]
    total_distance_meters: float
    total_duration_seconds: int
    total_distance_text: str
    total_duration_text: str
    overview_polyline: Optional[str] = None
    waypoints: Optional[List[RoutePoint]] = None
    status: str = "OK"
    error_message: Optional[str] = None


class RoutingServiceInterface(ABC):
    """Abstract interface for routing services"""
    
    @abstractmethod
    async def calculate_route(
        self,
        origin: RoutePoint,
        destination: RoutePoint,
        waypoints: Optional[List[RoutePoint]] = None,
        optimize_waypoints: bool = False,
        travel_mode: str = "driving",
        departure_time: Optional[int] = None,
        avoid_tolls: bool = False,
        avoid_highways: bool = False
    ) -> RouteResponse:
        """Calculate route between points"""
        pass
    
    @abstractmethod
    async def calculate_distance_matrix(
        self,
        origins: List[RoutePoint], 
        destinations: List[RoutePoint],
        travel_mode: str = "driving",
        departure_time: Optional[int] = None
    ) -> Dict[str, Any]:
        """Calculate distance/time matrix between multiple points"""
        pass
    
    @abstractmethod
    async def get_travel_time(
        self, 
        origin: RoutePoint, 
        destination: RoutePoint,
        travel_mode: str = "driving",
        departure_time: Optional[int] = None
    ) -> Tuple[float, int]:
        """Get travel distance (meters) and time (seconds) between two points"""
        pass


class MockRoutingService(RoutingServiceInterface):
    """
    Mock routing service using Haversine distance calculations.
    
    This provides realistic-looking data for demo purposes while maintaining
    the same interface as real routing services.
    """
    
    def __init__(self):
        # Mock configuration - can be adjusted for different scenarios
        self.average_speed_kmh = {
            "driving": 30,      # Urban areas like Colombo
            "walking": 5,       # Walking speed
            "bicycling": 15,    # Cycling speed
            "transit": 20       # Public transport average
        }
        
        # Road factor to simulate actual roads vs straight-line distance
        # Real roads are typically 1.2-1.5x longer than straight-line
        self.road_distance_factor = 1.3
        
        # Traffic factors for different times (could be made more sophisticated)
        self.traffic_factors = {
            "peak": 1.5,        # Peak hours - 50% slower
            "normal": 1.0,      # Normal traffic
            "light": 0.8        # Light traffic - 20% faster
        }
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great-circle distance in meters using Haversine formula"""
        # Convert to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth's radius in meters
        r = 6371000
        
        return c * r
    
    def _estimate_road_distance(self, straight_distance_m: float) -> float:
        """Estimate road distance from straight-line distance"""
        return straight_distance_m * self.road_distance_factor
    
    def _calculate_duration(
        self, 
        distance_m: float, 
        travel_mode: str = "driving",
        departure_time: Optional[int] = None
    ) -> int:
        """Calculate travel duration in seconds"""
        speed_kmh = self.average_speed_kmh.get(travel_mode, 30)
        
        # Apply traffic factor (simplified - could use departure_time for more accuracy)
        traffic_factor = self.traffic_factors.get("normal", 1.0)
        
        # Calculate time: distance (km) / speed (km/h) * 3600 (sec/h)
        duration_hours = (distance_m / 1000) / (speed_kmh * traffic_factor)
        return int(duration_hours * 3600)
    
    def _format_distance(self, distance_m: float) -> str:
        """Format distance for display"""
        if distance_m < 1000:
            return f"{int(distance_m)} m"
        else:
            return f"{distance_m / 1000:.1f} km"
    
    def _format_duration(self, duration_s: int) -> str:
        """Format duration for display"""
        if duration_s < 60:
            return f"{duration_s} sec"
        elif duration_s < 3600:
            return f"{int(duration_s / 60)} min"
        else:
            hours = int(duration_s / 3600)
            minutes = int((duration_s % 3600) / 60)
            return f"{hours}h {minutes}m"
    
    def _generate_mock_instructions(self, start: RoutePoint, end: RoutePoint) -> List[str]:
        """Generate mock turn-by-turn instructions"""
        return [
            f"Head southeast from {start.name}",
            f"Turn right onto main road",
            f"Continue for {self._format_distance(self._haversine_distance(start.latitude, start.longitude, end.latitude, end.longitude) * 0.8)}",
            f"Turn left toward {end.name}",
            f"Arrive at {end.name}"
        ]
    
    async def calculate_route(
        self,
        origin: RoutePoint,
        destination: RoutePoint, 
        waypoints: Optional[List[RoutePoint]] = None,
        optimize_waypoints: bool = False,
        travel_mode: str = "driving",
        departure_time: Optional[int] = None,
        avoid_tolls: bool = False,
        avoid_highways: bool = False
    ) -> RouteResponse:
        """Calculate mock route with realistic data"""
        
        try:
            # Create route points list
            route_points = [origin]
            if waypoints:
                if optimize_waypoints:
                    # Simple optimization: sort waypoints by distance from origin
                    waypoints_with_distance = []
                    for wp in waypoints:
                        dist = self._haversine_distance(
                            origin.latitude, origin.longitude,
                            wp.latitude, wp.longitude
                        )
                        waypoints_with_distance.append((dist, wp))
                    
                    # Sort by distance and extract waypoints
                    sorted_waypoints = [wp for _, wp in sorted(waypoints_with_distance)]
                    route_points.extend(sorted_waypoints)
                else:
                    route_points.extend(waypoints)
            route_points.append(destination)
            
            # Calculate segments
            segments = []
            total_distance = 0
            total_duration = 0
            
            for i in range(len(route_points) - 1):
                start_point = route_points[i]
                end_point = route_points[i + 1]
                
                # Calculate distances and times
                straight_distance = self._haversine_distance(
                    start_point.latitude, start_point.longitude,
                    end_point.latitude, end_point.longitude
                )
                road_distance = self._estimate_road_distance(straight_distance)
                duration = self._calculate_duration(road_distance, travel_mode, departure_time)
                
                # Create segment
                segment = RouteSegment(
                    start_point=start_point,
                    end_point=end_point,
                    distance_meters=road_distance,
                    duration_seconds=duration,
                    distance_text=self._format_distance(road_distance),
                    duration_text=self._format_duration(duration),
                    travel_mode=travel_mode,
                    polyline=None,  # Could generate encoded polyline for straight line
                    instructions=self._generate_mock_instructions(start_point, end_point)
                )
                
                segments.append(segment)
                total_distance += road_distance
                total_duration += duration
            
            return RouteResponse(
                segments=segments,
                total_distance_meters=total_distance,
                total_duration_seconds=total_duration,
                total_distance_text=self._format_distance(total_distance),
                total_duration_text=self._format_duration(total_duration),
                overview_polyline=None,
                waypoints=waypoints,
                status="OK"
            )
            
        except Exception as e:
            return RouteResponse(
                segments=[],
                total_distance_meters=0,
                total_duration_seconds=0,
                total_distance_text="0 km", 
                total_duration_text="0 min",
                status="ERROR",
                error_message=f"Route calculation failed: {str(e)}"
            )
    
    async def calculate_distance_matrix(
        self,
        origins: List[RoutePoint],
        destinations: List[RoutePoint], 
        travel_mode: str = "driving",
        departure_time: Optional[int] = None
    ) -> Dict[str, Any]:
        """Calculate mock distance matrix"""
        
        matrix = {
            "status": "OK",
            "origin_addresses": [f"{pt.name} ({pt.latitude:.4f}, {pt.longitude:.4f})" for pt in origins],
            "destination_addresses": [f"{pt.name} ({pt.latitude:.4f}, {pt.longitude:.4f})" for pt in destinations],
            "rows": []
        }
        
        for origin in origins:
            row = {"elements": []}
            
            for destination in destinations:
                distance_m, duration_s = await self.get_travel_time(
                    origin, destination, travel_mode, departure_time
                )
                
                element = {
                    "distance": {
                        "value": int(distance_m),
                        "text": self._format_distance(distance_m)
                    },
                    "duration": {
                        "value": duration_s,
                        "text": self._format_duration(duration_s)
                    },
                    "status": "OK"
                }
                row["elements"].append(element)
            
            matrix["rows"].append(row)
        
        return matrix
    
    async def get_travel_time(
        self,
        origin: RoutePoint,
        destination: RoutePoint,
        travel_mode: str = "driving", 
        departure_time: Optional[int] = None
    ) -> Tuple[float, int]:
        """Get travel distance and time between two points"""
        
        straight_distance = self._haversine_distance(
            origin.latitude, origin.longitude,
            destination.latitude, destination.longitude
        )
        road_distance = self._estimate_road_distance(straight_distance)
        duration = self._calculate_duration(road_distance, travel_mode, departure_time)
        
        return road_distance, duration


class GoogleMapsRoutingService(RoutingServiceInterface):
    """
    Google Maps routing service implementation (placeholder for future integration).
    
    This class shows how a real Google Maps integration would be structured.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api"
        
        # Initialize Google Maps client (would use googlemaps library)
        # import googlemaps
        # self.gmaps = googlemaps.Client(key=api_key)
        
        # For now, raise an error to prevent accidental usage
        raise NotImplementedError(
            "Google Maps integration is not yet implemented. "
            "Use MockRoutingService for development and demos."
        )
    
    async def calculate_route(self, *args, **kwargs) -> RouteResponse:
        """Calculate route using Google Maps Directions API"""
        # Implementation would use Google Maps Directions API
        # https://developers.google.com/maps/documentation/directions/start
        pass
    
    async def calculate_distance_matrix(self, *args, **kwargs) -> Dict[str, Any]:
        """Calculate distance matrix using Google Maps Distance Matrix API"""
        # Implementation would use Google Maps Distance Matrix API
        # https://developers.google.com/maps/documentation/distance-matrix/start
        pass
    
    async def get_travel_time(self, *args, **kwargs) -> Tuple[float, int]:
        """Get travel time using Google Maps APIs"""
        pass


class RoutingServiceFactory:
    """Factory for creating routing service instances"""
    
    @staticmethod
    def create_service(provider: RoutingProvider = RoutingProvider.MOCK, **kwargs) -> RoutingServiceInterface:
        """Create a routing service instance"""
        
        if provider == RoutingProvider.MOCK:
            return MockRoutingService()
        
        elif provider == RoutingProvider.GOOGLE_MAPS:
            api_key = kwargs.get('api_key') or os.getenv('GOOGLE_MAPS_API_KEY')
            if not api_key:
                raise ValueError(
                    "Google Maps API key is required. "
                    "Set GOOGLE_MAPS_API_KEY environment variable or pass api_key parameter."
                )
            return GoogleMapsRoutingService(api_key)
        
        else:
            raise ValueError(f"Unsupported routing provider: {provider}")


# Singleton instance for easy access
_routing_service = None

def get_routing_service() -> RoutingServiceInterface:
    """Get the configured routing service instance"""
    global _routing_service
    
    if _routing_service is None:
        # Check environment variable for provider preference
        provider_name = os.getenv('ROUTING_PROVIDER', 'mock').lower()
        
        try:
            provider = RoutingProvider(provider_name)
        except ValueError:
            print(f"Warning: Unknown routing provider '{provider_name}', falling back to mock")
            provider = RoutingProvider.MOCK
        
        _routing_service = RoutingServiceFactory.create_service(provider)
    
    return _routing_service


def set_routing_service(service: RoutingServiceInterface):
    """Override the global routing service instance (useful for testing)"""
    global _routing_service
    _routing_service = service


# Utility functions for easy integration
async def calculate_travel_time(
    origin_lat: float, 
    origin_lon: float, 
    dest_lat: float, 
    dest_lon: float,
    origin_name: str = "Origin",
    dest_name: str = "Destination"
) -> Tuple[float, int]:
    """
    Helper function to calculate travel time between coordinates.
    Returns (distance_meters, duration_seconds).
    """
    service = get_routing_service()
    
    origin = RoutePoint(latitude=origin_lat, longitude=origin_lon, name=origin_name)
    destination = RoutePoint(latitude=dest_lat, longitude=dest_lon, name=dest_name)
    
    return await service.get_travel_time(origin, destination)


async def plan_multi_stop_route(
    depot_lat: float,
    depot_lon: float, 
    stops: List[Dict[str, Any]],
    depot_name: str = "Depot",
    optimize_order: bool = True,
    return_to_depot: bool = True
) -> RouteResponse:
    """
    Helper function to plan a route with multiple stops.
    
    Args:
        depot_lat, depot_lon: Starting depot coordinates
        stops: List of dicts with 'latitude', 'longitude', 'name' keys
        depot_name: Name of the depot
        optimize_order: Whether to optimize the order of waypoints
        return_to_depot: Whether to return to depot at the end
    
    Returns:
        RouteResponse with complete route information
    """
    service = get_routing_service()
    
    # Create route points
    depot = RoutePoint(latitude=depot_lat, longitude=depot_lon, name=depot_name)
    
    waypoints = []
    for stop in stops:
        waypoint = RoutePoint(
            latitude=stop['latitude'],
            longitude=stop['longitude'], 
            name=stop['name']
        )
        waypoints.append(waypoint)
    
    # Determine destination
    if return_to_depot:
        destination = depot
    else:
        destination = waypoints.pop() if waypoints else depot
    
    return await service.calculate_route(
        origin=depot,
        destination=destination,
        waypoints=waypoints,
        optimize_waypoints=optimize_order
    )