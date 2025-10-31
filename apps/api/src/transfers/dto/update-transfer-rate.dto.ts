import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTransferRateDto } from './create-transfer-rate.dto';

export class UpdateTransferRateDto extends PartialType(
  OmitType(CreateTransferRateDto, ['serviceOfferingId'] as const),
) {}
