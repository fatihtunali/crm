import { Module } from '@nestjs/common';
import { ServiceOfferingsService } from './service-offerings.service';
import { ServiceOfferingsController } from './service-offerings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceOfferingsController],
  providers: [ServiceOfferingsService],
  exports: [ServiceOfferingsService],
})
export class ServiceOfferingsModule {}
