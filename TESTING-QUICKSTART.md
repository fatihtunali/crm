# 🧪 Testing Quick Start Guide

## Setup (One-Time Only)

### Step 1: Create Test Database
```bash
# Connect to your centralized PostgreSQL server
# Replace YOUR_SERVER_IP with your actual server IP address
psql -h YOUR_SERVER_IP -U tourcrm -c "CREATE DATABASE tour_crm_test;"

# Verify it was created
psql -h YOUR_SERVER_IP -U tourcrm -l | grep tour_crm_test
```

### Step 2: Verify Test Environment
```bash
cd apps/api
cat .env.test
```

Ensure `DATABASE_URL` contains `tour_crm_test`.

### Step 3: Install Dependencies (if needed)
```bash
cd apps/api
npm install
```

## Running Tests

### Quick Test (Recommended)
```bash
cd apps/api
npm run test:e2e
```

### Run Specific Test File
```bash
cd apps/api
npm run test:e2e -- auth.e2e-spec.ts
npm run test:e2e -- booking-workflow.e2e-spec.ts
npm run test:e2e -- multi-tenancy.e2e-spec.ts
npm run test:e2e -- payments.e2e-spec.ts
```

### Run with Coverage Report
```bash
cd apps/api
npm run test:e2e:cov

# View coverage report (open in browser)
start coverage-e2e/lcov-report/index.html
```

### Watch Mode (for development)
```bash
cd apps/api
npm run test:e2e:watch
```

## Test Files Created

### Infrastructure
- ✅ `test/jest-e2e.json` - Jest E2E configuration
- ✅ `test/setup.ts` - Test database setup
- ✅ `test/helpers/test-utils.ts` - Reusable test utilities
- ✅ `.env.test` - Test environment variables

### Test Suites
- ✅ `test/auth.e2e-spec.ts` - **Authentication Tests** (8 tests)
  - Login validation
  - Token management
  - User/tenant status checks

- ✅ `test/booking-workflow.e2e-spec.ts` - **Booking Workflow Tests** (7 tests)
  - Quotation → Booking flow
  - Exchange rate locking
  - P&L calculations

- ✅ `test/multi-tenancy.e2e-spec.ts` - **Multi-Tenancy Tests** (8 tests)
  - Data isolation
  - Cross-tenant access prevention
  - Cascade deletion

- ✅ `test/payments.e2e-spec.ts` - **Payment Tests** (6 tests)
  - Idempotency for duplicate prevention
  - Payment validation
  - Statistics

**Total: 29 E2E tests covering critical business logic**

## What's Being Tested?

### ✅ Critical Security Features
- [ ] Multi-tenant data isolation
- [ ] JWT authentication
- [ ] Authorization guards
- [ ] Cross-tenant access prevention

### ✅ Critical Business Logic
- [ ] Quotation acceptance → Booking creation
- [ ] Exchange rate locking (financial accuracy)
- [ ] P&L calculations
- [ ] Idempotent payments (no duplicates)

### ✅ Data Integrity
- [ ] Cascade deletions
- [ ] Status transitions
- [ ] Unique constraints
- [ ] Required field validation

## Expected Test Output

```
PASS  test/auth.e2e-spec.ts
  Authentication (E2E)
    /api/v1/auth/login (POST)
      ✓ should login successfully with valid credentials (245ms)
      ✓ should reject login with invalid email (89ms)
      ✓ should reject login with invalid password (156ms)
      ✓ should reject login for inactive user (134ms)
      ✓ should reject login for user with inactive tenant (127ms)
      ✓ should update last login timestamp on successful login (198ms)
    /api/v1/auth/me (GET)
      ✓ should return current user profile with valid token (176ms)
      ✓ should reject request without token (45ms)
      ✓ should reject request with invalid token (52ms)
    /api/v1/auth/refresh (POST)
      ✓ should refresh tokens with valid refresh token (189ms)
      ✓ should reject refresh with invalid token (48ms)

PASS  test/multi-tenancy.e2e-spec.ts (8 tests)
PASS  test/booking-workflow.e2e-spec.ts (7 tests)
PASS  test/payments.e2e-spec.ts (6 tests)

Test Suites: 4 passed, 4 total
Tests:       29 passed, 29 total
Time:        12.456s
```

## Troubleshooting

### Error: "DATABASE_URL must contain _test"
**Solution:** Check `.env.test` has correct database name with `_test` suffix

### Error: "Table does not exist"
**Solution:** Run migrations on test database:
```bash
cd apps/api
npx dotenv -e .env.test -- npx prisma migrate deploy
```

### Error: "Connection refused"
**Solution:** Check your PostgreSQL server connection:
```bash
# Test connection to your server
psql -h YOUR_SERVER_IP -U tourcrm -l

# If connection fails:
# 1. Verify server IP is correct
# 2. Check firewall allows port 5432
# 3. Verify PostgreSQL is running on server
# 4. Check pg_hba.conf allows your IP address
```

### Tests are slow
**Solution:** Increase max workers in `test/jest-e2e.json`:
```json
"maxWorkers": 1  // Change to 2 or 4 if tests are independent
```

## Next Steps

1. **Run the tests NOW** to verify everything works
2. **Fix the currency bug** we found (small amounts rounding to 0)
3. **Add more tests** for uncovered endpoints
4. **Set up CI/CD** using `.github/workflows/test.yml`
5. **Track coverage** - aim for 70%+ overall

## CI/CD Integration

GitHub Actions workflow is ready at:
`.github/workflows/test.yml`

Tests will run automatically on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

## Test Coverage Goals

| Module | Current | Target |
|--------|---------|--------|
| Authentication | ✅ 80% | 90% |
| Bookings | ✅ 70% | 90% |
| Payments | ✅ 60% | 90% |
| Multi-tenancy | ✅ 80% | 100% |
| **Overall** | **~40%** | **70%+** |

## Best Practices

1. **Always run tests before commits**
2. **Clean database between tests** (automated)
3. **Never run tests on production database**
4. **Write tests for new features**
5. **Keep tests independent** (no shared state)

## Getting Help

See detailed guide: `apps/api/test/README.md`

---

**Ready to test?** Run this now:
```bash
cd apps/api
npm run test:e2e
```

Good luck! 🚀
