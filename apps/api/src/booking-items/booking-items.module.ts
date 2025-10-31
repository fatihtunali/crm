import { Module } from '@nestjs/common';
import { BookingItemsService } from './booking-items.service';
import { BookingItemsController } from './booking-items.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PrismaModule, PricingModule],
  controllers: [BookingItemsController],
  providers: [BookingItemsService],
  exports: [BookingItemsService],
})
export class BookingItemsModule {}
