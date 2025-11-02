import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityRateDto } from './create-activity-rate.dto';

export class UpdateActivityRateDto extends PartialType(CreateActivityRateDto) {}
