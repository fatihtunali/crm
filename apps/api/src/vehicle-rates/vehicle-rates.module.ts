import { Module } from '@nestjs/common';
import { VehicleRatesController } from './vehicle-rates.controller';
import { VehicleRatesService } from './vehicle-rates.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleRatesController],
  providers: [VehicleRatesService],
  exports: [VehicleRatesService],
})
export class VehicleRatesModule {}
