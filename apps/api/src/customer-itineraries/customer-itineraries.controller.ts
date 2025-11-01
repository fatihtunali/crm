import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { CustomerItinerariesService } from './customer-itineraries.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { UpdateItineraryStatusDto } from './dto/update-itinerary-status.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Customer Itineraries (AI)')
@Controller('customer-itineraries')
export class CustomerItinerariesController {
  constructor(private readonly customerItinerariesService: CustomerItinerariesService) {}

  // === PUBLIC ENDPOINTS (Customer-facing) ===

  @Post('generate')
  @Public()
  @ApiOperation({
    summary: 'Generate AI itinerary (PUBLIC)',
    description: 'Customer-facing endpoint to generate itinerary from preferences',
  })
  @ApiResponse({ status: 201, description: 'Itinerary generated successfully' })
  async generate(
    @Body() generateDto: GenerateItineraryDto,
    @Query('tenantId', ParseIntPipe) tenantId: number,
  ) {
    return this.customerItinerariesService.generateItinerary(generateDto, tenantId);
  }

  @Get('view/:uuid')
  @Public()
  @ApiOperation({
    summary: 'View generated itinerary (PUBLIC)',
    description: 'Customer can view their itinerary using UUID',
  })
  @ApiResponse({ status: 200, description: 'Itinerary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Itinerary not found' })
  findByUuid(@Param('uuid') uuid: string) {
    return this.customerItinerariesService.findByUuid(uuid);
  }

  @Post('view/:uuid/request-booking')
  @Public()
  @ApiOperation({
    summary: 'Request booking for itinerary (PUBLIC)',
    description: 'Customer requests to book the itinerary',
  })
  @ApiResponse({ status: 200, description: 'Booking requested successfully' })
  requestBooking(@Param('uuid') uuid: string) {
    return this.customerItinerariesService.requestBooking(uuid);
  }

  // === AGENT ENDPOINTS (Protected) ===

  @Get()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all customer itineraries' })
  @ApiResponse({ status: 200, description: 'Itineraries retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @TenantId() tenantId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.customerItinerariesService.findAll(tenantId, page, limit, status);
  }

  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get itinerary by ID' })
  @ApiResponse({ status: 200, description: 'Itinerary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Itinerary not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.customerItinerariesService.findOne(id, tenantId);
  }

  @Put(':uuid/status')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update itinerary status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(
    @Param('uuid') uuid: string,
    @Body() statusDto: UpdateItineraryStatusDto,
    @TenantId() tenantId: number,
  ) {
    return this.customerItinerariesService.updateStatus(uuid, statusDto, tenantId);
  }

  @Post(':id/convert-to-quote')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({
    summary: 'Convert AI itinerary to manual quote',
    description: 'Allows agents to customize AI-generated itinerary',
  })
  @ApiResponse({ status: 201, description: 'Manual quote created successfully' })
  convertToManualQuote(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.customerItinerariesService.convertToManualQuote(id, tenantId);
  }
}
