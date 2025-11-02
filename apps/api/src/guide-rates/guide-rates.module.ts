import { Module } from '@nestjs/common';
import { GuideRatesController } from './guide-rates.controller';
import { GuideRatesService } from './guide-rates.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GuideRatesController],
  providers: [GuideRatesService],
  exports: [GuideRatesService],
})
export class GuideRatesModule {}
