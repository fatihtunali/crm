import { Module } from '@nestjs/common';
import { TransferRatesController } from './transfer-rates.controller';
import { TransferRatesService } from './transfer-rates.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransferRatesController],
  providers: [TransferRatesService],
  exports: [TransferRatesService],
})
export class TransferRatesModule {}
