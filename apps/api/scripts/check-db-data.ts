import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('\n=== CHECKING DATABASE DATA ===\n');

    // Check Tenants
    const tenants = await prisma.tenant.findMany({ take: 5 });
    console.log(`📊 Tenants: ${tenants.length} found`);
    tenants.forEach(t => console.log(`  - ${t.name} (${t.code})`));

    // Check Parties
    const parties = await prisma.party.findMany({ take: 5 });
    console.log(`\n📊 Parties: ${parties.length} found`);
    parties.forEach(p => console.log(`  - ${p.name} (${p.city || 'N/A'})`));

    // Check Suppliers
    const suppliers = await prisma.supplier.findMany({
      take: 10,
      include: { party: true }
    });
    console.log(`\n📊 Suppliers: ${suppliers.length} found`);
    suppliers.forEach(s => console.log(`  - ${s.party.name} (${s.type})`));

    // Check Service Offerings
    const serviceOfferings = await prisma.serviceOffering.findMany({
      take: 10,
      include: { supplier: { include: { party: true } } }
    });
    console.log(`\n📊 Service Offerings: ${serviceOfferings.length} found`);
    serviceOfferings.forEach(so =>
      console.log(`  - ${so.title} (${so.serviceType}) - ${so.supplier.party.name}`)
    );

    // Check Hotel Rooms
    const hotelRooms = await prisma.hotelRoom.findMany({ take: 10 });
    console.log(`\n📊 Hotel Rooms: ${hotelRooms.length} found`);
    hotelRooms.forEach(hr => console.log(`  - ${hr.hotelName} (${hr.roomType})`));

    // Check Hotel Room Rates
    const hotelRoomRates = await prisma.hotelRoomRate.findMany({ take: 10 });
    console.log(`\n📊 Hotel Room Rates: ${hotelRoomRates.length} found`);
    hotelRoomRates.forEach(hrr =>
      console.log(`  - Rate ID ${hrr.id}: ${hrr.boardType}, ${hrr.seasonFrom.toISOString().split('T')[0]} to ${hrr.seasonTo.toISOString().split('T')[0]}`)
    );

    // Check Transfers
    const transfers = await prisma.transfer.findMany({ take: 10 });
    console.log(`\n📊 Transfers: ${transfers.length} found`);
    transfers.forEach(t =>
      console.log(`  - ${t.city}: ${t.originZone} → ${t.destZone} (${t.vehicleClass})`)
    );

    // Check Transfer Rates
    const transferRates = await prisma.transferRate.findMany({ take: 10 });
    console.log(`\n📊 Transfer Rates: ${transferRates.length} found`);
    transferRates.forEach(tr =>
      console.log(`  - Rate ID ${tr.id}: ${tr.baseCostTry} TRY (${tr.pricingModel})`)
    );

    // Check Vehicles
    const vehicles = await prisma.vehicle.findMany({ take: 10 });
    console.log(`\n📊 Vehicles: ${vehicles.length} found`);
    vehicles.forEach(v =>
      console.log(`  - ${v.make} ${v.model} (${v.vehicleClass}) - ${v.withDriver ? 'With Driver' : 'Self Drive'}`)
    );

    // Check Vehicle Rates
    const vehicleRates = await prisma.vehicleRate.findMany({ take: 10 });
    console.log(`\n📊 Vehicle Rates: ${vehicleRates.length} found`);
    vehicleRates.forEach(vr =>
      console.log(`  - Rate ID ${vr.id}: ${vr.dailyRateTry} TRY/day, ${vr.hourlyRateTry} TRY/hour`)
    );

    // Check Guides
    const guides = await prisma.guide.findMany({ take: 10 });
    console.log(`\n📊 Guides: ${guides.length} found`);
    guides.forEach(g => console.log(`  - ${g.guideName} (License: ${g.licenseNo || 'N/A'})`));

    // Check Guide Rates
    const guideRates = await prisma.guideRate.findMany({ take: 10 });
    console.log(`\n📊 Guide Rates: ${guideRates.length} found`);
    guideRates.forEach(gr =>
      console.log(`  - Rate ID ${gr.id}: ${gr.dayCostTry || 0} TRY/day (${gr.pricingModel})`)
    );

    // Check Activities
    const activities = await prisma.activity.findMany({ take: 10 });
    console.log(`\n📊 Activities: ${activities.length} found`);
    activities.forEach(a => console.log(`  - ${a.operatorName} (${a.activityType})`));

    // Check Activity Rates
    const activityRates = await prisma.activityRate.findMany({ take: 10 });
    console.log(`\n📊 Activity Rates: ${activityRates.length} found`);
    activityRates.forEach(ar =>
      console.log(`  - Rate ID ${ar.id}: ${ar.baseCostTry} TRY (${ar.pricingModel})`)
    );

    // Check Contacts
    const contacts = await prisma.contact.findMany({ take: 10 });
    console.log(`\n📊 Contacts: ${contacts.length} found`);
    contacts.forEach(c => console.log(`  - ${c.name} (${c.contactType})`));

    // Check Clients
    const clients = await prisma.client.findMany({ take: 5 });
    console.log(`\n📊 Clients: ${clients.length} found`);
    clients.forEach(c => console.log(`  - ${c.name} (${c.email || 'N/A'})`));

    // Check Bookings
    const bookings = await prisma.booking.findMany({ take: 5 });
    console.log(`\n📊 Bookings: ${bookings.length} found`);
    bookings.forEach(b => console.log(`  - ${b.bookingCode} (${b.status})`));

    console.log('\n=== DATABASE CHECK COMPLETE ===\n');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();
