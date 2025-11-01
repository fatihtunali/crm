import { Module } from '@nestjs/common';
import { CustomerItinerariesService } from './customer-itineraries.service';
import { CustomerItinerariesController } from './customer-itineraries.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [PrismaModule, CatalogModule],
  controllers: [CustomerItinerariesController],
  providers: [CustomerItinerariesService],
  exports: [CustomerItinerariesService],
})
export class CustomerItinerariesModule {}
