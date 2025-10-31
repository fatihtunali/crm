import { Module } from '@nestjs/common';
import { VendorPortalService } from './vendor-portal.service';
import { VendorPortalController } from './vendor-portal.controller';

@Module({
  controllers: [VendorPortalController],
  providers: [VendorPortalService],
})
export class VendorPortalModule {}
