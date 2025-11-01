import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding sample supplier catalog data...');

  // Get the tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    throw new Error('No tenant found. Run main seed first.');
  }

  // Get transport supplier (or create one)
  let transportSupplier = await prisma.supplier.findFirst({
    where: { tenantId: tenant.id, type: 'TRANSPORT' },
  });

  if (!transportSupplier) {
    // Create a party and supplier
    const party = await prisma.party.create({
      data: {
        tenantId: tenant.id,
        name: 'Istanbul Premium Transfers',
        taxId: 'TR9876543210',
        type: 'COMPANY',
      },
    });

    transportSupplier = await prisma.supplier.create({
      data: {
        tenantId: tenant.id,
        partyId: party.id,
        type: 'TRANSPORT',
        paymentTerms: 'Net 30',
        isActive: true,
      },
    });

    console.log('✅ Created transport supplier');
  }

  // TRANSFERS: Istanbul Airport to various zones
  const transferData = [
    {
      title: 'Istanbul Airport (IST) to Sultanahmet - VITO',
      city: 'Istanbul',
      originZone: 'Istanbul Airport (IST)',
      destZone: 'Sultanahmet',
      vehicleClass: 'VITO',
      maxPassengers: 4,
      baseCost: 120.0,
    },
    {
      title: 'Istanbul Airport (IST) to Sultanahmet - SPRINTER',
      city: 'Istanbul',
      originZone: 'Istanbul Airport (IST)',
      destZone: 'Sultanahmet',
      vehicleClass: 'SPRINTER',
      maxPassengers: 12,
      baseCost: 180.0,
    },
    {
      title: 'Istanbul Airport (IST) to Sultanahmet - ISUZU',
      city: 'Istanbul',
      originZone: 'Istanbul Airport (IST)',
      destZone: 'Sultanahmet',
      vehicleClass: 'ISUZU',
      maxPassengers: 20,
      baseCost: 220.0,
    },
    {
      title: 'Istanbul Airport (IST) to Sultanahmet - COACH',
      city: 'Istanbul',
      originZone: 'Istanbul Airport (IST)',
      destZone: 'Sultanahmet',
      vehicleClass: 'COACH',
      maxPassengers: 44,
      baseCost: 350.0,
    },
    {
      title: 'Istanbul Airport (IST) to Taksim - VITO',
      city: 'Istanbul',
      originZone: 'Istanbul Airport (IST)',
      destZone: 'Taksim',
      vehicleClass: 'VITO',
      maxPassengers: 4,
      baseCost: 100.0,
    },
    {
      title: 'Istanbul Airport (IST) to Taksim - SPRINTER',
      city: 'Istanbul',
      originZone: 'Istanbul Airport (IST)',
      destZone: 'Taksim',
      vehicleClass: 'SPRINTER',
      maxPassengers: 12,
      baseCost: 150.0,
    },
  ];

  for (const transfer of transferData) {
    const offering = await prisma.serviceOffering.create({
      data: {
        tenantId: tenant.id,
        supplierId: transportSupplier.id,
        serviceType: 'TRANSFER',
        title: transfer.title,
        location: transfer.city,
        description: `Private transfer from ${transfer.originZone} to ${transfer.destZone} with ${transfer.vehicleClass} (max ${transfer.maxPassengers} passengers)`,
        isActive: true,
      },
    });

    await prisma.transfer.create({
      data: {
        serviceOfferingId: offering.id,
        city: transfer.city,
        originZone: transfer.originZone,
        destZone: transfer.destZone,
        transferType: 'PRIVATE',
        vehicleClass: transfer.vehicleClass,
        maxPassengers: transfer.maxPassengers,
        meetGreet: true,
        luggageAllowance: `${transfer.maxPassengers} large suitcases`,
        duration: 45,
        distance: 40.0,
        notes: 'Professional driver, English speaking',
      },
    });

    await prisma.transferRate.create({
      data: {
        tenantId: tenant.id,
        serviceOfferingId: offering.id,
        seasonFrom: new Date('2025-01-01'),
        seasonTo: new Date('2025-12-31'),
        pricingModel: 'PER_TRANSFER',
        baseCostTry: transfer.baseCost,
        includedKm: 50,
        includedHours: 2,
        extraKmTry: 2.5,
        extraHourTry: 25.0,
        isActive: true,
      },
    });

    console.log(`✅ Created transfer: ${transfer.title}`);
  }

  // VEHICLES: Vehicle hire with daily and hourly rates
  const vehicleData = [
    {
      title: 'VITO with Driver - Daily/Hourly Hire',
      make: 'Mercedes',
      model: 'Vito',
      vehicleClass: 'VITO',
      maxPassengers: 4,
      dailyRate: 2400.0,
      hourlyRate: 400.0,
    },
    {
      title: 'SPRINTER with Driver - Daily/Hourly Hire',
      make: 'Mercedes',
      model: 'Sprinter',
      vehicleClass: 'SPRINTER',
      maxPassengers: 12,
      dailyRate: 3600.0,
      hourlyRate: 500.0,
    },
    {
      title: 'ISUZU with Driver - Daily/Hourly Hire',
      make: 'Isuzu',
      model: 'NovoCiti',
      vehicleClass: 'ISUZU',
      maxPassengers: 20,
      dailyRate: 4800.0,
      hourlyRate: 650.0,
    },
    {
      title: 'COACH with Driver - Daily/Hourly Hire',
      make: 'Mercedes',
      model: 'Travego',
      vehicleClass: 'COACH',
      maxPassengers: 44,
      dailyRate: 7200.0,
      hourlyRate: 900.0,
    },
  ];

  for (const vehicle of vehicleData) {
    const offering = await prisma.serviceOffering.create({
      data: {
        tenantId: tenant.id,
        supplierId: transportSupplier.id,
        serviceType: 'VEHICLE_HIRE',
        title: vehicle.title,
        location: 'Istanbul',
        description: `${vehicle.make} ${vehicle.model} with professional driver - available for daily or hourly hire (max ${vehicle.maxPassengers} passengers)`,
        isActive: true,
      },
    });

    await prisma.vehicle.create({
      data: {
        serviceOfferingId: offering.id,
        make: vehicle.make,
        model: vehicle.model,
        year: 2023,
        vehicleClass: vehicle.vehicleClass,
        maxPassengers: vehicle.maxPassengers,
        transmission: 'Automatic',
        fuelType: 'Diesel',
        withDriver: true,
        features: { AC: true, GPS: true, WiFi: true },
        insuranceIncluded: true,
        notes: 'Professional driver included, fuel included, insurance covered',
      },
    });

    await prisma.vehicleRate.create({
      data: {
        tenantId: tenant.id,
        serviceOfferingId: offering.id,
        seasonFrom: new Date('2025-01-01'),
        seasonTo: new Date('2025-12-31'),
        dailyRateTry: vehicle.dailyRate,
        hourlyRateTry: vehicle.hourlyRate,
        minHours: 4,
        dailyKmIncluded: 200,
        extraKmTry: 3.0,
        driverDailyTry: 0, // Already included in base rate
        minRentalDays: 1,
        isActive: true,
      },
    });

    console.log(`✅ Created vehicle: ${vehicle.title}`);
  }

  console.log('\n✅ Sample data seeding complete!');
  console.log(`   - ${transferData.length} transfers created`);
  console.log(`   - ${vehicleData.length} vehicles created`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding sample data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
