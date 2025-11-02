import { Module } from '@nestjs/common';
import { HotelRoomRatesController } from './hotel-room-rates.controller';
import { HotelRoomRatesService } from './hotel-room-rates.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HotelRoomRatesController],
  providers: [HotelRoomRatesService],
  exports: [HotelRoomRatesService],
})
export class HotelRoomRatesModule {}
