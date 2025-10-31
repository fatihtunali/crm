import { PartialType } from '@nestjs/swagger';
import { CreateServiceOfferingDto } from './create-service-offering.dto';

export class UpdateServiceOfferingDto extends PartialType(
  CreateServiceOfferingDto,
) {}
