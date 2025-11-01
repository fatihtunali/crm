# API Testing Guide

This directory contains comprehensive End-to-End (E2E) tests for the Tour Operator CRM API.

## Test Coverage

### ✅ Authentication Tests (`auth.e2e-spec.ts`)
- Login with valid/invalid credentials
- Inactive user/tenant validation
- Token generation and refresh
- Profile retrieval
- Last login tracking

### ✅ Booking Workflow Tests (`booking-workflow.e2e-spec.ts`)
- Complete quotation → booking flow
- Exchange rate locking
- P&L calculation
- Booking search and filters
- Status transitions

### ✅ Multi-Tenancy Tests (`multi-tenancy.e2e-spec.ts`)
- Complete data isolation between tenants
- Preventing cross-tenant data access
- JWT tenant validation
- Cascade deletion

### ✅ Payment Tests (`payments.e2e-spec.ts`)
- Idempotency for duplicate prevention
- Client payment processing
- Cross-tenant payment isolation
- Payment statistics

## Prerequisites

### 1. Test Database Setup

**IMPORTANT:** Tests use a separate database to prevent data corruption.

```bash
# Create test database
psql -U tourcrm -c "CREATE DATABASE tour_crm_test;"
```

The test database URL is configured in `.env.test` file.

### 2. Environment Configuration

The `.env.test` file contains test-specific configuration:
- Separate database (`tour_crm_test`)
- Test JWT secrets
- Disabled external services (email, SMS)

**Never run tests against production or development databases!**

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npm run test:e2e -- auth.e2e-spec.ts
npm run test:e2e -- booking-workflow.e2e-spec.ts
npm run test:e2e -- multi-tenancy.e2e-spec.ts
npm run test:e2e -- payments.e2e-spec.ts
```

### Run with Coverage
```bash
npm run test:e2e:cov
```

### Watch Mode (for development)
```bash
npm run test:e2e:watch
```

## Test Structure

### Setup Phase (`setup.ts`)
- Loads `.env.test` environment variables
- Safety check: Ensures test database is used
- Resets database before all tests
- Runs migrations

### Test Utilities (`helpers/test-utils.ts`)
Helper functions for creating test data:
- `createTestApp()` - Initialize NestJS app
- `createAuthenticatedUser()` - Create user and get JWT token
- `createTestClient()` - Create test client
- `createTestLead()` - Create test lead
- `createTestQuotation()` - Create test quotation
- `createTestExchangeRate()` - Create exchange rate
- `cleanDatabase()` - Clean all test data

### Individual Test Files
Each test file focuses on specific functionality:
- `auth.e2e-spec.ts` - Authentication & Authorization
- `booking-workflow.e2e-spec.ts` - Business workflows
- `multi-tenancy.e2e-spec.ts` - Data isolation
- `payments.e2e-spec.ts` - Payment processing

## Writing New Tests

### Example Test Structure

```typescript
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  closeTestApp,
  cleanDatabase,
  createAuthenticatedUser,
} from './helpers/test-utils';

describe('Feature Name (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  describe('Endpoint Name', () => {
    it('should do something', async () => {
      const { token, tenantId } = await createAuthenticatedUser(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/your-endpoint')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('expectedField');
    });
  });
});
```

## Best Practices

### 1. Database Cleanup
Always clean database between tests using `beforeEach`:
```typescript
beforeEach(async () => {
  await cleanDatabase(prisma);
});
```

### 2. Use Test Utilities
Don't create test data manually - use helpers:
```typescript
// ❌ Bad
const user = await prisma.user.create({ data: {...} });

// ✅ Good
const { token, tenantId } = await createAuthenticatedUser(app);
```

### 3. Test Isolation
Each test should be independent:
- Don't rely on test execution order
- Clean up between tests
- Use unique identifiers

### 4. Descriptive Test Names
```typescript
// ❌ Bad
it('works', async () => {});

// ✅ Good
it('should prevent accessing another tenant\'s clients', async () => {});
```

### 5. Test Edge Cases
- Valid inputs ✅
- Invalid inputs ✅
- Missing data ✅
- Unauthorized access ✅
- Boundary conditions ✅

## Debugging Tests

### Run Single Test
```bash
npm run test:e2e -- --testNamePattern="should login successfully"
```

### Enable Debug Mode
```bash
npm run test:debug
```

Then attach debugger in VS Code (press F5).

### View Database State
```bash
# Connect to test database
psql -U tourcrm -d tour_crm_test

# View data
\dt  # List tables
SELECT * FROM users;
SELECT * FROM tenants;
```

## Common Issues

### Issue: "DATABASE_URL must contain _test"
**Cause:** Test is trying to use non-test database
**Solution:** Check `.env.test` has correct `DATABASE_URL`

### Issue: "Table does not exist"
**Cause:** Migrations not run on test database
**Solution:** Run `npx prisma migrate deploy` with test env

### Issue: Tests timeout
**Cause:** Database operations taking too long
**Solution:** Increase timeout in `jest-e2e.json`:
```json
{
  "testTimeout": 30000
}
```

### Issue: Random test failures
**Cause:** Tests not isolated, shared state
**Solution:** Ensure `cleanDatabase()` in `beforeEach`

## Performance Tips

1. **Run tests in parallel** (when independent):
   ```json
   "maxWorkers": 4
   ```

2. **Use transactions** for faster cleanup:
   ```typescript
   await prisma.$transaction([
     prisma.client.deleteMany(),
     prisma.user.deleteMany(),
   ]);
   ```

3. **Seed once, clean between tests**:
   - Create common data in `beforeAll`
   - Clean only test-specific data in `beforeEach`

## Coverage Goals

- **Critical paths:** 100% (auth, payments, bookings)
- **Business logic:** 90%
- **Controllers:** 80%
- **Overall:** 70%+

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Next Steps

1. **Add more test files** for uncovered modules
2. **Increase coverage** to 80%+
3. **Add performance tests** for critical endpoints
4. **Add integration tests** for external services
5. **Set up CI/CD** for automated testing

## Getting Help

- Review existing tests for patterns
- Check `test-utils.ts` for available helpers
- See NestJS testing docs: https://docs.nestjs.com/fundamentals/testing
- Ask team for test reviews

---

**Remember:** Good tests are an investment in code quality and confidence!
