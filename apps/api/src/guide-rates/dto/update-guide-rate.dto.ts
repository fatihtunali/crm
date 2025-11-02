import { PartialType } from '@nestjs/mapped-types';
import { CreateGuideRateDto } from './create-guide-rate.dto';

export class UpdateGuideRateDto extends PartialType(CreateGuideRateDto) {}
