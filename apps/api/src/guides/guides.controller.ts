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
import { GuidesService } from './guides.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { CreateGuideRateDto } from './dto/create-guide-rate.dto';
import { UpdateGuideRateDto } from './dto/update-guide-rate.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/current-user.decorator';

@ApiTags('Guides')
@Controller('guides')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  // ============================================
  // GUIDES (Details)
  // ============================================

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create guide details' })
  createGuide(
    @TenantId() tenantId: number,
    @Body() createGuideDto: CreateGuideDto,
  ) {
    return this.guidesService.createGuide(tenantId, createGuideDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all guides' })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  findAllGuides(
    @TenantId() tenantId: number,
    @Query('region') region?: string,
    @Query('language') language?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.guidesService.findAllGuides(
      tenantId,
      region,
      language,
      supplierId ? parseInt(supplierId, 10) : undefined,
    );
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search guides' })
  search(@TenantId() tenantId: number, @Query('q') searchTerm: string) {
    return this.guidesService.searchGuides(tenantId, searchTerm);
  }

  @Get(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get guide by service offering ID' })
  findOneGuide(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
  ) {
    return this.guidesService.findOneGuide(serviceOfferingId, tenantId);
  }

  @Patch(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update guide' })
  updateGuide(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
    @Body() updateGuideDto: UpdateGuideDto,
  ) {
    return this.guidesService.updateGuide(
      serviceOfferingId,
      tenantId,
      updateGuideDto,
    );
  }

  @Delete(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete guide (soft delete)' })
  removeGuide(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
  ) {
    return this.guidesService.removeGuide(serviceOfferingId, tenantId);
  }

  // ============================================
  // GUIDE RATES
  // ============================================

  @Post('rates')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create guide rate' })
  createGuideRate(
    @TenantId() tenantId: number,
    @Body() createGuideRateDto: CreateGuideRateDto,
  ) {
    return this.guidesService.createGuideRate(tenantId, createGuideRateDto);
  }

  @Get('rates')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all guide rates' })
  @ApiQuery({ name: 'serviceOfferingId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  findAllGuideRates(
    @TenantId() tenantId: number,
    @Query('serviceOfferingId') serviceOfferingId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.guidesService.findAllGuideRates(
      tenantId,
      serviceOfferingId ? parseInt(serviceOfferingId, 10) : undefined,
      dateFrom,
      dateTo,
    );
  }

  @Get('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get guide rate by ID' })
  findOneGuideRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.guidesService.findOneGuideRate(id, tenantId);
  }

  @Patch('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update guide rate' })
  updateGuideRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateGuideRateDto: UpdateGuideRateDto,
  ) {
    return this.guidesService.updateGuideRate(id, tenantId, updateGuideRateDto);
  }

  @Delete('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete guide rate (soft delete)' })
  removeGuideRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.guidesService.removeGuideRate(id, tenantId);
  }
}
