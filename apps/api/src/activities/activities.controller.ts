import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CreateActivityRateDto } from './dto/create-activity-rate.dto';
import { UpdateActivityRateDto } from './dto/update-activity-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/current-user.decorator';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // ============================================
  // ACTIVITY DETAILS ENDPOINTS
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create activity details for a service offering' })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Service offering not found' })
  @ApiResponse({ status: 409, description: 'Activity details already exist' })
  create(@TenantId() tenantId: number, @Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.createActivity(
      tenantId,
      createActivityDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  @ApiQuery({ name: 'activityType', required: false, description: 'Filter by activity type (tour, attraction, experience)' })
  @ApiQuery({ name: 'difficulty', required: false, description: 'Filter by difficulty level' })
  @ApiQuery({ name: 'supplierId', required: false, type: Number, description: 'Filter by supplier ID' })
  @ApiResponse({ status: 200, description: 'List of activities' })
  findAll(
    @TenantId() tenantId: number,
    @Query('activityType') activityType?: string,
    @Query('difficulty') difficulty?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.activitiesService.findAllActivities(
      tenantId,
      activityType,
      difficulty,
      supplierId ? parseInt(supplierId) : undefined,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search activities by operator name, type, or title' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@TenantId() tenantId: number, @Query('q') query: string) {
    return this.activitiesService.searchActivities(tenantId, query);
  }

  @Get(':serviceOfferingId')
  @ApiOperation({ summary: 'Get activity details by service offering ID' })
  @ApiResponse({ status: 200, description: 'Activity details' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  findOne(
    @TenantId() tenantId: number,
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
  ) {
    return this.activitiesService.findOneActivity(tenantId, serviceOfferingId);
  }

  @Patch(':serviceOfferingId')
  @ApiOperation({ summary: 'Update activity details' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  update(
    @TenantId() tenantId: number,
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.updateActivity(
      tenantId,
      serviceOfferingId,
      updateActivityDto,
    );
  }

  @Delete(':serviceOfferingId')
  @ApiOperation({ summary: 'Delete activity details (soft delete)' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  remove(
    @TenantId() tenantId: number,
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
  ) {
    return this.activitiesService.removeActivity(tenantId, serviceOfferingId);
  }

  // ============================================
  // ACTIVITY RATES ENDPOINTS
  // ============================================

  @Post('rates')
  @ApiOperation({ summary: 'Create activity rate' })
  @ApiResponse({ status: 201, description: 'Activity rate created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Activity details not found' })
  createRate(
    @TenantId() tenantId: number,
    @Body() createActivityRateDto: CreateActivityRateDto,
  ) {
    return this.activitiesService.createActivityRate(
      tenantId,
      createActivityRateDto,
    );
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get all activity rates' })
  @ApiQuery({ name: 'serviceOfferingId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter by season overlap (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter by season overlap (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'List of activity rates' })
  findAllRates(
    @TenantId() tenantId: number,
    @Query('serviceOfferingId') serviceOfferingId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.activitiesService.findAllActivityRates(
      tenantId,
      serviceOfferingId ? parseInt(serviceOfferingId) : undefined,
      dateFrom,
      dateTo,
    );
  }

  @Get('rates/:id')
  @ApiOperation({ summary: 'Get activity rate by ID' })
  @ApiResponse({ status: 200, description: 'Activity rate details' })
  @ApiResponse({ status: 404, description: 'Activity rate not found' })
  findOneRate(@TenantId() tenantId: number, @Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.findOneActivityRate(tenantId, id);
  }

  @Patch('rates/:id')
  @ApiOperation({ summary: 'Update activity rate' })
  @ApiResponse({ status: 200, description: 'Activity rate updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity rate not found' })
  updateRate(
    @TenantId() tenantId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivityRateDto: UpdateActivityRateDto,
  ) {
    return this.activitiesService.updateActivityRate(
      tenantId,
      id,
      updateActivityRateDto,
    );
  }

  @Delete('rates/:id')
  @ApiOperation({ summary: 'Delete activity rate (soft delete)' })
  @ApiResponse({ status: 200, description: 'Activity rate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Activity rate not found' })
  removeRate(@TenantId() tenantId: number, @Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.removeActivityRate(tenantId, id);
  }
}
