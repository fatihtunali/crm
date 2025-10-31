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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/current-user.decorator';
import { SupplierType } from '@prisma/client';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new supplier' })
  create(
    @TenantId() tenantId: number,
    @Body() createSupplierDto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(tenantId, createSupplierDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiQuery({ name: 'type', required: false, enum: SupplierType })
  @ApiQuery({ name: 'includeInactive', required: false, type: String })
  findAll(
    @TenantId() tenantId: number,
    @Query('type') type?: SupplierType,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.suppliersService.findAll(
      tenantId,
      type,
      includeInactive === 'true',
    );
  }

  @Get('stats')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get supplier statistics by type' })
  getStats(@TenantId() tenantId: number) {
    return this.suppliersService.getStatsByType(tenantId);
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search suppliers' })
  @ApiQuery({ name: 'type', required: false, enum: SupplierType })
  search(
    @TenantId() tenantId: number,
    @Query('q') searchTerm: string,
    @Query('type') type?: SupplierType,
  ) {
    return this.suppliersService.search(tenantId, searchTerm, type);
  }

  @Get('by-type/:type')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get suppliers by type' })
  findByType(@TenantId() tenantId: number, @Param('type') type: SupplierType) {
    return this.suppliersService.findByType(tenantId, type);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update supplier' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, tenantId, updateSupplierDto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete supplier (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.suppliersService.remove(id, tenantId);
  }
}
