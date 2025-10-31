import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: {
      name: 'Demo Tour Agency',
      code: 'DEMO',
      defaultCurrency: 'EUR',
      email: 'info@demotour.com',
      phone: '+90 212 123 4567',
      address: 'Istanbul, Turkey',
      taxId: 'TR1234567890',
      isActive: true,
    },
  });

  console.log('✅ Tenant created:', tenant.name);

  // Create super admin
  const adminPassword = await argon2.hash(process.env.SUPER_ADMIN_PASSWORD || 'Admin123!');

  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: process.env.SUPER_ADMIN_EMAIL || 'admin@tourcrm.com',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@tourcrm.com',
      passwordHash: adminPassword,
      role: 'OWNER',
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', admin.email);

  // Create some demo users
  const operationsPassword = await argon2.hash('Operations123!');
  const operations = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'operations@tourcrm.com',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Operations Manager',
      email: 'operations@tourcrm.com',
      passwordHash: operationsPassword,
      role: 'OPERATIONS',
      isActive: true,
    },
  });

  console.log('✅ Operations user created:', operations.email);

  // Create exchange rates for the past 30 days
  const today = new Date();
  const rates = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Simulate realistic TRY/EUR rate (around 30-32)
    const baseRate = 31.5;
    const variation = (Math.random() - 0.5) * 2; // ±1 variation
    const rate = baseRate + variation;

    rates.push({
      tenantId: tenant.id,
      fromCurrency: 'TRY',
      toCurrency: 'EUR',
      rate: parseFloat(rate.toFixed(4)),
      rateDate: date,
      source: 'manual',
    });
  }

  await prisma.exchangeRate.createMany({
    data: rates,
    skipDuplicates: true,
  });

  console.log('✅ Exchange rates created for past 30 days');

  // Create some demo vendors
  const hotelVendor = await prisma.vendor.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Grand Istanbul Hotel',
      type: 'HOTEL',
      contactName: 'Mehmet Yılmaz',
      phone: '+90 212 555 1234',
      email: 'reservations@grandistanbul.com',
      address: 'Sultanahmet, Istanbul',
      taxId: 'TR9876543210',
      isActive: true,
    },
  });

  console.log('✅ Hotel vendor created:', hotelVendor.name);

  const guideVendor = await prisma.vendor.upsert({
    where: {
      id: 2,
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Istanbul Professional Guides',
      type: 'GUIDE',
      contactName: 'Ayşe Demir',
      phone: '+90 532 111 2233',
      email: 'info@istanbulguides.com',
      isActive: true,
    },
  });

  console.log('✅ Guide vendor created:', guideVendor.name);

  // Create demo tour
  const tour = await prisma.tour.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'IST-3D',
      name: 'Istanbul Classic 3 Days',
      description: 'Discover the heart of Istanbul in 3 amazing days',
      baseCapacity: 2,
      seasonStart: new Date('2025-04-01'),
      seasonEnd: new Date('2025-10-31'),
      defaultMarkupPct: 25.0,
      isActive: true,
    },
  });

  console.log('✅ Demo tour created:', tour.name);

  // Create itinerary for the tour
  await prisma.itinerary.createMany({
    data: [
      {
        tenantId: tenant.id,
        tourId: tour.id,
        dayNumber: 1,
        title: 'Arrival & Old City',
        description: 'Airport pickup, hotel check-in, Sultanahmet walking tour',
        transport: 'Private transfer',
        accommodation: 'Grand Istanbul Hotel',
        meals: 'Dinner',
      },
      {
        tenantId: tenant.id,
        tourId: tour.id,
        dayNumber: 2,
        title: 'Bosphorus & Palaces',
        description: 'Bosphorus cruise, Dolmabahçe Palace, Spice Bazaar',
        transport: 'Private car',
        accommodation: 'Grand Istanbul Hotel',
        meals: 'Breakfast, Lunch',
      },
      {
        tenantId: tenant.id,
        tourId: tour.id,
        dayNumber: 3,
        title: 'Grand Bazaar & Departure',
        description: 'Grand Bazaar shopping, airport transfer',
        transport: 'Private transfer',
        accommodation: null,
        meals: 'Breakfast',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Tour itinerary created (3 days)');

  // Create vendor rates
  await prisma.vendorRate.createMany({
    data: [
      {
        tenantId: tenant.id,
        vendorId: hotelVendor.id,
        seasonFrom: new Date('2025-04-01'),
        seasonTo: new Date('2025-10-31'),
        serviceType: 'Double Room per night',
        costTry: 4500.0,
      },
      {
        tenantId: tenant.id,
        vendorId: guideVendor.id,
        seasonFrom: new Date('2025-04-01'),
        seasonTo: new Date('2025-10-31'),
        serviceType: 'Full Day Guide (English)',
        costTry: 3000.0,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Vendor rates created');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seeding completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Email: admin@tourcrm.com');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('   Email: operations@tourcrm.com');
  console.log('   Password: Operations123!');
  console.log('');
  console.log('🏢 Tenant: Demo Tour Agency (Code: DEMO)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
