import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Client } from '@googlemaps/google-maps-services-js';
import { MapsService } from './maps.service';

export const GMAPS_CLIENT = 'GMAPS_CLIENT';

@Module({
  imports: [ConfigModule],
  providers: [
    { provide: GMAPS_CLIENT, useFactory: () => new Client({}) },
    MapsService,
  ],
  exports: [MapsService],
})
export class MapsModule {}
