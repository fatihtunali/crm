import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheModule');
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        const redisTtl = configService.get<number>('REDIS_TTL', 600); // 10 minutes default
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');

        // Try to connect to Redis if configured
        const redisUrl = `redis://${redisHost}:${redisPort}`;

        try {
          // Attempt to create Redis store
          const store = new Keyv({
            store: new KeyvRedis(redisUrl),
            namespace: 'tourcrm',
          });

          // Test connection
          await store.get('test');

          logger.log(`✅ Redis cache connected at ${redisUrl}`);

          return {
            store: () => store,
            ttl: redisTtl * 1000, // Convert to milliseconds
            isGlobal: true,
          };
        } catch (error) {
          logger.warn(
            `⚠️  Redis connection failed at ${redisUrl}. Falling back to in-memory cache.`,
          );

          if (nodeEnv === 'development') {
            logger.debug(`Redis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

          // Fallback to in-memory cache (no store specified = memory cache)
          return {
            ttl: redisTtl * 1000,
            isGlobal: true,
            max: 100, // Maximum number of items in memory cache
          };
        }
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
