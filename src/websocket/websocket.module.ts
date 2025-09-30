import { Module } from '@nestjs/common';
import { DeliveryTrackingGateway } from './delivery-tracking/delivery-tracking.gateway';

@Module({
  providers: [DeliveryTrackingGateway]
})
export class WebsocketModule {}
