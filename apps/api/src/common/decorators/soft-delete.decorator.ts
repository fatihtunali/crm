import { SetMetadata } from '@nestjs/common';

/**
 * Issue #33: Soft Delete Decorator
 *
 * Mark a controller or method to use soft delete instead of hard delete.
 * Entities with isActive and deletedAt fields will be marked as deleted
 * instead of being removed from the database.
 *
 * @example
 * @SoftDelete()
 * @Delete(':id')
 * remove(@Param('id') id: string) {
 *   return this.service.remove(+id, tenantId);
 * }
 */
export const SOFT_DELETE_KEY = 'softDelete';
export const SoftDelete = () => SetMetadata(SOFT_DELETE_KEY, true);
