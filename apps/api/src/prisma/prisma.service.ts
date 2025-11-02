import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Configure Prisma with connection pooling and query timeout
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    });

    // Add query timeout extension (30 seconds)
    return new Proxy(this, {
      get: (target, prop) => {
        const original = target[prop as keyof typeof target];

        // Only wrap Prisma model operations
        if (typeof original === 'object' && original !== null) {
          return new Proxy(original, {
            get: (modelTarget, modelProp) => {
              const modelMethod = modelTarget[modelProp as keyof typeof modelTarget];

              if (typeof modelMethod === 'function') {
                return async (...args: any[]) => {
                  const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Query timeout: exceeded 30 seconds')), 30000)
                  );

                  const query = modelMethod.apply(modelTarget, args);

                  const startTime = Date.now();
                  try {
                    const result = await Promise.race([query, timeout]);
                    const duration = Date.now() - startTime;

                    // Log slow queries in development
                    if (duration > 1000 && process.env.NODE_ENV === 'development') {
                      this.logger.warn(`Slow query detected: ${String(prop)}.${String(modelProp)} took ${duration}ms`);
                    }

                    return result;
                  } catch (error) {
                    throw error;
                  }
                };
              }

              return modelMethod;
            },
          });
        }

        return original;
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected with connection pooling enabled');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  /**
   * Clean up all data (for testing)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && key[0] !== '_' && key !== '$connect' && key !== '$disconnect'
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof PrismaService];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as any).deleteMany();
        }
      })
    );
  }
}
