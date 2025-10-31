import { Module } from '@nestjs/common';
import { PaymentVendorService } from './payment-vendor.service';
import { PaymentVendorController } from './payment-vendor.controller';

@Module({
  controllers: [PaymentVendorController],
  providers: [PaymentVendorService],
  exports: [PaymentVendorService],
})
export class PaymentVendorModule {}
