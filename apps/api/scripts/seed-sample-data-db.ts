import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSampleData() {
  try {
    console.log('\n🌱 Starting to seed sample data...\n');

    // Get the tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      throw new Error('No tenant found!');
    }
    console.log(`✓ Using tenant: ${tenant.name}`);

    // Get existing suppliers
    const hotelSupplier1 = await prisma.supplier.findFirst({
      where: { tenant: { code: 'DEMO' }, type: 'HOTEL' },
      include: { party: true }
    });

    const hotelSupplier2 = await prisma.supplier.findFirst({
      where: {
        tenant: { code: 'DEMO' },
        type: 'HOTEL',
        NOT: { id: hotelSupplier1?.id }
      },
      include: { party: true }
    });

    const transferSupplier = await prisma.supplier.findFirst({
      where: { tenant: { code: 'DEMO' }, type: 'TRANSPORT' },
      include: { party: true }
    });

    const vehicleSupplier = await prisma.supplier.findFirst({
      where: {
        tenant: { code: 'DEMO' },
        type: 'TRANSPORT',
        NOT: { id: transferSupplier?.id }
      },
      include: { party: true }
    });

    const guideSupplier = await prisma.supplier.findFirst({
      where: { tenant: { code: 'DEMO' }, type: 'GUIDE_AGENCY' },
      include: { party: true }
    });

    const activitySupplier = await prisma.supplier.findFirst({
      where: { tenant: { code: 'DEMO' }, type: 'ACTIVITY_OPERATOR' },
      include: { party: true }
    });

    // ===========================================
    // 1. ADD TRANSFER DETAILS FOR EXISTING TRANSFER
    // ===========================================
    console.log('\n📍 Adding Transfer Details...');

    const existingTransferOffering = await prisma.serviceOffering.findFirst({
      where: { serviceType: 'TRANSFER' }
    });

    if (existingTransferOffering && transferSupplier) {
      // Check if transfer details exist
      const existingTransfer = await prisma.transfer.findUnique({
        where: { serviceOfferingId: existingTransferOffering.id }
      });

      if (!existingTransfer) {
        await prisma.transfer.create({
          data: {
            serviceOfferingId: existingTransferOffering.id,
            city: 'Istanbul',
            originZone: 'Istanbul Airport (IST)',
            destZone: 'Sultanahmet Hotels Zone',
            transferType: 'PRIVATE',
            vehicleClass: 'VITO',
            maxPassengers: 4,
            meetGreet: true,
            luggageAllowance: '2 large bags per person',
            duration: 60,
            distance: 45.5,
            notes: 'Professional driver with meet & greet service'
          }
        });
        console.log('  ✓ Added transfer details for existing offering');
      }

      // Add transfer rates
      await prisma.transferRate.createMany({
        data: [
          {
            tenantId: tenant.id,
            serviceOfferingId: existingTransferOffering.id,
            seasonFrom: new Date('2025-01-01'),
            seasonTo: new Date('2025-05-31'),
            pricingModel: 'PER_TRANSFER',
            baseCostTry: 2500.00,
            includedKm: 50,
            includedHours: 2,
            extraKmTry: 15.00,
            extraHourTry: 300.00,
            nightSurchargePct: 25.00,
            holidaySurchargePct: 35.00,
            waitingTimeFree: 30,
            notes: 'Low season pricing',
            isActive: true
          },
          {
            tenantId: tenant.id,
            serviceOfferingId: existingTransferOffering.id,
            seasonFrom: new Date('2025-06-01'),
            seasonTo: new Date('2025-12-31'),
            pricingModel: 'PER_TRANSFER',
            baseCostTry: 3200.00,
            includedKm: 50,
            includedHours: 2,
            extraKmTry: 18.00,
            extraHourTry: 350.00,
            nightSurchargePct: 25.00,
            holidaySurchargePct: 35.00,
            waitingTimeFree: 30,
            notes: 'High season pricing',
            isActive: true
          }
        ]
      });
      console.log('  ✓ Added 2 transfer rates (low & high season)');
    }

    // ===========================================
    // 2. ADD HOTEL ROOM RATES FOR EXISTING HOTELS
    // ===========================================
    console.log('\n🏨 Adding Hotel Room Rates...');

    const hotelRooms = await prisma.hotelRoom.findMany();

    for (const hotelRoom of hotelRooms) {
      await prisma.hotelRoomRate.createMany({
        data: [
          // BB - Low Season
          {
            tenantId: tenant.id,
            serviceOfferingId: hotelRoom.serviceOfferingId,
            seasonFrom: new Date('2025-01-01'),
            seasonTo: new Date('2025-05-31'),
            boardType: 'BB',
            pricePerPersonDouble: 1500.00,
            singleSupplement: 800.00,
            pricePerPersonTriple: 1300.00,
            childPrice0to2: 0.00,
            childPrice3to5: 450.00,
            childPrice6to11: 750.00,
            allotment: 10,
            releaseDays: 7,
            minStay: 1,
            notes: 'Low season - Bed & Breakfast',
            isActive: true
          },
          // HB - Low Season
          {
            tenantId: tenant.id,
            serviceOfferingId: hotelRoom.serviceOfferingId,
            seasonFrom: new Date('2025-01-01'),
            seasonTo: new Date('2025-05-31'),
            boardType: 'HB',
            pricePerPersonDouble: 1800.00,
            singleSupplement: 900.00,
            pricePerPersonTriple: 1550.00,
            childPrice0to2: 0.00,
            childPrice3to5: 550.00,
            childPrice6to11: 900.00,
            allotment: 10,
            releaseDays: 7,
            minStay: 1,
            notes: 'Low season - Half Board',
            isActive: true
          },
          // BB - High Season
          {
            tenantId: tenant.id,
            serviceOfferingId: hotelRoom.serviceOfferingId,
            seasonFrom: new Date('2025-06-01'),
            seasonTo: new Date('2025-12-31'),
            boardType: 'BB',
            pricePerPersonDouble: 2200.00,
            singleSupplement: 1100.00,
            pricePerPersonTriple: 1900.00,
            childPrice0to2: 0.00,
            childPrice3to5: 660.00,
            childPrice6to11: 1100.00,
            allotment: 8,
            releaseDays: 14,
            minStay: 2,
            notes: 'High season - Bed & Breakfast',
            isActive: true
          },
          // HB - High Season
          {
            tenantId: tenant.id,
            serviceOfferingId: hotelRoom.serviceOfferingId,
            seasonFrom: new Date('2025-06-01'),
            seasonTo: new Date('2025-12-31'),
            boardType: 'HB',
            pricePerPersonDouble: 2600.00,
            singleSupplement: 1300.00,
            pricePerPersonTriple: 2250.00,
            childPrice0to2: 0.00,
            childPrice3to5: 780.00,
            childPrice6to11: 1300.00,
            allotment: 8,
            releaseDays: 14,
            minStay: 2,
            notes: 'High season - Half Board',
            isActive: true
          }
        ]
      });
      console.log(`  ✓ Added 4 rates for hotel room: ${hotelRoom.hotelName}`);
    }

    // ===========================================
    // 3. ADD MORE TRANSFERS
    // ===========================================
    console.log('\n🚗 Adding More Transfer Services...');

    if (transferSupplier) {
      const transfersData = [
        {
          title: 'Airport to Hotel Transfer - Sprinter Van',
          location: 'Istanbul',
          city: 'Istanbul',
          originZone: 'Istanbul Airport (IST)',
          destZone: 'Taksim Hotels Zone',
          transferType: 'PRIVATE' as const,
          vehicleClass: 'SPRINTER' as const,
          maxPassengers: 12,
          distance: 42.0
        },
        {
          title: 'Cappadocia Airport Transfer - Sedan',
          location: 'Cappadocia',
          city: 'Cappadocia',
          originZone: 'Kayseri Airport (ASR)',
          destZone: 'Göreme Hotels',
          transferType: 'PRIVATE' as const,
          vehicleClass: 'VITO' as const,
          maxPassengers: 4,
          distance: 75.0
        }
      ];

      for (const transfer of transfersData) {
        const offering = await prisma.serviceOffering.create({
          data: {
            tenantId: tenant.id,
            supplierId: transferSupplier.id,
            serviceType: 'TRANSFER',
            title: transfer.title,
            location: transfer.location,
            description: `Professional transfer service from ${transfer.originZone} to ${transfer.destZone}`,
            isActive: true
          }
        });

        await prisma.transfer.create({
          data: {
            serviceOfferingId: offering.id,
            city: transfer.city,
            originZone: transfer.originZone,
            destZone: transfer.destZone,
            transferType: transfer.transferType,
            vehicleClass: transfer.vehicleClass,
            maxPassengers: transfer.maxPassengers,
            meetGreet: true,
            luggageAllowance: '2 large bags per person',
            duration: 90,
            distance: transfer.distance
          }
        });

        await prisma.transferRate.createMany({
          data: [
            {
              tenantId: tenant.id,
              serviceOfferingId: offering.id,
              seasonFrom: new Date('2025-01-01'),
              seasonTo: new Date('2025-05-31'),
              pricingModel: 'PER_TRANSFER',
              baseCostTry: transfer.vehicleClass === 'SPRINTER' ? 4500.00 : 3000.00,
              nightSurchargePct: 25.00,
              holidaySurchargePct: 35.00,
              isActive: true
            },
            {
              tenantId: tenant.id,
              serviceOfferingId: offering.id,
              seasonFrom: new Date('2025-06-01'),
              seasonTo: new Date('2025-12-31'),
              pricingModel: 'PER_TRANSFER',
              baseCostTry: transfer.vehicleClass === 'SPRINTER' ? 5800.00 : 3800.00,
              nightSurchargePct: 25.00,
              holidaySurchargePct: 35.00,
              isActive: true
            }
          ]
        });

        console.log(`  ✓ Added transfer: ${transfer.title}`);
      }
    }

    // ===========================================
    // 4. ADD VEHICLES
    // ===========================================
    console.log('\n🚙 Adding Vehicle Hire Services...');

    if (vehicleSupplier) {
      const vehiclesData = [
        {
          title: 'Mercedes Vito with Driver - Full Day',
          make: 'Mercedes',
          model: 'Vito',
          year: 2023,
          vehicleClass: 'VITO' as const,
          maxPassengers: 4,
          withDriver: true
        },
        {
          title: 'Mercedes Sprinter with Driver - Full Day',
          make: 'Mercedes',
          model: 'Sprinter',
          year: 2023,
          vehicleClass: 'SPRINTER' as const,
          maxPassengers: 12,
          withDriver: true
        },
        {
          title: 'Self-Drive Sedan - Daily Rental',
          make: 'Toyota',
          model: 'Corolla',
          year: 2024,
          vehicleClass: 'VITO' as const,
          maxPassengers: 4,
          withDriver: false
        }
      ];

      for (const vehicle of vehiclesData) {
        const offering = await prisma.serviceOffering.create({
          data: {
            tenantId: tenant.id,
            supplierId: vehicleSupplier.id,
            serviceType: 'VEHICLE_HIRE',
            title: vehicle.title,
            location: 'Istanbul',
            description: `${vehicle.make} ${vehicle.model} - ${vehicle.withDriver ? 'With professional driver' : 'Self-drive rental'}`,
            isActive: true
          }
        });

        await prisma.vehicle.create({
          data: {
            serviceOfferingId: offering.id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            vehicleClass: vehicle.vehicleClass,
            maxPassengers: vehicle.maxPassengers,
            transmission: 'automatic',
            fuelType: 'diesel',
            withDriver: vehicle.withDriver,
            features: ['GPS', 'AC', 'USB charging', 'WiFi'],
            insuranceIncluded: true,
            notes: vehicle.withDriver ? 'Professional English-speaking driver included' : 'Full insurance included'
          }
        });

        await prisma.vehicleRate.createMany({
          data: [
            {
              tenantId: tenant.id,
              serviceOfferingId: offering.id,
              seasonFrom: new Date('2025-01-01'),
              seasonTo: new Date('2025-05-31'),
              dailyRateTry: vehicle.withDriver ? (vehicle.vehicleClass === 'SPRINTER' ? 8000.00 : 5500.00) : 2000.00,
              dailyKmIncluded: 250,
              hourlyRateTry: vehicle.withDriver ? (vehicle.vehicleClass === 'SPRINTER' ? 1000.00 : 700.00) : 250.00,
              minHours: 4,
              extraKmTry: 12.00,
              driverDailyTry: vehicle.withDriver ? 0 : null,
              oneWayFeeTry: 1500.00,
              depositTry: vehicle.withDriver ? 0 : 5000.00,
              minRentalDays: 1,
              isActive: true
            },
            {
              tenantId: tenant.id,
              serviceOfferingId: offering.id,
              seasonFrom: new Date('2025-06-01'),
              seasonTo: new Date('2025-12-31'),
              dailyRateTry: vehicle.withDriver ? (vehicle.vehicleClass === 'SPRINTER' ? 10000.00 : 7000.00) : 2500.00,
              dailyKmIncluded: 250,
              hourlyRateTry: vehicle.withDriver ? (vehicle.vehicleClass === 'SPRINTER' ? 1250.00 : 900.00) : 300.00,
              minHours: 4,
              extraKmTry: 15.00,
              driverDailyTry: vehicle.withDriver ? 0 : null,
              oneWayFeeTry: 2000.00,
              depositTry: vehicle.withDriver ? 0 : 6000.00,
              minRentalDays: 1,
              isActive: true
            }
          ]
        });

        console.log(`  ✓ Added vehicle: ${vehicle.title}`);
      }
    }

    // ===========================================
    // 5. ADD GUIDES
    // ===========================================
    console.log('\n👨‍🏫 Adding Guide Services...');

    if (guideSupplier) {
      const guidesData = [
        {
          title: 'Licensed Istanbul Historical Guide - Full Day',
          guideName: 'Mehmet Yılmaz',
          licenseNo: 'IST-2024-001234',
          languages: ['English', 'Turkish', 'German'],
          regions: ['Istanbul', 'Bosphorus', 'Old City'],
          specializations: ['Historical sites', 'Byzantine history', 'Ottoman culture'],
          maxGroupSize: 25
        },
        {
          title: 'Licensed Cappadocia Guide - Full Day',
          guideName: 'Ayşe Demir',
          licenseNo: 'CAP-2024-005678',
          languages: ['English', 'Turkish', 'French', 'Spanish'],
          regions: ['Cappadocia', 'Göreme', 'Ürgüp', 'Avanos'],
          specializations: ['Cave churches', 'Hot air balloon tours', 'Pottery workshops'],
          maxGroupSize: 30
        },
        {
          title: 'Licensed Ephesus Ancient City Guide',
          guideName: 'Can Arslan',
          licenseNo: 'EPH-2024-009012',
          languages: ['English', 'Turkish', 'Italian'],
          regions: ['Ephesus', 'Kuşadası', 'Şirince'],
          specializations: ['Ancient ruins', 'Greek history', 'Archaeological sites'],
          maxGroupSize: 20
        }
      ];

      for (const guide of guidesData) {
        const offering = await prisma.serviceOffering.create({
          data: {
            tenantId: tenant.id,
            supplierId: guideSupplier.id,
            serviceType: 'GUIDE_SERVICE',
            title: guide.title,
            location: guide.regions[0],
            description: `Licensed professional guide ${guide.guideName} - Specializing in ${guide.specializations.join(', ')}`,
            isActive: true
          }
        });

        await prisma.guide.create({
          data: {
            serviceOfferingId: offering.id,
            guideName: guide.guideName,
            licenseNo: guide.licenseNo,
            languages: guide.languages,
            regions: guide.regions,
            specializations: guide.specializations,
            maxGroupSize: guide.maxGroupSize,
            rating: 4.8,
            phone: '+90 532 123 4567',
            email: `${guide.guideName.toLowerCase().replace(' ', '.')}@guides.com`
          }
        });

        await prisma.guideRate.createMany({
          data: [
            {
              tenantId: tenant.id,
              serviceOfferingId: offering.id,
              seasonFrom: new Date('2025-01-01'),
              seasonTo: new Date('2025-05-31'),
              pricingModel: 'PER_DAY',
              dayCostTry: 4500.00,
              halfDayCostTry: 2500.00,
              hourCostTry: 600.00,
              overtimeHourTry: 750.00,
              holidaySurchargePct: 50.00,
              minHours: 4,
              isActive: true
            },
            {
              tenantId: tenant.id,
              serviceOfferingId: offering.id,
              seasonFrom: new Date('2025-06-01'),
              seasonTo: new Date('2025-12-31'),
              pricingModel: 'PER_DAY',
              dayCostTry: 6000.00,
              halfDayCostTry: 3500.00,
              hourCostTry: 800.00,
              overtimeHourTry: 1000.00,
              holidaySurchargePct: 50.00,
              minHours: 4,
              isActive: true
            }
          ]
        });

        console.log(`  ✓ Added guide: ${guide.guideName}`);
      }
    }

    // ===========================================
    // 6. ADD ACTIVITIES
    // ===========================================
    console.log('\n🎯 Adding Activity Services...');

    if (activitySupplier) {
      const activitiesData = [
        {
          title: 'Bosphorus Sunset Cruise with Dinner',
          operatorName: 'Istanbul Boat Tours',
          activityType: 'cruise',
          durationMinutes: 180,
          capacity: 100,
          minAge: 0,
          difficulty: 'easy',
          includedItems: ['Dinner buffet', 'Soft drinks', 'Live music', 'Guide commentary'],
          pickupAvailable: true,
          pricingModel: 'PER_PERSON' as const,
          baseCostLow: 1200.00,
          baseCostHigh: 1500.00
        },
        {
          title: 'Cappadocia Hot Air Balloon Flight',
          operatorName: 'Skyline Balloons Cappadocia',
          activityType: 'adventure',
          durationMinutes: 60,
          capacity: 20,
          minAge: 6,
          difficulty: 'easy',
          includedItems: ['1-hour flight', 'Champagne toast', 'Flight certificate', 'Hotel pickup'],
          pickupAvailable: true,
          pricingModel: 'PER_PERSON' as const,
          baseCostLow: 5500.00,
          baseCostHigh: 7000.00
        },
        {
          title: 'Turkish Cooking Class with Market Tour',
          operatorName: 'Istanbul Culinary Experiences',
          activityType: 'experience',
          durationMinutes: 240,
          capacity: 12,
          minAge: 12,
          difficulty: 'moderate',
          includedItems: ['Market tour', 'Cooking class', 'Lunch/dinner', 'Recipe booklet'],
          pickupAvailable: false,
          pricingModel: 'PER_PERSON' as const,
          baseCostLow: 2000.00,
          baseCostHigh: 2500.00
        },
        {
          title: 'Private Ephesus Tour for Groups',
          operatorName: 'Aegean Adventures',
          activityType: 'tour',
          durationMinutes: 480,
          capacity: 30,
          minAge: 0,
          difficulty: 'moderate',
          includedItems: ['Licensed guide', 'Entrance fees', 'Lunch', 'Transportation'],
          pickupAvailable: true,
          pricingModel: 'PER_GROUP' as const,
          baseCostLow: 15000.00,
          baseCostHigh: 20000.00
        }
      ];

      for (const activity of activitiesData) {
        const offering = await prisma.serviceOffering.create({
          data: {
            tenantId: tenant.id,
            supplierId: activitySupplier.id,
            serviceType: 'ACTIVITY',
            title: activity.title,
            location: activity.title.includes('Bosphorus') || activity.title.includes('Istanbul') ? 'Istanbul' :
                     activity.title.includes('Cappadocia') ? 'Cappadocia' : 'Ephesus',
            description: `${activity.activityType} - ${activity.operatorName}`,
            isActive: true
          }
        });

        await prisma.activity.create({
          data: {
            serviceOfferingId: offering.id,
            operatorName: activity.operatorName,
            activityType: activity.activityType,
            durationMinutes: activity.durationMinutes,
            capacity: activity.capacity,
            minAge: activity.minAge,
            difficulty: activity.difficulty,
            includedItems: activity.includedItems,
            meetingPoint: activity.pickupAvailable ? 'Hotel pickup available' : 'Meeting point details provided upon booking',
            pickupAvailable: activity.pickupAvailable,
            cancellationPolicy: 'Free cancellation up to 24 hours before the activity'
          }
        });

        await prisma.activityRate.createMany({
          data: [
            {
              tenantId: tenant.id,
              serviceOfferingId: offering.id,
              seasonFrom: new Date('2025-01-01'),
              seasonTo: new Date('2025-05-31'),
              pricingModel: activity.pricingModel,
              baseCostTry: activity.baseCostLow,
              minPax: activity.pricingModel === 'PER_GROUP' ? 10 : 1,
              maxPax: activity.capacity,
              tieredPricingJson: activity.pricingModel === 'PER_GROUP' ? {
                '10-15': activity.baseCostLow,
                '16-25': activity.baseCostLow * 1.3,
                '26-30': activity.baseCostLow * 1.5
              } : null,
              childDiscountPct: 30.00,
              isActive: true
            },
            {
              tenantId: tenant.id,
              serviceOfferingId: offering.id,
              seasonFrom: new Date('2025-06-01'),
              seasonTo: new Date('2025-12-31'),
              pricingModel: activity.pricingModel,
              baseCostTry: activity.baseCostHigh,
              minPax: activity.pricingModel === 'PER_GROUP' ? 10 : 1,
              maxPax: activity.capacity,
              tieredPricingJson: activity.pricingModel === 'PER_GROUP' ? {
                '10-15': activity.baseCostHigh,
                '16-25': activity.baseCostHigh * 1.3,
                '26-30': activity.baseCostHigh * 1.5
              } : null,
              childDiscountPct: 30.00,
              isActive: true
            }
          ]
        });

        console.log(`  ✓ Added activity: ${activity.title}`);
      }
    }

    // ===========================================
    // 7. ADD SAMPLE CLIENTS
    // ===========================================
    console.log('\n👥 Adding Sample Clients...');

    await prisma.client.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 555 123 4567',
          nationality: 'USA',
          preferredLanguage: 'en',
          passportNumber: 'US123456789',
          dateOfBirth: new Date('1985-06-15'),
          tags: ['VIP', 'repeat-customer'],
          isActive: true
        },
        {
          tenantId: tenant.id,
          name: 'Maria Garcia',
          email: 'maria.garcia@email.com',
          phone: '+34 666 777 888',
          nationality: 'Spain',
          preferredLanguage: 'es',
          passportNumber: 'ES987654321',
          dateOfBirth: new Date('1990-03-22'),
          tags: ['family-travel'],
          isActive: true
        },
        {
          tenantId: tenant.id,
          name: 'Hans Mueller',
          email: 'hans.mueller@email.de',
          phone: '+49 171 234 5678',
          nationality: 'Germany',
          preferredLanguage: 'de',
          passportNumber: 'DE456789123',
          dateOfBirth: new Date('1978-11-08'),
          tags: ['business-traveler'],
          isActive: true
        }
      ]
    });
    console.log('  ✓ Added 3 sample clients');

    console.log('\n✅ Sample data seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleData();
