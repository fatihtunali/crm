import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkRatesData() {
  console.log('🔍 Checking Rate Tables Data...\n');

  try {
    const [
      suppliers,
      serviceOfferings,
      hotelRoomRates,
      transferRates,
      vehicleRates,
      guideRates,
      activityRates,
      hotelRooms,
      transfers,
      vehicles,
      guides,
      activities,
    ] = await Promise.all([
      prisma.supplier.count(),
      prisma.serviceOffering.count(),
      prisma.hotelRoomRate.count(),
      prisma.transferRate.count(),
      prisma.vehicleRate.count(),
      prisma.guideRate.count(),
      prisma.activityRate.count(),
      prisma.hotelRoom.count(),
      prisma.transfer.count(),
      prisma.vehicle.count(),
      prisma.guide.count(),
      prisma.activity.count(),
    ]);

    console.log('📊 DATA COUNTS:\n');
    console.log('Suppliers:              ', suppliers);
    console.log('Service Offerings:      ', serviceOfferings);
    console.log('\n--- Service Details ---');
    console.log('Hotel Rooms:            ', hotelRooms);
    console.log('Transfers:              ', transfers);
    console.log('Vehicles:               ', vehicles);
    console.log('Guides:                 ', guides);
    console.log('Activities:             ', activities);
    console.log('\n--- Rate Tables ---');
    console.log('Hotel Room Rates:       ', hotelRoomRates);
    console.log('Transfer Rates:         ', transferRates);
    console.log('Vehicle Rates:          ', vehicleRates);
    console.log('Guide Rates:            ', guideRates);
    console.log('Activity Rates:         ', activityRates);

    const totalRates = hotelRoomRates + transferRates + vehicleRates + guideRates + activityRates;
    console.log('\n📈 TOTAL RATES:         ', totalRates);

    if (totalRates === 0) {
      console.log('\n⚠️  WARNING: NO RATE DATA FOUND!');
      console.log('The schema is complete, but no sample rates have been populated.');
      console.log('\nTo populate sample data, you need to:');
      console.log('1. Create suppliers');
      console.log('2. Create service offerings for each type');
      console.log('3. Create type-specific details (hotel_rooms, transfers, etc.)');
      console.log('4. Create rates for each service offering');
    } else {
      console.log('\n✅ Rate data exists in the database');
    }

    // Show breakdown by service type
    if (serviceOfferings > 0) {
      console.log('\n📋 Service Offerings Breakdown:');
      const breakdown = await prisma.serviceOffering.groupBy({
        by: ['serviceType'],
        _count: true,
      });
      breakdown.forEach((item) => {
        console.log(`  ${item.serviceType}: ${item._count} offerings`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRatesData();
