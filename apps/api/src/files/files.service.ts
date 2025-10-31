import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  createPaginatedResponse,
  PaginatedResponse,
} from '../common/interfaces/paginated-response.interface';
import { FileStatus } from '@prisma/client';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private urlExpiresIn: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.region = this.configService.get('AWS_REGION', 'us-east-1');
    this.bucket = this.configService.get('AWS_S3_BUCKET', '');
    this.urlExpiresIn = parseInt(
      this.configService.get('AWS_S3_UPLOAD_URL_EXPIRES_IN', '900'),
      10,
    );

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async requestUploadUrl(
    dto: RequestUploadUrlDto,
    tenantId: number,
    userId?: number,
  ) {
    // Validate file size (max 10MB by default)
    const maxFileSize = parseInt(
      this.configService.get('MAX_FILE_SIZE', '10485760'),
      10,
    );
    if (dto.fileSize > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxFileSize} bytes`,
      );
    }

    // Generate unique storage key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = dto.fileName.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;
    const storageKey = `uploads/${tenantId}/${fileName}`;

    // Create file record in database
    const file = await this.prisma.file.create({
      data: {
        tenantId,
        userId,
        fileName,
        originalName: dto.fileName,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        storageKey,
        entity: dto.entity,
        entityId: dto.entityId,
        status: FileStatus.PENDING,
      },
    });

    // Generate pre-signed upload URL
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: dto.mimeType,
      Metadata: {
        tenantId: tenantId.toString(),
        fileId: file.id.toString(),
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.urlExpiresIn,
    });

    return {
      fileId: file.id,
      uploadUrl,
      storageKey,
      expiresIn: this.urlExpiresIn,
    };
  }

  async confirmUpload(fileId: number, tenantId: number) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, tenantId },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    if (file.status !== FileStatus.PENDING) {
      throw new BadRequestException(
        `File upload already confirmed or failed`,
      );
    }

    // Generate permanent download URL (valid for 7 days)
    const downloadUrl = await this.generateDownloadUrl(file.storageKey, 604800);

    const updatedFile = await this.prisma.file.update({
      where: { id: fileId },
      data: {
        status: FileStatus.UPLOADED,
        uploadedAt: new Date(),
        url: downloadUrl,
      },
    });

    return updatedFile;
  }

  async findAll(
    tenantId: number,
    paginationDto: PaginationDto,
    entity?: string,
    entityId?: number,
  ): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'createdAt', order = 'desc' } = paginationDto;

    const where: any = {
      tenantId,
      status: FileStatus.UPLOADED,
    };

    if (entity) {
      where.entity = entity;
    }

    if (entityId !== undefined) {
      where.entityId = entityId;
    }

    const [data, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.file.count({ where }),
    ]);

    return createPaginatedResponse(
      data,
      total,
      paginationDto.page ?? 1,
      paginationDto.limit ?? 50,
    );
  }

  async findOne(id: number, tenantId: number) {
    const file = await this.prisma.file.findFirst({
      where: { id, tenantId },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async getDownloadUrl(id: number, tenantId: number) {
    const file = await this.findOne(id, tenantId);

    if (file.status !== FileStatus.UPLOADED) {
      throw new BadRequestException('File upload not yet confirmed');
    }

    // Generate temporary download URL (valid for 1 hour)
    const downloadUrl = await this.generateDownloadUrl(file.storageKey, 3600);

    return {
      fileId: file.id,
      fileName: file.originalName,
      downloadUrl,
      expiresIn: 3600,
    };
  }

  async remove(id: number, tenantId: number) {
    const file = await this.findOne(id, tenantId);

    await this.prisma.file.delete({
      where: { id },
    });

    // Note: In production, you should also delete the file from S3
    // Leaving that out for now to avoid accidental deletions during development

    return { message: 'File deleted successfully' };
  }

  private async generateDownloadUrl(
    storageKey: string,
    expiresIn: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
