import { Controller, Get, HttpStatus, HttpException, Inject, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
    const checks: Record<string, string> = {};
    const errors: string[] = [];

    // Check database connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      errors.push(
        `Database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Check Redis cache connection (optional - don't fail if Redis is down)
    try {
      const testKey = 'health_check_test';
      const testValue = 'ok';

      await this.cacheManager.set(testKey, testValue, 1000); // 1 second TTL
      const retrieved = await this.cacheManager.get(testKey);

      if (retrieved === testValue) {
        checks.cache = 'connected';
      } else {
        checks.cache = 'degraded';
        this.logger.warn('Cache health check: value mismatch');
      }

      await this.cacheManager.del(testKey);
    } catch (error) {
      // Cache is optional, so we mark it as unavailable but don't fail the readiness check
      checks.cache = 'unavailable (using fallback)';
      this.logger.debug(
        `Cache health check failed (this is OK): ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // If database is down, service is not ready
    if (checks.database !== 'connected') {
      throw new HttpException(
        {
          status: 'not ready',
          timestamp,
          checks,
          errors,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Service is ready if database is up (cache is optional)
    return {
      status: 'ready',
      timestamp,
      checks,
    };
  }
}
