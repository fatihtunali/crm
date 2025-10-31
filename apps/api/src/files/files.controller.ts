import {
  Controller,
  Get,
  Post,
  Delete,
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
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId, UserId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Files')
@ApiBearerAuth('bearerAuth')
@Controller('files')
@UseGuards(RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-url')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({
    summary: 'Request a pre-signed upload URL',
    description:
      'Generates a pre-signed S3 URL for direct file upload from client',
  })
  @ApiResponse({
    status: 201,
    description: 'Upload URL generated successfully',
    schema: {
      example: {
        fileId: 1,
        uploadUrl: 'https://bucket.s3.amazonaws.com/...',
        storageKey: 'uploads/1/1234567890-abc123.pdf',
        expiresIn: 900,
      },
    },
  })
  requestUploadUrl(
    @Body() dto: RequestUploadUrlDto,
    @TenantId() tenantId: number,
    @UserId() userId: number,
  ) {
    return this.filesService.requestUploadUrl(dto, tenantId, userId);
  }

  @Post(':id/confirm')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({
    summary: 'Confirm file upload completion',
    description:
      'Marks the file as uploaded and generates a permanent download URL',
  })
  @ApiResponse({
    status: 200,
    description: 'File upload confirmed successfully',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  confirmUpload(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.filesService.confirmUpload(id, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all files for current tenant' })
  @ApiQuery({
    name: 'entity',
    type: String,
    required: false,
    description: 'Filter by entity type',
  })
  @ApiQuery({
    name: 'entityId',
    type: Number,
    required: false,
    description: 'Filter by entity ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Files retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
    @Query('entity') entity?: string,
    @Query('entityId', new ParseIntPipe({ optional: true }))
    entityId?: number,
  ) {
    return this.filesService.findAll(tenantId, paginationDto, entity, entityId);
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.filesService.findOne(id, tenantId);
  }

  @Get(':id/download-url')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({
    summary: 'Get pre-signed download URL',
    description: 'Generates a temporary pre-signed URL for file download',
  })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    schema: {
      example: {
        fileId: 1,
        fileName: 'passport-scan.pdf',
        downloadUrl: 'https://bucket.s3.amazonaws.com/...',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  getDownloadUrl(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.filesService.getDownloadUrl(id, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.filesService.remove(id, tenantId);
  }
}
