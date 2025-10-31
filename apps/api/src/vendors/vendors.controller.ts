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
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, VendorType } from '@tour-crm/shared';

@ApiTags('Vendors')
@ApiBearerAuth('bearerAuth')
@Controller('vendors')
@UseGuards(RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  create(@Body() createVendorDto: CreateVendorDto, @TenantId() tenantId: number) {
    return this.vendorsService.create(createVendorDto, tenantId);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS, UserRole.ACCOUNTING)
  @ApiOperation({
    summary: 'Get all vendors for current tenant with pagination',
    description: 'By default, excludes inactive (soft-deleted) vendors. Use ?include=inactive to include them.',
  })
  @ApiQuery({ name: 'type', enum: VendorType, required: false })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Set to "inactive" to include soft-deleted records',
    example: 'inactive',
  })
  @ApiResponse({ status: 200, description: 'Vendors retrieved successfully' })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
    @Query('type') type?: VendorType,
    @Query('include') include?: string,
  ) {
    const includeInactive = include === 'inactive';
    return this.vendorsService.findAll(tenantId, paginationDto, type, includeInactive);
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search vendors by name, contact or email' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  search(@Query('q') query: string, @TenantId() tenantId: number) {
    return this.vendorsService.search(query, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Get vendor by ID with rates' })
  @ApiResponse({ status: 200, description: 'Vendor retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.vendorsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorDto: UpdateVendorDto,
    @TenantId() tenantId: number,
  ) {
    return this.vendorsService.update(id, updateVendorDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate vendor (soft delete)' })
  @ApiResponse({ status: 200, description: 'Vendor deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.vendorsService.remove(id, tenantId);
  }
}
