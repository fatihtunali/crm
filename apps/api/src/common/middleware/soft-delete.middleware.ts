/**
 * Issue #33: Prisma Soft Delete Middleware
 *
 * This Prisma middleware automatically filters out soft-deleted records
 * from all queries and converts delete operations to updates.
 *
 * Add this to your Prisma service:
 *
 * @example
 * import { applySoftDeleteMiddleware } from './common/middleware/soft-delete.middleware';
 *
 * export class PrismaService extends PrismaClient implements OnModuleInit {
 *   async onModuleInit() {
 *     await this.$connect();
 *     applySoftDeleteMiddleware(this);
 *   }
 * }
 */

import { Prisma } from '@prisma/client';

const SOFT_DELETE_MODELS = ['User', 'Client', 'Vendor', 'ServiceOffering'];

export function applySoftDeleteMiddleware(prisma: any): void {
  prisma.$use(async (params: any, next: any) => {
    // Convert delete to update for soft delete models
    if (params.action === 'delete' && SOFT_DELETE_MODELS.includes(params.model)) {
      params.action = 'update';
      params.args['data'] = {
        isActive: false,
        deletedAt: new Date(),
      };
    }

    // Convert deleteMany to updateMany for soft delete models
    if (params.action === 'deleteMany' && SOFT_DELETE_MODELS.includes(params.model)) {
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data['isActive'] = false;
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = {
          isActive: false,
          deletedAt: new Date(),
        };
      }
    }

    // Filter out soft-deleted records from all find operations
    if (
      SOFT_DELETE_MODELS.includes(params.model) &&
      (params.action === 'findUnique' ||
        params.action === 'findFirst' ||
        params.action === 'findMany' ||
        params.action === 'count' ||
        params.action === 'aggregate')
    ) {
      // Add deletedAt: null filter if not explicitly querying for deleted records
      if (!params.args) {
        params.args = {};
      }

      if (!params.args.where) {
        params.args.where = {};
      }

      // Only filter if deletedAt is not already specified
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }

    return next(params);
  });
}

/**
 * Hard delete function - use when you really need to remove data
 */
export async function hardDelete(prisma: any, model: string, where: any): Promise<any> {
  // Execute raw query to bypass middleware
  const modelName = model.toLowerCase();
  const ids = await prisma[modelName].findMany({
    where,
    select: { id: true },
  });

  if (ids.length === 0) {
    return { count: 0 };
  }

  // Use raw query to actually delete
  const tableName = `${modelName}s`; // Simple pluralization
  const idsArray = ids.map((item: any) => item.id);

  return prisma.$executeRawUnsafe(
    `DELETE FROM "${tableName}" WHERE id = ANY($1::int[])`,
    idsArray,
  );
}
