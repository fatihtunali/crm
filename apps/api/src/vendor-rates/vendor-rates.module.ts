import { Module } from '@nestjs/common';
import { VendorRatesService } from './vendor-rates.service';
import { VendorRatesController } from './vendor-rates.controller';

@Module({
  controllers: [VendorRatesController],
  providers: [VendorRatesService],
  exports: [VendorRatesService],
})
export class VendorRatesModule {}
