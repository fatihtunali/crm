import { Module } from '@nestjs/common';
import { ManualQuotesService } from './manual-quotes.service';
import { ManualQuotesController } from './manual-quotes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManualQuotesController],
  providers: [ManualQuotesService],
  exports: [ManualQuotesService],
})
export class ManualQuotesModule {}
