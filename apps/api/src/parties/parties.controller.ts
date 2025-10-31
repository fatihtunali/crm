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
import { PartiesService } from './parties.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/current-user.decorator';

@ApiTags('Parties')
@Controller('parties')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new party' })
  create(@TenantId() tenantId: number, @Body() createPartyDto: CreatePartyDto) {
    return this.partiesService.create(tenantId, createPartyDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all parties' })
  findAll(
    @TenantId() tenantId: number,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.partiesService.findAll(tenantId, includeInactive === 'true');
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search parties' })
  search(@TenantId() tenantId: number, @Query('q') searchTerm: string) {
    return this.partiesService.search(tenantId, searchTerm);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get party by ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.partiesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update party' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updatePartyDto: UpdatePartyDto,
  ) {
    return this.partiesService.update(id, tenantId, updatePartyDto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete party (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.partiesService.remove(id, tenantId);
  }
}
