import { Module } from '@nestjs/common';
import { BookingItemsService } from './booking-items.service';
import { BookingItemsController } from './booking-items.controller';

@Module({
  controllers: [BookingItemsController],
  providers: [BookingItemsService],
  exports: [BookingItemsService],
})
export class BookingItemsModule {}
