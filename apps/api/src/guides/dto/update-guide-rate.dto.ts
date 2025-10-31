import { PartialType } from '@nestjs/swagger';
import { CreateGuideRateDto } from './create-guide-rate.dto';

export class UpdateGuideRateDto extends PartialType(CreateGuideRateDto) {}
