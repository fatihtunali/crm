import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { QuoteRequestDto } from './dto/quote-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/current-user.decorator';

@ApiTags('Pricing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pricing')
export class PricingController {
  // Universal pricing quote endpoint for all service types
  constructor(private readonly pricingService: PricingService) {}

  @Post('quote')
  @ApiOperation({
    summary: 'Get pricing quote for a service offering',
    description:
      'Calculate pricing for hotels, transfers, vehicles, guides, or activities based on service date and parameters',
  })
  @ApiResponse({ status: 200, description: 'Quote calculated successfully' })
  @ApiResponse({ status: 404, description: 'Service offering or rate not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  getQuote(@TenantId() tenantId: number, @Body() quoteRequestDto: QuoteRequestDto) {
    return this.pricingService.getQuote(tenantId, quoteRequestDto);
  }
}
