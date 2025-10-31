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

  // ============================================
  // SUPPLIER CATALOG SYSTEM SEED DATA
  // ============================================
  console.log('');
  console.log('🏪 Seeding Supplier Catalog System...');

  // Create Parties (Companies)
  const hotelChain1 = await prisma.party.create({
    data: {
      tenantId: tenant.id,
      name: 'Luxury Hotels Istanbul Group',
      taxId: 'TR1111111111',
      address: 'Taksim Square, Beyoğlu',
      city: 'Istanbul',
      country: 'Turkey',
      isActive: true,
    },
  });

  const hotelChain2 = await prisma.party.create({
    data: {
      tenantId: tenant.id,
      name: 'Cappadocia Cave Hotels Ltd',
      taxId: 'TR2222222222',
      address: 'Göreme Town Center',
      city: 'Nevşehir',
      country: 'Turkey',
      isActive: true,
    },
  });

  const transportCompany = await prisma.party.create({
    data: {
      tenantId: tenant.id,
      name: 'Bosphorus Transfer Services',
      taxId: 'TR3333333333',
      address: 'Atatürk Airport Area',
      city: 'Istanbul',
      country: 'Turkey',
      isActive: true,
    },
  });

  const carRentalCompany = await prisma.party.create({
    data: {
      tenantId: tenant.id,
      name: 'Turkey Car Rental Pro',
      taxId: 'TR4444444444',
      address: 'Sabiha Gökçen Airport',
      city: 'Istanbul',
      country: 'Turkey',
      isActive: true,
    },
  });

  const guideAgency = await prisma.party.create({
    data: {
      tenantId: tenant.id,
      name: 'Professional Tour Guides Association',
      taxId: 'TR5555555555',
      address: 'Sultanahmet Square',
      city: 'Istanbul',
      country: 'Turkey',
      isActive: true,
    },
  });

  const activityOperator = await prisma.party.create({
    data: {
      tenantId: tenant.id,
      name: 'Turkish Adventures & Experiences',
      taxId: 'TR6666666666',
      address: 'Karaköy Pier',
      city: 'Istanbul',
      country: 'Turkey',
      isActive: true,
    },
  });

  console.log('✅ Created 6 parties (companies)');

  // Create Contacts for Parties
  await prisma.contact.createMany({
    data: [
      // Luxury Hotels Istanbul Group
      {
        tenantId: tenant.id,
        partyId: hotelChain1.id,
        contactType: 'reservations',
        name: 'Elif Yılmaz',
        email: 'reservations@luxuryhotels.com',
        phone: '+90 212 123 4567',
        position: 'Reservations Manager',
        isPrimary: true,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        partyId: hotelChain1.id,
        contactType: 'accounting',
        name: 'Ahmet Demir',
        email: 'accounting@luxuryhotels.com',
        phone: '+90 212 123 4568',
        position: 'Finance Director',
        isPrimary: false,
        isActive: true,
      },
      // Cappadocia Cave Hotels
      {
        tenantId: tenant.id,
        partyId: hotelChain2.id,
        contactType: 'reservations',
        name: 'Ayşe Kaya',
        email: 'info@cappadociacave.com',
        phone: '+90 384 555 1234',
        position: 'Booking Coordinator',
        isPrimary: true,
        isActive: true,
      },
      // Transport Company
      {
        tenantId: tenant.id,
        partyId: transportCompany.id,
        contactType: 'operations',
        name: 'Mehmet Öztürk',
        email: 'dispatch@bosphorustransfer.com',
        phone: '+90 532 999 8888',
        position: 'Operations Manager',
        isPrimary: true,
        isActive: true,
      },
      // Car Rental
      {
        tenantId: tenant.id,
        partyId: carRentalCompany.id,
        contactType: 'sales',
        name: 'Zeynep Arslan',
        email: 'sales@turkeycarrental.com',
        phone: '+90 542 777 6666',
        position: 'B2B Sales Manager',
        isPrimary: true,
        isActive: true,
      },
      // Guide Agency
      {
        tenantId: tenant.id,
        partyId: guideAgency.id,
        contactType: 'operations',
        name: 'Can Yıldız',
        email: 'bookings@tourguides.com',
        phone: '+90 533 444 3333',
        position: 'Guide Coordinator',
        isPrimary: true,
        isActive: true,
      },
      // Activity Operator
      {
        tenantId: tenant.id,
        partyId: activityOperator.id,
        contactType: 'sales',
        name: 'Selin Aydın',
        email: 'reservations@turkishadventures.com',
        phone: '+90 534 222 1111',
        position: 'Customer Relations',
        isPrimary: true,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created contacts for all parties');

  // Create Suppliers
  const hotelSupplier1 = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      partyId: hotelChain1.id,
      type: 'HOTEL',
      bankName: 'Türkiye İş Bankası',
      bankIban: 'TR330006100519786457841326',
      bankSwift: 'ISBKTRISXXX',
      paymentTerms: 'Net 30',
      defaultCurrency: 'TRY',
      creditLimit: 50000.0,
      commissionPct: 10.0,
      isActive: true,
    },
  });

  const hotelSupplier2 = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      partyId: hotelChain2.id,
      type: 'HOTEL',
      bankName: 'Garanti BBVA',
      bankIban: 'TR640006200124700006327306',
      bankSwift: 'TGBATRISXXX',
      paymentTerms: 'Net 45',
      defaultCurrency: 'EUR',
      creditLimit: 30000.0,
      commissionPct: 12.0,
      isActive: true,
    },
  });

  const transportSupplier = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      partyId: transportCompany.id,
      type: 'TRANSPORT',
      bankName: 'Yapı Kredi',
      bankIban: 'TR950006700003600009145678',
      bankSwift: 'YAPITRISXXX',
      paymentTerms: 'Net 15',
      defaultCurrency: 'TRY',
      creditLimit: 20000.0,
      commissionPct: 5.0,
      isActive: true,
    },
  });

  const vehicleSupplier = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      partyId: carRentalCompany.id,
      type: 'TRANSPORT',
      bankName: 'Akbank',
      bankIban: 'TR460004600015955001234567',
      bankSwift: 'AKBKTRISXXX',
      paymentTerms: 'Prepayment',
      defaultCurrency: 'USD',
      creditLimit: 15000.0,
      commissionPct: 8.0,
      isActive: true,
    },
  });

  const guideSupplier = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      partyId: guideAgency.id,
      type: 'GUIDE_AGENCY',
      bankName: 'Ziraat Bankası',
      bankIban: 'TR100001000123456789012345',
      bankSwift: 'TCZBTR2AXXX',
      paymentTerms: 'Cash on completion',
      defaultCurrency: 'TRY',
      creditLimit: 10000.0,
      commissionPct: 0.0,
      isActive: true,
    },
  });

  const activitySupplier = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      partyId: activityOperator.id,
      type: 'ACTIVITY_OPERATOR',
      bankName: 'Halkbank',
      bankIban: 'TR120001200098765432109876',
      bankSwift: 'TRHBTR2AXXX',
      paymentTerms: 'Net 7',
      defaultCurrency: 'TRY',
      creditLimit: 25000.0,
      commissionPct: 15.0,
      isActive: true,
    },
  });

  console.log('✅ Created 6 suppliers (all types)');

  // Create Service Offerings and Type-Specific Details

  // 1. HOTEL ROOMS
  const hotelOffering1 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: hotelSupplier1.id,
      serviceType: 'HOTEL_ROOM',
      title: 'Deluxe Room with Bosphorus View',
      location: 'Istanbul, Taksim',
      description: '35 sqm room with stunning Bosphorus views, king bed, marble bathroom, and complimentary breakfast',
      isActive: true,
    },
  });

  await prisma.hotelRoom.create({
    data: {
      serviceOfferingId: hotelOffering1.id,
      hotelName: 'Luxury Istanbul Bosphorus',
      stars: 5,
      address: 'Taksim Square No:5',
      city: 'Istanbul',
      country: 'Turkey',
      geo: '41.0369,28.9858',
      roomType: 'DELUXE',
      maxOccupancy: 3,
      boardTypes: ['RO', 'BB', 'HB', 'FB'],
      amenities: ['wifi', 'minibar', 'safe', 'AC', 'TV', 'balcony'],
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellationPolicy: 'Free cancellation up to 7 days before arrival. 50% charge for 3-7 days, 100% for less than 3 days.',
      notes: 'Excellent location near Taksim Square and Istiklal Street',
    },
  });

  const hotelOffering2 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: hotelSupplier2.id,
      serviceType: 'HOTEL_ROOM',
      title: 'Cave Suite with Terrace',
      location: 'Cappadocia, Göreme',
      description: 'Authentic cave room carved into fairy chimneys, private terrace with valley views, traditional decor',
      isActive: true,
    },
  });

  await prisma.hotelRoom.create({
    data: {
      serviceOfferingId: hotelOffering2.id,
      hotelName: 'Cappadocia Dream Cave Hotel',
      stars: 4,
      address: 'Göreme Center',
      city: 'Göreme',
      country: 'Turkey',
      geo: '38.6431,34.8289',
      roomType: 'SUITE',
      maxOccupancy: 2,
      boardTypes: ['BB', 'HB'],
      amenities: ['wifi', 'fireplace', 'heating', 'terrace', 'hot_tub'],
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'Free cancellation up to 14 days before arrival. No refund after that.',
      notes: 'Perfect for hot air balloon watching from terrace',
    },
  });

  // 2. TRANSFERS
  const transferOffering1 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: transportSupplier.id,
      serviceType: 'TRANSFER',
      title: 'Airport to Hotel Transfer - Sedan',
      location: 'Istanbul',
      description: 'Comfortable sedan transfer from Istanbul Airport to any hotel in the city center',
      isActive: true,
    },
  });

  await prisma.transfer.create({
    data: {
      serviceOfferingId: transferOffering1.id,
      originZone: 'Istanbul Airport (IST)',
      destZone: 'City Center Hotels',
      transferType: 'PRIVATE',
      vehicleClass: 'sedan',
      capacity: 3,
      meetGreet: true,
      luggageAllowance: '3 large suitcases',
      duration: 45,
      distance: 42.0,
      notes: 'Mercedes E-Class or similar, English-speaking driver',
    },
  });

  const transferOffering2 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: transportSupplier.id,
      serviceType: 'TRANSFER',
      title: 'Bosphorus Cruise Transfer - Van',
      location: 'Istanbul',
      description: 'Spacious van transfer from hotel to Bosphorus cruise departure point',
      isActive: true,
    },
  });

  await prisma.transfer.create({
    data: {
      serviceOfferingId: transferOffering2.id,
      originZone: 'City Center Hotels',
      destZone: 'Eminönü Pier',
      transferType: 'PRIVATE',
      vehicleClass: 'van',
      capacity: 8,
      meetGreet: true,
      luggageAllowance: 'Hand luggage only',
      duration: 25,
      distance: 12.0,
      notes: 'Mercedes Vito or similar, perfect for groups',
    },
  });

  // 3. VEHICLES
  const vehicleOffering1 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: vehicleSupplier.id,
      serviceType: 'VEHICLE_HIRE',
      title: 'Luxury SUV with Driver',
      location: 'Istanbul',
      description: 'Premium SUV rental with professional English-speaking driver for day tours',
      isActive: true,
    },
  });

  await prisma.vehicle.create({
    data: {
      serviceOfferingId: vehicleOffering1.id,
      make: 'Mercedes-Benz',
      model: 'GLS 450',
      year: 2023,
      plateNumber: '34 ABC 1234',
      seats: 6,
      vehicleClass: 'luxury_suv',
      transmission: 'automatic',
      fuelType: 'diesel',
      withDriver: true,
      features: ['GPS', 'wifi', 'AC', 'leather_seats', 'panoramic_roof'],
      insuranceIncluded: true,
      notes: 'Perfect for VIP tours, includes fuel and driver',
    },
  });

  const vehicleOffering2 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: vehicleSupplier.id,
      serviceType: 'VEHICLE_HIRE',
      title: 'Economy Car Self-Drive',
      location: 'Istanbul',
      description: 'Compact car for self-drive, unlimited mileage, full insurance',
      isActive: true,
    },
  });

  await prisma.vehicle.create({
    data: {
      serviceOfferingId: vehicleOffering2.id,
      make: 'Renault',
      model: 'Clio',
      year: 2024,
      plateNumber: '34 XYZ 5678',
      seats: 5,
      vehicleClass: 'economy',
      transmission: 'manual',
      fuelType: 'petrol',
      withDriver: false,
      features: ['GPS', 'AC', 'bluetooth'],
      insuranceIncluded: true,
      notes: 'Great fuel economy, easy to park',
    },
  });

  // 4. GUIDES
  const guideOffering1 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: guideSupplier.id,
      serviceType: 'GUIDE_SERVICE',
      title: 'Licensed Historical Tour Guide - English',
      location: 'Istanbul',
      description: 'Experienced licensed guide specializing in Byzantine and Ottoman history',
      isActive: true,
    },
  });

  await prisma.guide.create({
    data: {
      serviceOfferingId: guideOffering1.id,
      guideName: 'Mehmet Çelik',
      licenseNo: 'TRG-IST-2020-1234',
      languages: ['English', 'Turkish', 'German'],
      regions: ['Istanbul', 'Edirne', 'Bursa'],
      specializations: ['historical', 'cultural', 'religious_sites'],
      maxGroupSize: 25,
      rating: 4.9,
      phone: '+90 532 111 2222',
      email: 'mehmet@tourguides.com',
      notes: '15 years experience, archaeology degree',
    },
  });

  const guideOffering2 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: guideSupplier.id,
      serviceType: 'GUIDE_SERVICE',
      title: 'Adventure Tour Guide - Spanish',
      location: 'Cappadocia',
      description: 'Young and energetic guide for adventure tours and outdoor activities',
      isActive: true,
    },
  });

  await prisma.guide.create({
    data: {
      serviceOfferingId: guideOffering2.id,
      guideName: 'Ayşe Yılmaz',
      licenseNo: 'TRG-CAP-2021-5678',
      languages: ['Spanish', 'English', 'Turkish'],
      regions: ['Cappadocia', 'Konya', 'Pamukkale'],
      specializations: ['adventure', 'nature', 'hiking'],
      maxGroupSize: 15,
      rating: 4.8,
      phone: '+90 533 222 3333',
      email: 'ayse@tourguides.com',
      notes: 'Mountain guide certification, first aid trained',
    },
  });

  // 5. ACTIVITIES
  const activityOffering1 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: activitySupplier.id,
      serviceType: 'ACTIVITY',
      title: 'Bosphorus Sunset Cruise with Dinner',
      location: 'Istanbul',
      description: 'Romantic 3-hour cruise along the Bosphorus with Turkish dinner and live music',
      isActive: true,
    },
  });

  await prisma.activity.create({
    data: {
      serviceOfferingId: activityOffering1.id,
      operatorName: 'Turkish Adventures & Experiences',
      activityType: 'tour',
      durationMinutes: 180,
      capacity: 50,
      minAge: 0,
      maxAge: 99,
      difficulty: 'easy',
      includedItems: ['dinner', 'live_music', 'unlimited_drinks', 'guide'],
      meetingPoint: 'Karaköy Pier, Gate 5',
      pickupAvailable: true,
      cancellationPolicy: 'Free cancellation up to 24 hours. 50% refund for 12-24h, no refund after that.',
      notes: 'Departure 18:00 in summer, 17:00 in winter',
    },
  });

  const activityOffering2 = await prisma.serviceOffering.create({
    data: {
      tenantId: tenant.id,
      supplierId: activitySupplier.id,
      serviceType: 'ACTIVITY',
      title: 'Turkish Cooking Class & Market Tour',
      location: 'Istanbul',
      description: 'Hands-on cooking class learning to make traditional Turkish dishes, starts with spice market tour',
      isActive: true,
    },
  });

  await prisma.activity.create({
    data: {
      serviceOfferingId: activityOffering2.id,
      operatorName: 'Turkish Adventures & Experiences',
      activityType: 'experience',
      durationMinutes: 240,
      capacity: 12,
      minAge: 16,
      maxAge: 75,
      difficulty: 'easy',
      includedItems: ['market_tour', 'ingredients', 'lunch', 'recipes', 'apron'],
      meetingPoint: 'Spice Bazaar Main Entrance',
      pickupAvailable: false,
      cancellationPolicy: 'Free cancellation up to 48 hours. No refund after that.',
      notes: 'Vegetarian options available, please advise dietary restrictions',
    },
  });

  console.log('✅ Created 10 service offerings with type-specific details');

  // Create Rate Cards for each service offering
  const seasonDates = {
    winter: { from: new Date('2025-01-01'), to: new Date('2025-03-31') },
    spring: { from: new Date('2025-04-01'), to: new Date('2025-06-30') },
    summer: { from: new Date('2025-07-01'), to: new Date('2025-09-30') },
    autumn: { from: new Date('2025-10-01'), to: new Date('2025-12-31') },
  };

  // Hotel Rates
  await prisma.hotelRoomRate.createMany({
    data: [
      // Luxury Istanbul Bosphorus - Spring Season
      {
        tenantId: tenant.id,
        serviceOfferingId: hotelOffering1.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.spring.to,
        pricingModel: 'PER_ROOM_NIGHT',
        boardType: 'BB',
        occupancyAdults: 2,
        occupancyChildren: 0,
        costTry: 4500.0,
        allotment: 10,
        releaseDays: 7,
        minStay: 2,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        serviceOfferingId: hotelOffering1.id,
        seasonFrom: seasonDates.summer.from,
        seasonTo: seasonDates.summer.to,
        pricingModel: 'PER_ROOM_NIGHT',
        boardType: 'BB',
        occupancyAdults: 2,
        occupancyChildren: 0,
        costTry: 5500.0,
        allotment: 15,
        releaseDays: 14,
        minStay: 3,
        isActive: true,
      },
      // Cappadocia Cave Hotel - Spring
      {
        tenantId: tenant.id,
        serviceOfferingId: hotelOffering2.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.spring.to,
        pricingModel: 'PER_ROOM_NIGHT',
        boardType: 'BB',
        occupancyAdults: 2,
        occupancyChildren: 0,
        costTry: 3200.0,
        allotment: 5,
        releaseDays: 14,
        minStay: 2,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Transfer Rates
  await prisma.transferRate.createMany({
    data: [
      {
        tenantId: tenant.id,
        serviceOfferingId: transferOffering1.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.autumn.to,
        pricingModel: 'PER_TRANSFER',
        baseCostTry: 1200.0,
        includedKm: 50.0,
        extraKmTry: 25.0,
        nightSurchargePct: 30.0,
        holidaySurchargePct: 50.0,
        waitingTimeFree: 60,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        serviceOfferingId: transferOffering2.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.autumn.to,
        pricingModel: 'PER_TRANSFER',
        baseCostTry: 800.0,
        includedKm: 20.0,
        extraKmTry: 20.0,
        nightSurchargePct: 0.0,
        holidaySurchargePct: 25.0,
        waitingTimeFree: 30,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Vehicle Rates
  await prisma.vehicleRate.createMany({
    data: [
      {
        tenantId: tenant.id,
        serviceOfferingId: vehicleOffering1.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.autumn.to,
        pricingModel: 'PER_DAY',
        baseCostTry: 3500.0,
        dailyKmIncluded: 200.0,
        extraKmTry: 15.0,
        driverDailyTry: 1500.0,
        minRentalDays: 1,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        serviceOfferingId: vehicleOffering2.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.autumn.to,
        pricingModel: 'PER_DAY',
        baseCostTry: 800.0,
        dailyKmIncluded: 250.0,
        extraKmTry: 5.0,
        depositTry: 2000.0,
        minRentalDays: 3,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Guide Rates
  await prisma.guideRate.createMany({
    data: [
      {
        tenantId: tenant.id,
        serviceOfferingId: guideOffering1.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.autumn.to,
        pricingModel: 'PER_DAY',
        dayCostTry: 3000.0,
        halfDayCostTry: 1800.0,
        hourCostTry: 400.0,
        overtimeHourTry: 500.0,
        holidaySurchargePct: 50.0,
        minHours: 4,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        serviceOfferingId: guideOffering2.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.autumn.to,
        pricingModel: 'PER_DAY',
        dayCostTry: 2500.0,
        halfDayCostTry: 1500.0,
        hourCostTry: 350.0,
        overtimeHourTry: 450.0,
        holidaySurchargePct: 40.0,
        minHours: 4,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Activity Rates
  await prisma.activityRate.createMany({
    data: [
      {
        tenantId: tenant.id,
        serviceOfferingId: activityOffering1.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.autumn.to,
        pricingModel: 'PER_PERSON',
        baseCostTry: 1500.0,
        minPax: 2,
        maxPax: 50,
        childDiscountPct: 50.0,
        groupDiscountPct: 10.0,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        serviceOfferingId: activityOffering2.id,
        seasonFrom: seasonDates.spring.from,
        seasonTo: seasonDates.autumn.to,
        pricingModel: 'PER_PERSON',
        baseCostTry: 1200.0,
        minPax: 4,
        maxPax: 12,
        childDiscountPct: 0.0,
        groupDiscountPct: 15.0,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created rate cards for all services');
  console.log('');
  console.log('✅ Supplier Catalog System seeding complete!');
  console.log('   - 6 Parties (companies)');
  console.log('   - 7 Contacts');
  console.log('   - 6 Suppliers (all types)');
  console.log('   - 10 Service Offerings');
  console.log('   - 10 Type-specific details');
  console.log('   - Multiple rate cards per service');

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
