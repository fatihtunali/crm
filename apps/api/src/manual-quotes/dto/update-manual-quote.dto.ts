import { PartialType } from '@nestjs/swagger';
import { CreateManualQuoteDto } from './create-manual-quote.dto';

export class UpdateManualQuoteDto extends PartialType(CreateManualQuoteDto) {}
