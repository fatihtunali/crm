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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Clients')
@ApiBearerAuth('bearerAuth')
@Controller('clients')
@UseGuards(RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 409, description: 'Client with this email already exists' })
  create(@Body() createClientDto: CreateClientDto, @TenantId() tenantId: number) {
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all clients for current tenant with pagination' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.clientsService.findAll(tenantId, paginationDto);
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search clients by name, email, phone or passport' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  search(@Query('q') query: string, @TenantId() tenantId: number) {
    return this.clientsService.search(query, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get client by ID with related leads and quotations' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 409, description: 'Client with this email already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
    @TenantId() tenantId: number,
  ) {
    return this.clientsService.update(id, updateClientDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate client (soft delete)' })
  @ApiResponse({ status: 200, description: 'Client deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.clientsService.remove(id, tenantId);
  }
}
