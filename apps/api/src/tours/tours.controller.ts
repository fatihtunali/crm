import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Tours')
@ApiBearerAuth('JWT-auth')
@Controller('tours')
@UseGuards(RolesGuard)
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Create a new tour with itinerary' })
  @ApiResponse({ status: 201, description: 'Tour created successfully' })
  create(@Body() createTourDto: CreateTourDto, @TenantId() tenantId: number) {
    return this.toursService.create(createTourDto, tenantId);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Get all tours for current tenant with pagination' })
  @ApiResponse({ status: 200, description: 'Tours retrieved successfully' })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.toursService.findAll(tenantId, paginationDto);
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search tours by code, name or description' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  search(@Query('q') query: string, @TenantId() tenantId: number) {
    return this.toursService.search(query, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Get tour by ID with full itinerary' })
  @ApiResponse({ status: 200, description: 'Tour retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.toursService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update tour' })
  @ApiResponse({ status: 200, description: 'Tour updated successfully' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourDto: UpdateTourDto,
    @TenantId() tenantId: number,
  ) {
    return this.toursService.update(id, updateTourDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate tour (soft delete)' })
  @ApiResponse({ status: 200, description: 'Tour deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.toursService.remove(id, tenantId);
  }
}
