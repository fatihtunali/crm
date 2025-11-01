import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(async () => {
  // Ensure we're using test database
  if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error(
      'SAFETY CHECK FAILED: DATABASE_URL must contain "_test" to prevent accidentally using dev/prod database!',
    );
  }

  console.log('✅ Test database configured');

  // Note: Migrations should be run manually before tests
  // Run: npx dotenv -e .env.test -- npx prisma migrate deploy
});

afterAll(async () => {
  console.log('🧹 Test cleanup completed');
});

// Increase timeout for database operations
jest.setTimeout(30000);
