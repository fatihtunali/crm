import { Module } from '@nestjs/common';
import { ActivityRatesController } from './activity-rates.controller';
import { ActivityRatesService } from './activity-rates.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityRatesController],
  providers: [ActivityRatesService],
  exports: [ActivityRatesService],
})
export class ActivityRatesModule {}
