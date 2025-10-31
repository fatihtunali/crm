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
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/current-user.decorator';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new contact' })
  create(
    @TenantId() tenantId: number,
    @Body() createContactDto: CreateContactDto,
  ) {
    return this.contactsService.create(tenantId, createContactDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiQuery({ name: 'partyId', required: false, type: Number })
  @ApiQuery({ name: 'includeInactive', required: false, type: String })
  findAll(
    @TenantId() tenantId: number,
    @Query('partyId') partyId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.contactsService.findAll(
      tenantId,
      partyId ? parseInt(partyId, 10) : undefined,
      includeInactive === 'true',
    );
  }

  @Get('by-type/:type')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get contacts by type' })
  findByType(
    @TenantId() tenantId: number,
    @Param('type') contactType: string,
  ) {
    return this.contactsService.findByType(tenantId, contactType);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get contact by ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.contactsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update contact' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, tenantId, updateContactDto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete contact (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.contactsService.remove(id, tenantId);
  }
}
