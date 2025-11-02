import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { BulkImportClientsDto, BulkImportResult } from './dto/bulk-import-clients.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { ErrorMessages } from '../common/errors/error-messages';
import { BusinessRules } from '../config/business-rules.config';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'createdAt', order = 'desc' } = paginationDto;
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.client.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async create(createClientDto: CreateClientDto, tenantId: number) {
    // Check if email already exists for this tenant (if email provided)
    if (createClientDto.email) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          email: createClientDto.email,
          tenantId,
        },
      });

      if (existingClient) {
        throw new ConflictException('Client with this email already exists');
      }
    }

    const client = await this.prisma.client.create({
      data: {
        tenantId,
        name: createClientDto.name,
        email: createClientDto.email,
        phone: createClientDto.phone,
        nationality: createClientDto.nationality,
        preferredLanguage: createClientDto.preferredLanguage || 'en',
        passportNumber: createClientDto.passportNumber,
        dateOfBirth: createClientDto.dateOfBirth ? new Date(createClientDto.dateOfBirth) : null,
        notes: createClientDto.notes,
      },
    });

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto, tenantId: number) {
    // Check if client exists
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Check if email is being updated and already exists
    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          email: updateClientDto.email,
          tenantId,
          id: { not: id },
        },
      });

      if (existingClient) {
        throw new ConflictException('Client with this email already exists');
      }
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: {
        name: updateClientDto.name,
        email: updateClientDto.email,
        phone: updateClientDto.phone,
        nationality: updateClientDto.nationality,
        preferredLanguage: updateClientDto.preferredLanguage,
        passportNumber: updateClientDto.passportNumber,
        dateOfBirth: updateClientDto.dateOfBirth ? new Date(updateClientDto.dateOfBirth) : undefined,
        notes: updateClientDto.notes,
        isActive: updateClientDto.isActive,
      },
    });

    return updatedClient;
  }

  async remove(id: number, tenantId: number) {
    // Check if client exists
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.client.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Client deactivated successfully' };
  }

  async search(query: string, tenantId: number) {
    return this.prisma.client.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { passportNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Bulk import clients from array
   * Supports dry-run mode, atomic transactions, and duplicate skipping
   */
  async bulkImport(
    bulkImportDto: BulkImportClientsDto,
    tenantId: number
  ): Promise<BulkImportResult> {
    const { clients, atomic = false, dryRun = false, skipDuplicates = true } = bulkImportDto;

    const result: BulkImportResult = {
      totalProcessed: clients.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      errors: [],
      imported: [],
      skipped: [],
    };

    this.logger.log(
      `Starting bulk import of ${clients.length} clients for tenant ${tenantId} ` +
      `(dryRun: ${dryRun}, atomic: ${atomic}, skipDuplicates: ${skipDuplicates})`
    );

    // If atomic mode, use transaction
    if (atomic && !dryRun) {
      try {
        await this.prisma.$transaction(async (tx) => {
          for (let i = 0; i < clients.length; i++) {
            const clientDto = clients[i];
            const row = i + 1;

            try {
              // Check for duplicates
              if (clientDto.email) {
                const existing = await tx.client.findFirst({
                  where: { email: clientDto.email, tenantId },
                });

                if (existing) {
                  if (skipDuplicates) {
                    result.skippedCount++;
                    result.skipped.push({
                      row,
                      client: clientDto,
                      reason: `Client with email ${clientDto.email} already exists`,
                    });
                    continue;
                  } else {
                    throw new Error(ErrorMessages.CLIENT_EMAIL_EXISTS(clientDto.email));
                  }
                }
              }

              // Create client
              const created = await tx.client.create({
                data: {
                  tenantId,
                  name: clientDto.name,
                  email: clientDto.email,
                  phone: clientDto.phone,
                  nationality: clientDto.nationality,
                  preferredLanguage: clientDto.preferredLanguage || 'en',
                  passportNumber: clientDto.passportNumber,
                  dateOfBirth: clientDto.dateOfBirth ? new Date(clientDto.dateOfBirth) : null,
                  notes: clientDto.notes,
                },
              });

              result.successCount++;
              result.imported.push({
                row,
                id: created.id,
                name: created.name,
                email: created.email ?? undefined,
              });
            } catch (error: any) {
              result.failedCount++;
              result.errors.push({
                row,
                client: clientDto,
                error: error.message || 'Unknown error',
              });
              throw error; // Re-throw to rollback transaction
            }
          }
        });
      } catch (error: any) {
        this.logger.error(`Atomic bulk import failed: ${error.message}`);
        // Transaction rolled back, return current result
        return result;
      }
    } else {
      // Process each client individually (non-atomic or dry-run)
      const batchSize = BusinessRules.query.maxBatchSize;

      for (let i = 0; i < clients.length; i += batchSize) {
        const batch = clients.slice(i, Math.min(i + batchSize, clients.length));

        for (let j = 0; j < batch.length; j++) {
          const clientDto = batch[j];
          const row = i + j + 1;

          try {
            // Check for duplicates
            if (clientDto.email) {
              const existing = await this.prisma.client.findFirst({
                where: { email: clientDto.email, tenantId },
              });

              if (existing) {
                if (skipDuplicates) {
                  result.skippedCount++;
                  result.skipped.push({
                    row,
                    client: clientDto,
                    reason: `Client with email ${clientDto.email} already exists`,
                  });
                  continue;
                } else {
                  throw new ConflictException(ErrorMessages.CLIENT_EMAIL_EXISTS(clientDto.email));
                }
              }
            }

            // Dry-run mode: validate but don't create
            if (dryRun) {
              result.successCount++;
              result.imported.push({
                row,
                id: -1, // Placeholder ID for dry-run
                name: clientDto.name,
                email: clientDto.email,
              });
              continue;
            }

            // Create client
            const created = await this.create(clientDto, tenantId);

            result.successCount++;
            result.imported.push({
              row,
              id: created.id,
              name: created.name,
              email: created.email ?? undefined,
            });
          } catch (error: any) {
            this.logger.warn(`Failed to import client at row ${row}: ${error.message}`);
            result.failedCount++;
            result.errors.push({
              row,
              client: clientDto,
              error: error.message || 'Unknown error',
            });
          }
        }

        // Log progress for large imports
        if (clients.length > 100) {
          this.logger.log(
            `Processed ${Math.min(i + batchSize, clients.length)}/${clients.length} clients`
          );
        }
      }
    }

    this.logger.log(
      `Bulk import completed: ${result.successCount} succeeded, ` +
      `${result.failedCount} failed, ${result.skippedCount} skipped`
    );

    return result;
  }
}
