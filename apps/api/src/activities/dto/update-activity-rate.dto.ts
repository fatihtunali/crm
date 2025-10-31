import { PartialType } from '@nestjs/swagger';
import { CreateActivityRateDto } from './create-activity-rate.dto';

export class UpdateActivityRateDto extends PartialType(CreateActivityRateDto) {}
