import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTransferRates() {
  try {
    // Check service offering ID 3
    const offering = await prisma.serviceOffering.findUnique({
      where: { id: 3 },
      include: {
        supplier: true,
        transferRates: true,
      },
    });

    console.log('\n=== SERVICE OFFERING #3 ===');
    if (offering) {
      console.log(`ID: ${offering.id}`);
      console.log(`Title: ${offering.title}`);
      console.log(`Service Type: ${offering.serviceType}`);
      console.log(`Supplier: ${offering.supplier.name}`);
      console.log(`\nTransfer Rates Count: ${offering.transferRates?.length || 0}`);

      if (offering.transferRates && offering.transferRates.length > 0) {
        console.log('\nTransfer Rates:');
        offering.transferRates.forEach((rate, idx) => {
          console.log(`\n  Rate ${idx + 1}:`);
          console.log(`    ID: ${rate.id}`);
          console.log(`    Season: ${rate.seasonFrom} to ${rate.seasonTo}`);
          console.log(`    Base Cost: ₺${rate.baseCostTry}`);
          console.log(`    Pricing Model: ${rate.pricingModel}`);
          console.log(`    Active: ${rate.isActive}`);
        });
      } else {
        console.log('\n❌ NO TRANSFER RATES FOUND!');
      }
    } else {
      console.log('❌ Service offering #3 not found!');
    }

    // Check all transfer rates in the database
    const allRates = await prisma.transferRate.findMany({
      include: {
        serviceOffering: {
          include: {
            supplier: true,
          },
        },
      },
    });

    console.log('\n\n=== ALL TRANSFER RATES IN DATABASE ===');
    console.log(`Total Transfer Rates: ${allRates.length}`);

    if (allRates.length > 0) {
      allRates.forEach((rate, idx) => {
        console.log(`\n  Rate ${idx + 1}:`);
        console.log(`    ID: ${rate.id}`);
        console.log(`    Service Offering ID: ${rate.serviceOfferingId}`);
        console.log(`    Service Offering: ${rate.serviceOffering.title}`);
        console.log(`    Supplier: ${rate.serviceOffering.supplier.name}`);
        console.log(`    Season: ${rate.seasonFrom} to ${rate.seasonTo}`);
        console.log(`    Base Cost: ₺${rate.baseCostTry}`);
        console.log(`    Active: ${rate.isActive}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransferRates();
