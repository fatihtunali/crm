# Migration Guide: Business Logic Validations

## Quick Start

```bash
# 1. Navigate to API directory
cd apps/api

# 2. Review the migration file
cat prisma/migrations/20251102000000_add_capacity_and_soft_delete_fields/migration.sql

# 3. Apply the migration (production)
npx prisma migrate deploy

# 4. Generate Prisma client
npx prisma generate

# 5. Restart API server
npm run start:prod
```

## Migration Details

**Migration Name:** `20251102000000_add_capacity_and_soft_delete_fields`

**What it does:**
- Adds `min_participants` and `max_participants` to `activities` table
- Adds `deleted_at` timestamp to `users`, `clients`, `vendors`, `service_offerings` tables
- Creates indexes on `deleted_at` columns for performance

**Safe to re-run:** ✅ Yes (uses `IF NOT EXISTS`)

## Rollback (if needed)

```sql
-- Rollback script (run in psql if migration fails)

-- Remove capacity fields
ALTER TABLE "activities" DROP COLUMN IF EXISTS "min_participants";
ALTER TABLE "activities" DROP COLUMN IF EXISTS "max_participants";

-- Remove soft delete fields
ALTER TABLE "users" DROP COLUMN IF EXISTS "deleted_at";
DROP INDEX IF EXISTS "users_deleted_at_idx";

ALTER TABLE "clients" DROP COLUMN IF EXISTS "deleted_at";
DROP INDEX IF EXISTS "clients_deleted_at_idx";

ALTER TABLE "vendors" DROP COLUMN IF EXISTS "deleted_at";
DROP INDEX IF EXISTS "vendors_deleted_at_idx";

ALTER TABLE "service_offerings" DROP COLUMN IF EXISTS "deleted_at";
DROP INDEX IF EXISTS "service_offerings_deleted_at_idx";
```

## Post-Migration Steps

### 1. Enable Soft Delete Middleware (REQUIRED)

**File:** `apps/api/src/prisma/prisma.service.ts`

Add this import and call:

```typescript
import { applySoftDeleteMiddleware } from '../common/middleware/soft-delete.middleware';

export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    applySoftDeleteMiddleware(this); // <-- Add this line
  }
}
```

### 2. Set Capacity Limits (RECOMMENDED)

Update existing records to set capacity limits:

```sql
-- Example: Set hotel room capacities based on room type
UPDATE hotel_rooms
SET max_occupancy = CASE
  WHEN room_type = 'DBL' THEN 2
  WHEN room_type = 'TWN' THEN 2
  WHEN room_type = 'TRP' THEN 3
  WHEN room_type = 'SUITE' THEN 4
  ELSE 2
END
WHERE max_occupancy IS NULL OR max_occupancy = 0;

-- Example: Set vehicle capacities based on class
UPDATE vehicles
SET max_passengers = CASE
  WHEN vehicle_class = 'VITO' THEN 4
  WHEN vehicle_class = 'SPRINTER' THEN 12
  WHEN vehicle_class = 'ISUZU' THEN 20
  WHEN vehicle_class = 'COACH' THEN 44
  ELSE 4
END;

-- Example: Set activity limits
UPDATE activities
SET
  min_participants = 2,
  max_participants = 20
WHERE min_participants IS NULL;
```

### 3. Test Validations

Run these test cases to verify:

```bash
# Test 1: Exchange rate validation
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clientId": 1,
    "bookingCode": "TEST-001",
    "startDate": "2025-12-01",
    "endDate": "2025-12-10"
  }'
# Expected: Error if no exchange rate exists

# Test 2: Capacity validation
curl -X POST http://localhost:3000/api/pricing/quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "serviceOfferingId": 1,
    "pax": 10,
    "serviceDate": "2025-12-01"
  }'
# Expected: Error if pax exceeds capacity

# Test 3: Soft delete
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: Success
# Verify: User should have deletedAt set, not actually deleted
```

## Monitoring

### Check Migration Status

```bash
# View applied migrations
npx prisma migrate status

# View migration history
ls -la prisma/migrations/
```

### Verify Database Changes

```sql
-- Check if new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('activities', 'users', 'clients', 'vendors', 'service_offerings')
  AND column_name IN ('min_participants', 'max_participants', 'deleted_at')
ORDER BY table_name, column_name;

-- Check if indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE '%deleted_at%';
```

## Troubleshooting

### Migration Fails with "column already exists"

This is safe - migration uses `IF NOT EXISTS`. The migration has likely already been applied.

**Solution:**
```bash
# Mark migration as applied
npx prisma migrate resolve --applied 20251102000000_add_capacity_and_soft_delete_fields
```

### Migration Fails with Permission Error

**Solution:** Ensure database user has ALTER TABLE privileges:

```sql
GRANT ALTER ON ALL TABLES IN SCHEMA public TO your_database_user;
```

### Soft Delete Not Working

**Solution:** Ensure middleware is applied in PrismaService:

```typescript
// apps/api/src/prisma/prisma.service.ts
import { applySoftDeleteMiddleware } from '../common/middleware/soft-delete.middleware';

async onModuleInit() {
  await this.$connect();
  applySoftDeleteMiddleware(this); // Must have this
}
```

### Capacity Validation Not Triggering

**Possible causes:**
1. Capacity fields not set in database (NULL values)
2. Validation only applies when capacity is set
3. Using old Prisma client

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Restart server
npm run start:prod

# Set capacity limits in database (see SQL above)
```

## Rollback Strategy

If issues occur after deployment:

1. **Immediate:** Disable soft delete middleware
   ```typescript
   // Comment out in PrismaService
   // applySoftDeleteMiddleware(this);
   ```

2. **Short-term:** Disable validations
   ```typescript
   // In respective service files, comment out validation blocks
   ```

3. **Full rollback:** Run rollback SQL (see above) and revert code

## Performance Impact

**Expected:**
- Minimal query overhead due to indexes on `deleted_at`
- Overlap detection adds 1 query per rate creation (acceptable)
- Capacity checks are in-memory (no DB query)

**Monitor:**
- Query execution times for user/client/vendor queries
- Rate creation performance
- Overall API response times

## Success Criteria

✅ Migration applied successfully
✅ No errors in API logs
✅ Exchange rate validation working (booking creation fails without rate)
✅ Capacity validation working (quotes fail when over capacity)
✅ Soft delete working (deleted records have deletedAt timestamp)
✅ Deleted records not appearing in normal queries
✅ No performance degradation

## Support

If issues occur:
1. Check API error logs
2. Verify migration status: `npx prisma migrate status`
3. Check database schema matches expectations
4. Review IMPLEMENTATION_SUMMARY.md for detailed changes
5. Test individual validations in isolation

---

**Created:** 2025-11-02
**Migration File:** `apps/api/prisma/migrations/20251102000000_add_capacity_and_soft_delete_fields/migration.sql`
