import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('healthz')
  @ApiOperation({ summary: 'Liveness probe - Check if application is running' })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  healthz() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readyz')
  @ApiOperation({
    summary: 'Readiness probe - Check if application is ready to serve traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ready' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        checks: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'connected' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'not ready' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        checks: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'disconnected' },
          },
        },
        error: { type: 'string', example: 'Database connection failed' },
      },
    },
  })
  async readyz() {
    const timestamp = new Date().toISOString();

    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp,
        checks: {
          database: 'connected',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'not ready',
          timestamp,
          checks: {
            database: 'disconnected',
          },
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
