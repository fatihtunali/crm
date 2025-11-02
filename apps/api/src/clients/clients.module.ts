import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';

@Module({
  controllers: [ClientsController, TimelineController],
  providers: [ClientsService, TimelineService],
  exports: [ClientsService, TimelineService],
})
export class ClientsModule {}
