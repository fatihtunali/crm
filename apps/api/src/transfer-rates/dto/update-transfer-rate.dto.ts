import { PartialType } from '@nestjs/mapped-types';
import { CreateTransferRateDto } from './create-transfer-rate.dto';

export class UpdateTransferRateDto extends PartialType(CreateTransferRateDto) {}
