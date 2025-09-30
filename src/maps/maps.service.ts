import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, TravelMode, DirectionsRoute } from '@googlemaps/google-maps-services-js';
import { GMAPS_CLIENT } from './maps.module';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly apiKey: string;

  constructor(
    @Inject(GMAPS_CLIENT) private readonly googleMapsClient: Client,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.getOrThrow<string>('GOOGLE_MAPS_API_KEY');
  }

  async geocodeAddress(address: string) {
    const res = await this.googleMapsClient.geocode({
      params: { address, key: this.apiKey, region: 'pe', language: 'es' },
      timeout: 8000,
    });
    const { status } = res.data as any;
    if (status && status !== 'OK') throw new Error(`Geocode failed: ${status}`);
    const [first] = res.data.results ?? [];
    if (!first) throw new Error('Address not found');
    return first;
  }

  async reverseGeocode(latitude: number, longitude: number) {
    const res = await this.googleMapsClient.reverseGeocode({
      params: { latlng: { lat: latitude, lng: longitude }, key: this.apiKey, region: 'pe', language: 'es' },
      timeout: 8000,
    });
    const { status } = res.data as any;
    if (status && status !== 'OK') throw new Error(`Reverse geocode failed: ${status}`);
    const [first] = res.data.results ?? [];
    if (!first) throw new Error('Location not found');
    return first;
  }

  async calculateRoute(originLat: number, originLng: number, destLat: number, destLng: number) {
    const res = await this.googleMapsClient.directions({
      params: {
        origin: `${originLat},${originLng}`,
        destination: `${destLat},${destLng}`,
        mode: TravelMode.driving,
        key: this.apiKey,
        region: 'pe',
        language: 'es',
        alternatives: false,
      },
      timeout: 8000,
    });

    const { status } = res.data as any;
    if (status && status !== 'OK') throw new Error(`Directions failed: ${status}`);
    const route: DirectionsRoute | undefined = res.data.routes?.[0];
    if (!route) throw new Error('No route found');

    const leg = route.legs?.[0];
    return {
      distance: leg?.distance?.text,
      duration: leg?.duration?.text,
      durationInSeconds: leg?.duration?.value,
      polyline: route.overview_polyline?.points,
      steps: (leg?.steps ?? []).map(s => ({
        instruction: s.html_instructions?.replace(/<[^>]*>/g, '') ?? '',
        distance: s.distance?.text,
        duration: s.duration?.text,
        startLocation: s.start_location,
        endLocation: s.end_location,
      })),
      bounds: route.bounds,
      summary: route.summary,
    };
  }

  async findNearbyPlaces(latitude: number, longitude: number, radius: number, type?: string) {
    const res = await this.googleMapsClient.placesNearby({
      params: { location: { lat: latitude, lng: longitude }, radius, type, key: this.apiKey },
      timeout: 8000,
    });
    const { status } = res.data as any;
    if (status && status !== 'OK') throw new Error(`PlacesNearby failed: ${status}`);
    return res.data.results ?? [];
  }

  async getDistanceMatrix(origins: string[], destinations: string[]) {
    const res = await this.googleMapsClient.distancematrix({
      params: { origins, destinations, mode: TravelMode.driving, key: this.apiKey, region: 'pe', language: 'es' },
      timeout: 8000,
    });
    const { status } = res.data as any;
    if (status && status !== 'OK') throw new Error(`DistanceMatrix failed: ${status}`);
    return res.data;
  }
}
