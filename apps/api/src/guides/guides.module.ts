import { Module } from '@nestjs/common';
import { GuidesService } from './guides.service';
import { GuidesController } from './guides.controller';

@Module({
  providers: [GuidesService],
  controllers: [GuidesController]
})
export class GuidesModule {}
