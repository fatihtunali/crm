/**
 * Data Migration Script: Encrypt Existing Sensitive Data (Issue #25)
 *
 * This script encrypts existing plaintext sensitive data in the database.
 * It should be run ONCE after deploying the encryption feature.
 *
 * Usage:
 *   npx ts-node src/scripts/encrypt-existing-data.ts
 *
 * IMPORTANT:
 * - Backup your database before running this script!
 * - Ensure ENCRYPTION_KEY is set in .env
 * - This script is idempotent - it won't re-encrypt already encrypted data
 */

import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../common/services/encryption.service';

const prisma = new PrismaClient();
const encryptionService = new EncryptionService();

async function encryptExistingData() {
  console.log('🔐 Starting data encryption migration...\n');

  try {
    // Initialize encryption service
    (encryptionService as any).initializeKey();

    // Validate encryption is available
    encryptionService.validateEncryptionAvailable();

    // Encrypt Client data
    await encryptClients();

    // Encrypt Vendor data (legacy)
    await encryptVendors();

    // Encrypt Supplier (Party) data
    await encryptSuppliers();

    console.log('\n✅ Data encryption migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Encrypt sensitive fields in Client records
 */
async function encryptClients() {
  console.log('📋 Encrypting Client data...');

  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { passportNumber: { not: null } },
      ],
    },
  });

  console.log(`   Found ${clients.length} clients with sensitive data`);

  let encrypted = 0;
  let skipped = 0;

  for (const client of clients) {
    try {
      const updates: any = {};

      // Encrypt passport number if present and not already encrypted
      if (client.passportNumber && !encryptionService.isEncrypted(client.passportNumber)) {
        updates.passportNumber = encryptionService.encrypt(client.passportNumber);
      } else if (client.passportNumber) {
        skipped++;
        continue; // Already encrypted
      }

      if (Object.keys(updates).length > 0) {
        await prisma.client.update({
          where: { id: client.id },
          data: updates,
        });
        encrypted++;

        if (encrypted % 10 === 0) {
          console.log(`   Encrypted ${encrypted} clients...`);
        }
      }
    } catch (error) {
      console.error(`   Failed to encrypt client ${client.id}:`, error);
    }
  }

  console.log(`   ✅ Encrypted ${encrypted} clients, skipped ${skipped} (already encrypted)\n`);
}

/**
 * Encrypt sensitive fields in Vendor records (legacy)
 */
async function encryptVendors() {
  console.log('📋 Encrypting Vendor data (legacy)...');

  const vendors = await prisma.vendor.findMany({
    where: {
      taxId: { not: null },
    },
  });

  console.log(`   Found ${vendors.length} vendors with tax IDs`);

  let encrypted = 0;
  let skipped = 0;

  for (const vendor of vendors) {
    try {
      if (vendor.taxId && !encryptionService.isEncrypted(vendor.taxId)) {
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            taxId: encryptionService.encrypt(vendor.taxId),
          },
        });
        encrypted++;

        if (encrypted % 10 === 0) {
          console.log(`   Encrypted ${encrypted} vendors...`);
        }
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`   Failed to encrypt vendor ${vendor.id}:`, error);
    }
  }

  console.log(`   ✅ Encrypted ${encrypted} vendors, skipped ${skipped} (already encrypted)\n`);
}

/**
 * Encrypt sensitive fields in Supplier (Party) records
 */
async function encryptSuppliers() {
  console.log('📋 Encrypting Supplier (Party) data...');

  const parties = await prisma.party.findMany({
    where: {
      taxId: { not: null },
    },
  });

  console.log(`   Found ${parties.length} parties with tax IDs`);

  let encrypted = 0;
  let skipped = 0;

  for (const party of parties) {
    try {
      if (party.taxId && !encryptionService.isEncrypted(party.taxId)) {
        await prisma.party.update({
          where: { id: party.id },
          data: {
            taxId: encryptionService.encrypt(party.taxId),
          },
        });
        encrypted++;

        if (encrypted % 10 === 0) {
          console.log(`   Encrypted ${encrypted} parties...`);
        }
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`   Failed to encrypt party ${party.id}:`, error);
    }
  }

  console.log(`   ✅ Encrypted ${encrypted} parties, skipped ${skipped} (already encrypted)\n`);
}

// Run the migration
encryptExistingData()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
