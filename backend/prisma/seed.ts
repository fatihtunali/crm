import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // 1. Create Admin User (if not exists)
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tourcrm.com' },
    update: {},
    create: {
      email: 'admin@tourcrm.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created\n');

  // 2. Hotels + Pricing
  console.log('🏨 Creating hotels...');
  const hotels = await Promise.all([
    prisma.hotel.create({
      data: {
        name: 'Grand Istanbul Palace',
        address: 'Sultanahmet Mahallesi, Divanyolu Cad. No: 45',
        city: 'İstanbul',
        country: 'Turkey',
        stars: 5,
        phone: '+90 212 555 1234',
        email: 'info@grandistanbulpalace.com',
        contactPerson: 'Mehmet Yılmaz',
        facilities: ['Pool', 'Spa', 'WiFi', 'Restaurant', 'Bar', 'Gym', 'Room Service'],
        notes: 'Lüks 5 yıldızlı otel, Sultanahmet\'te merkezi konumda',
        createdBy: admin.id,
        pricings: {
          create: [
            {
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              doubleRoomPrice: 85,
              singleSupplement: 40,
              tripleRoomPrice: 70,
              child0to2Price: 0,
              child3to5Price: 20,
              child6to11Price: 35,
              notes: 'Kahvaltı dahil',
              createdBy: admin.id,
            },
            {
              seasonName: 'Kış Sezonu 2025',
              startDate: new Date('2025-11-01'),
              endDate: new Date('2026-02-28'),
              doubleRoomPrice: 65,
              singleSupplement: 30,
              tripleRoomPrice: 55,
              child0to2Price: 0,
              child3to5Price: 15,
              child6to11Price: 25,
              notes: 'Kahvaltı dahil',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.hotel.create({
      data: {
        name: 'Cappadocia Cave Suites',
        address: 'Göreme Kasabası, Aydınlı Mahallesi',
        city: 'Nevşehir',
        country: 'Turkey',
        stars: 4,
        phone: '+90 384 555 5678',
        email: 'reservations@cappadociacave.com',
        contactPerson: 'Ayşe Demir',
        facilities: ['WiFi', 'Restaurant', 'Terrace', 'Breakfast', 'Cave Rooms'],
        notes: 'Otantik mağara otel, balon turları için ideal',
        createdBy: admin.id,
        pricings: {
          create: [
            {
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-05-01'),
              endDate: new Date('2025-10-31'),
              doubleRoomPrice: 95,
              singleSupplement: 45,
              tripleRoomPrice: 80,
              child0to2Price: 0,
              child3to5Price: 25,
              child6to11Price: 40,
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.hotel.create({
      data: {
        name: 'Antalya Beach Resort',
        address: 'Lara Sahili, Güzeloba Mah.',
        city: 'Antalya',
        country: 'Turkey',
        stars: 5,
        phone: '+90 242 555 9012',
        email: 'info@antalyabeach.com',
        contactPerson: 'Can Kaya',
        facilities: ['Pool', 'Beach', 'Spa', 'WiFi', 'Restaurant', 'All Inclusive', 'Water Sports'],
        notes: 'Her şey dahil sahil oteli',
        createdBy: admin.id,
        pricings: {
          create: [
            {
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              doubleRoomPrice: 120,
              singleSupplement: 60,
              tripleRoomPrice: 100,
              child0to2Price: 0,
              child3to5Price: 30,
              child6to11Price: 50,
              notes: 'All Inclusive',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ Created ${hotels.length} hotels with pricing\n`);

  // 3. Guides + Pricing
  console.log('👨‍🏫 Creating guides...');
  const guides = await Promise.all([
    prisma.guide.create({
      data: {
        firstName: 'Ahmet',
        lastName: 'Özkan',
        phone: '+90 532 111 2233',
        email: 'ahmet.ozkan@guide.com',
        languages: ['Turkish', 'English', 'German'],
        specializations: ['History', 'Archaeology', 'Byzantine'],
        licenseNumber: 'TR-GUIDE-12345',
        dailyRate: 150,
        rating: 4.8,
        notes: '15 yıllık deneyimli rehber, İstanbul uzmanı',
        createdBy: admin.id,
        pricings: {
          create: [
            {
              city: 'İstanbul',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              serviceType: 'FULL_DAY',
              price: 180,
              notes: '8 saatlik tam gün tur',
              createdBy: admin.id,
            },
            {
              city: 'İstanbul',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              serviceType: 'HALF_DAY',
              price: 100,
              notes: '4 saatlik yarım gün tur',
              createdBy: admin.id,
            },
            {
              city: 'İstanbul',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              serviceType: 'TRANSFER',
              price: 50,
              notes: 'Havaalanı karşılama',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.guide.create({
      data: {
        firstName: 'Zeynep',
        lastName: 'Aydın',
        phone: '+90 535 444 5566',
        email: 'zeynep.aydin@guide.com',
        languages: ['Turkish', 'English', 'French', 'Italian'],
        specializations: ['Art History', 'Ottoman History', 'Culture'],
        licenseNumber: 'TR-GUIDE-67890',
        dailyRate: 170,
        rating: 4.9,
        notes: 'Sanat tarihi uzmanı, 4 dil biliyor',
        createdBy: admin.id,
        pricings: {
          create: [
            {
              city: 'Nevşehir',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-05-01'),
              endDate: new Date('2025-10-31'),
              serviceType: 'FULL_DAY',
              price: 200,
              notes: 'Kapadokya tam gün tur',
              createdBy: admin.id,
            },
            {
              city: 'Nevşehir',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-05-01'),
              endDate: new Date('2025-10-31'),
              serviceType: 'PACKAGE_TOUR',
              price: 150,
              notes: 'Günlük fiyat (paket tur için)',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.guide.create({
      data: {
        firstName: 'Emre',
        lastName: 'Şahin',
        phone: '+90 538 777 8899',
        email: 'emre.sahin@guide.com',
        languages: ['Turkish', 'English', 'Spanish'],
        specializations: ['Archaeology', 'Ancient Cities', 'Mediterranean'],
        licenseNumber: 'TR-GUIDE-11223',
        dailyRate: 160,
        rating: 4.7,
        notes: 'Antik kentler uzmanı',
        createdBy: admin.id,
        pricings: {
          create: [
            {
              city: 'Antalya',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              serviceType: 'FULL_DAY',
              price: 190,
              createdBy: admin.id,
            },
            {
              city: 'Antalya',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              serviceType: 'HALF_DAY',
              price: 110,
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ Created ${guides.length} guides with pricing\n`);

  // 4. Vehicle Suppliers + Pricing
  console.log('🚐 Creating vehicle suppliers...');
  const vehicleSuppliers = await Promise.all([
    prisma.vehicleSupplier.create({
      data: {
        name: 'Istanbul Transfer Services',
        contactPerson: 'Mustafa Çelik',
        phone: '+90 212 555 1111',
        email: 'info@istanbultransfer.com',
        address: 'Atatürk Havalimanı Karşısı',
        city: 'İstanbul',
        taxNumber: '1234567890',
        notes: 'Havaalanı transfer ve şehir içi araç kiralama',
        createdBy: admin.id,
        transferPricings: {
          create: [
            {
              vehicleType: 'VITO',
              fromLocation: 'Istanbul Airport',
              toLocation: 'Sultanahmet Hotels',
              fromCity: 'İstanbul',
              toCity: 'İstanbul',
              price: 45,
              currency: 'EUR',
              createdBy: admin.id,
            },
            {
              vehicleType: 'SPRINTER',
              fromLocation: 'Istanbul Airport',
              toLocation: 'Taksim Hotels',
              fromCity: 'İstanbul',
              toCity: 'İstanbul',
              price: 65,
              currency: 'EUR',
              createdBy: admin.id,
            },
          ],
        },
        allocationPricings: {
          create: [
            {
              vehicleType: 'VITO',
              city: 'İstanbul',
              allocationType: 'FULL_DAY',
              basePrice: 150,
              baseHours: 8,
              extraHourPrice: 20,
              currency: 'EUR',
              notes: '8 saat + ekstra saat ücreti',
              createdBy: admin.id,
            },
            {
              vehicleType: 'SPRINTER',
              city: 'İstanbul',
              allocationType: 'FULL_DAY',
              basePrice: 200,
              baseHours: 8,
              extraHourPrice: 25,
              currency: 'EUR',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.vehicleSupplier.create({
      data: {
        name: 'Cappadocia Tours & Transport',
        contactPerson: 'Ali Yıldız',
        phone: '+90 384 555 2222',
        email: 'info@cappadociatours.com',
        address: 'Göreme Merkez',
        city: 'Nevşehir',
        taxNumber: '9876543210',
        createdBy: admin.id,
        transferPricings: {
          create: [
            {
              vehicleType: 'VITO',
              fromLocation: 'Kayseri Airport',
              toLocation: 'Göreme Hotels',
              fromCity: 'Kayseri',
              toCity: 'Nevşehir',
              price: 60,
              currency: 'EUR',
              notes: '1 saat transfer',
              createdBy: admin.id,
            },
          ],
        },
        allocationPricings: {
          create: [
            {
              vehicleType: 'VITO',
              city: 'Nevşehir',
              allocationType: 'PACKAGE_TOUR',
              packageDays: 7,
              packagePrice: 850,
              extraDayPrice: 125,
              currency: 'EUR',
              notes: '7 günlük paket tur',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.vehicleSupplier.create({
      data: {
        name: 'Antalya Coach Services',
        contactPerson: 'Hakan Özdemir',
        phone: '+90 242 555 3333',
        email: 'info@antalyacoach.com',
        address: 'Lara Yolu',
        city: 'Antalya',
        taxNumber: '5555666677',
        createdBy: admin.id,
        transferPricings: {
          create: [
            {
              vehicleType: 'COACH',
              fromLocation: 'Antalya Airport',
              toLocation: 'Lara Beach Hotels',
              fromCity: 'Antalya',
              toCity: 'Antalya',
              price: 120,
              currency: 'EUR',
              notes: '46 kişilik otobüs',
              createdBy: admin.id,
            },
          ],
        },
        allocationPricings: {
          create: [
            {
              vehicleType: 'COACH',
              city: 'Antalya',
              allocationType: 'FULL_DAY',
              basePrice: 400,
              baseHours: 10,
              extraHourPrice: 50,
              currency: 'EUR',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ Created ${vehicleSuppliers.length} vehicle suppliers with pricing\n`);

  // 5. Entrance Fees (Museum Suppliers)
  console.log('🎫 Creating entrance fees...');
  const entranceFees = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Topkapı Sarayı',
        type: 'MUSEUM',
        city: 'İstanbul',
        contactPerson: 'Müze Müdürlüğü',
        phone: '+90 212 512 0480',
        notes: 'Osmanlı padişahlarının 400 yıl yaşadığı saray',
        createdBy: admin.id,
        entranceFees: {
          create: [
            {
              city: 'İstanbul',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-04-01'),
              endDate: new Date('2025-10-31'),
              adultPrice: 25,
              child0to6Price: 0,
              child7to12Price: 12.5,
              studentPrice: 15,
              currency: 'EUR',
              notes: 'Harem Dairesi ayrı bilet',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Efes Antik Kenti',
        type: 'MUSEUM',
        city: 'İzmir',
        contactPerson: 'Ören Yeri Müdürlüğü',
        phone: '+90 232 892 6010',
        notes: 'Antik dönemin en iyi korunmuş kentlerinden biri',
        createdBy: admin.id,
        entranceFees: {
          create: [
            {
              city: 'İzmir',
              seasonName: 'Yıl Boyu 2025',
              startDate: new Date('2025-01-01'),
              endDate: new Date('2025-12-31'),
              adultPrice: 20,
              child0to6Price: 0,
              child7to12Price: 10,
              studentPrice: 12,
              currency: 'EUR',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Göreme Açık Hava Müzesi',
        type: 'MUSEUM',
        city: 'Nevşehir',
        contactPerson: 'Müze Müdürlüğü',
        phone: '+90 384 271 2167',
        notes: 'UNESCO Dünya Mirası, kaya kiliseler',
        createdBy: admin.id,
        entranceFees: {
          create: [
            {
              city: 'Nevşehir',
              seasonName: 'Yıl Boyu 2025',
              startDate: new Date('2025-01-01'),
              endDate: new Date('2025-12-31'),
              adultPrice: 18,
              child0to6Price: 0,
              child7to12Price: 9,
              studentPrice: 10,
              currency: 'EUR',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ Created ${entranceFees.length} entrance fees\n`);

  // 6. Restaurant Suppliers + Pricing
  console.log('🍽️ Creating restaurant suppliers...');
  const restaurants = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Sultanahmet Köftecisi',
        type: 'RESTAURANT',
        city: 'İstanbul',
        contactPerson: 'Ahmet Bey',
        phone: '+90 212 520 0566',
        email: 'info@sultanahmetkoftecisi.com',
        notes: 'Ünlü köfte restoranı, 1920\'den beri',
        createdBy: admin.id,
        supplierPricings: {
          create: [
            {
              city: 'İstanbul',
              serviceType: 'LUNCH',
              seasonName: 'Yıl Boyu 2025',
              startDate: new Date('2025-01-01'),
              endDate: new Date('2025-12-31'),
              price: 15,
              currency: 'EUR',
              notes: 'Köfte menü + içecek',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Cappadocia Restaurant',
        type: 'RESTAURANT',
        city: 'Nevşehir',
        contactPerson: 'Mehmet Bey',
        phone: '+90 384 271 2882',
        email: 'info@cappadociarestaurant.com',
        notes: 'Yerel Kapadokya mutfağı, mağara restoran',
        createdBy: admin.id,
        supplierPricings: {
          create: [
            {
              city: 'Nevşehir',
              serviceType: 'DINNER',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-05-01'),
              endDate: new Date('2025-10-31'),
              price: 30,
              currency: 'EUR',
              notes: 'Testi kebabı menü',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.supplier.create({
      data: {
        name: '7 Mehmet Restaurant',
        type: 'RESTAURANT',
        city: 'Antalya',
        contactPerson: 'Hasan Bey',
        phone: '+90 242 238 5200',
        email: 'info@7mehmet.com',
        notes: 'Liman manzaralı balık restoranı',
        createdBy: admin.id,
        supplierPricings: {
          create: [
            {
              city: 'Antalya',
              serviceType: 'LUNCH',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              price: 25,
              currency: 'EUR',
              notes: 'Balık menü + meze',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ Created ${restaurants.length} restaurants with pricing\n`);

  // 7. Activity Suppliers + Pricing
  console.log('🎈 Creating activity suppliers...');
  const activities = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Cappadocia Balloons',
        type: 'ACTIVITY',
        city: 'Nevşehir',
        contactPerson: 'Pilot Ahmet',
        phone: '+90 384 271 3030',
        email: 'info@cappadociaballoons.com',
        notes: 'Sıcak hava balonu turları',
        createdBy: admin.id,
        supplierPricings: {
          create: [
            {
              city: 'Nevşehir',
              serviceType: 'ACTIVITY',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-04-01'),
              endDate: new Date('2025-11-30'),
              price: 180,
              currency: 'EUR',
              notes: 'Standart balon turu (60-90 dk)',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Bosphorus Cruise Company',
        type: 'ACTIVITY',
        city: 'İstanbul',
        contactPerson: 'Kaptan Selim',
        phone: '+90 212 522 4444',
        email: 'info@bosphoruscruise.com',
        notes: 'Boğaz turu tekneleri',
        createdBy: admin.id,
        supplierPricings: {
          create: [
            {
              city: 'İstanbul',
              serviceType: 'ACTIVITY',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-05-01'),
              endDate: new Date('2025-10-31'),
              price: 35,
              currency: 'EUR',
              notes: 'Kısa boğaz turu (2 saat)',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Antalya Diving Center',
        type: 'ACTIVITY',
        city: 'Antalya',
        contactPerson: 'Instructor Can',
        phone: '+90 242 248 5050',
        email: 'info@antalyadiving.com',
        notes: 'Dalış turları ve eğitimleri',
        createdBy: admin.id,
        supplierPricings: {
          create: [
            {
              city: 'Antalya',
              serviceType: 'ACTIVITY',
              seasonName: 'Yaz Sezonu 2025',
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-09-30'),
              price: 75,
              currency: 'EUR',
              notes: 'Tek dalış + ekipman',
              createdBy: admin.id,
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ Created ${activities.length} activity suppliers with pricing\n`);

  // 8. Agents + Their Customers
  console.log('🏢 Creating agents and their customers...');
  const agent1 = await prisma.agent.create({
    data: {
      companyName: 'Euro Travel Agency',
      taxNumber: 'DE123456789',
      contactPerson: 'Hans Müller',
      email: 'hans@eurotravel.de',
      phone: '+49 30 12345678',
      address: 'Hauptstraße 123',
      city: 'Berlin',
      country: 'Germany',
      paymentTerms: 'Net 30',
      creditLimit: 50000,
      commissionRate: 12,
      contractStart: new Date('2024-01-01'),
      contractEnd: new Date('2026-12-31'),
      notes: 'Almanya\'nın en büyük tur operatörlerinden',
      createdBy: admin.id,
      customers: {
        create: [
          {
            firstName: 'Klaus',
            lastName: 'Schmidt',
            email: 'klaus.schmidt@email.de',
            phone: '+49 171 1234567',
            dateOfBirth: new Date('1975-05-15'),
            nationality: 'German',
            passportNumber: 'C01X00T47',
            passportExpiry: new Date('2028-08-20'),
            country: 'Germany',
            preferences: ['Historical Tours', 'Cultural Activities'],
            marketingConsent: true,
            createdBy: admin.id,
          },
          {
            firstName: 'Anna',
            lastName: 'Weber',
            email: 'anna.weber@email.de',
            phone: '+49 172 2345678',
            dateOfBirth: new Date('1982-09-22'),
            nationality: 'German',
            passportNumber: 'C02Y11T88',
            passportExpiry: new Date('2027-12-10'),
            country: 'Germany',
            preferences: ['Beach Holidays', 'Shopping'],
            marketingConsent: true,
            createdBy: admin.id,
          },
        ],
      },
    },
  });

  const agent2 = await prisma.agent.create({
    data: {
      companyName: 'France Voyages',
      taxNumber: 'FR987654321',
      contactPerson: 'Pierre Dubois',
      email: 'pierre@francevoyages.fr',
      phone: '+33 1 45678901',
      address: 'Avenue des Champs-Élysées 45',
      city: 'Paris',
      country: 'France',
      paymentTerms: 'Net 45',
      creditLimit: 40000,
      commissionRate: 10,
      contractStart: new Date('2024-03-01'),
      contractEnd: new Date('2026-12-31'),
      createdBy: admin.id,
      customers: {
        create: [
          {
            firstName: 'Marie',
            lastName: 'Laurent',
            email: 'marie.laurent@email.fr',
            phone: '+33 6 12345678',
            dateOfBirth: new Date('1988-03-10'),
            nationality: 'French',
            passportNumber: '14FR89023',
            passportExpiry: new Date('2029-05-15'),
            country: 'France',
            preferences: ['Culinary Tours', 'Wine Tasting'],
            marketingConsent: true,
            createdBy: admin.id,
          },
        ],
      },
    },
  });

  const agent3 = await prisma.agent.create({
    data: {
      companyName: 'British Tours Ltd',
      taxNumber: 'GB444555666',
      contactPerson: 'John Smith',
      email: 'john@britishtours.co.uk',
      phone: '+44 20 7123 4567',
      address: 'Oxford Street 200',
      city: 'London',
      country: 'United Kingdom',
      paymentTerms: 'Net 30',
      creditLimit: 60000,
      commissionRate: 15,
      contractStart: new Date('2023-06-01'),
      contractEnd: new Date('2026-12-31'),
      notes: 'VIP müşteriler, yüksek komisyon',
      createdBy: admin.id,
      customers: {
        create: [
          {
            firstName: 'Emma',
            lastName: 'Johnson',
            email: 'emma.johnson@email.co.uk',
            phone: '+44 7700 123456',
            dateOfBirth: new Date('1990-11-28'),
            nationality: 'British',
            passportNumber: '707345678',
            passportExpiry: new Date('2028-03-30'),
            country: 'United Kingdom',
            preferences: ['Adventure Tours', 'Photography'],
            marketingConsent: true,
            createdBy: admin.id,
          },
          {
            firstName: 'Oliver',
            lastName: 'Brown',
            email: 'oliver.brown@email.co.uk',
            phone: '+44 7701 234567',
            dateOfBirth: new Date('1985-07-14'),
            nationality: 'British',
            passportNumber: '808456789',
            passportExpiry: new Date('2027-09-22'),
            country: 'United Kingdom',
            preferences: ['Historical Tours', 'Museums'],
            marketingConsent: false,
            createdBy: admin.id,
          },
        ],
      },
    },
  });
  console.log('✅ Created 3 agents with their customers\n');

  // 9. Direct Customers (B2C)
  console.log('👤 Creating direct customers...');
  const directCustomers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        email: 'ayse.yilmaz@email.com',
        phone: '+90 532 111 2222',
        dateOfBirth: new Date('1992-04-18'),
        nationality: 'Turkish',
        passportNumber: 'TR123456',
        passportExpiry: new Date('2029-12-31'),
        country: 'Turkey',
        city: 'İstanbul',
        preferences: ['Weekend Getaways', 'Nature'],
        marketingConsent: true,
        createdBy: admin.id,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Mehmet',
        lastName: 'Kaya',
        email: 'mehmet.kaya@email.com',
        phone: '+90 533 222 3333',
        dateOfBirth: new Date('1980-08-25'),
        nationality: 'Turkish',
        passportNumber: 'TR789012',
        passportExpiry: new Date('2028-06-15'),
        country: 'Turkey',
        city: 'Ankara',
        preferences: ['Family Tours', 'All Inclusive'],
        marketingConsent: true,
        createdBy: admin.id,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Anderson',
        email: 'sarah.anderson@email.com',
        phone: '+1 555 123 4567',
        dateOfBirth: new Date('1995-12-03'),
        nationality: 'American',
        passportNumber: 'US456789',
        passportExpiry: new Date('2030-01-20'),
        country: 'United States',
        preferences: ['Cultural Tours', 'Photography'],
        marketingConsent: true,
        createdBy: admin.id,
      },
    }),
  ]);
  console.log(`✅ Created ${directCustomers.length} direct customers\n`);

  // 10. EXAMPLE RESERVATIONS
  console.log('📅 Creating example reservations...');

  // Get customer IDs for reservations
  const ayseYilmaz = directCustomers[0]; // B2C customer
  const klausSchmidt = await prisma.customer.findFirst({
    where: { email: 'klaus.schmidt@email.de' }
  }); // B2B customer from Euro Travel Agency

  // RESERVATION 1: B2C - Ayşe Yılmaz (Direct Customer)
  // 3-day Istanbul tour with family
  const reservation1 = await prisma.reservation.create({
    data: {
      reservationCode: 'REZ-2025-0001', // Normally auto-generated, but for seed we set it
      customerId: ayseYilmaz.id,
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-03'),
      totalDays: 3,
      totalCost: 550, // What we pay to suppliers
      totalPrice: 800, // What customer pays us
      profit: 250, // Our profit
      currency: 'EUR',
      adultCount: 2,
      childCount: 1,
      notes: 'Çocuk için özel yemek talebi var. Vejetaryen menü.',
      internalNotes: 'İlk rezervasyon, iyi takip et. Müşteri memnun kalırsa tekrar gelir.',
      status: 'CONFIRMED',
      createdBy: admin.id,

      // Participants (Katılımcılar)
      participants: {
        create: [
          {
            participantType: 'ADULT',
            firstName: 'Ayşe',
            lastName: 'Yılmaz',
            age: 32,
          },
          {
            participantType: 'ADULT',
            firstName: 'Mehmet',
            lastName: 'Yılmaz',
            age: 35,
          },
          {
            participantType: 'CHILD_6_11',
            firstName: 'Zeynep',
            lastName: 'Yılmaz',
            age: 8,
          },
        ],
      },

      // Daily Itinerary (Günlük Program)
      days: {
        create: [
          // Day 1: Istanbul Historical Tour
          {
            dayNumber: 1,
            date: new Date('2025-07-01'),
            hotelId: hotels[0].id, // Grand Istanbul Palace
            roomType: 'DOUBLE',
            guideId: guides[0].id, // Ahmet Özkan
            guideService: 'FULL_DAY',
            breakfast: true,
            lunch: true,
            dinner: true,
            description: 'İstanbul Tarihi Yarımada Turu - Topkapı Sarayı, Ayasofya, Sultanahmet Camii',
            notes: 'Öğle yemeği Sultanahmet Köftecisi\'nde. Çocuk için vejetaryen menü.',
            dayCost: 200, // Hotel €85 + Guide €180/2 = €90 + Entrance €25×2+€12.5 = €62.5 ≈ €200
            dayPrice: 280, // Markup
            activities: {
              create: [
                {
                  activityType: 'ENTRANCE_FEE',
                  supplierId: entranceFees[0].id, // Topkapı Sarayı
                  name: 'Topkapı Sarayı Giriş',
                  cost: 62.5, // 2 adults €25 each + 1 child €12.5
                  price: 80, // Customer price with markup
                  notes: '2 yetişkin + 1 çocuk (7-12 yaş)',
                },
              ],
            },
          },

          // Day 2: Bosphorus Cruise + Asian Side
          {
            dayNumber: 2,
            date: new Date('2025-07-02'),
            hotelId: hotels[0].id, // Grand Istanbul Palace
            roomType: 'DOUBLE',
            guideId: guides[0].id, // Ahmet Özkan
            guideService: 'FULL_DAY',
            breakfast: true,
            lunch: true,
            dinner: false,
            description: 'Boğaz Turu ve Anadolu Yakası - Boğaz gezisi, Beylerbeyi Sarayı, Çamlıca Tepesi',
            notes: 'Boğaz turunda hafif bir deniz olabilir, dramamine hazır olsun.',
            dayCost: 175,
            dayPrice: 250,
            activities: {
              create: [
                {
                  activityType: 'ACTIVITY',
                  supplierId: activities[1].id, // Bosphorus Cruise Company
                  name: 'Boğaz Turu',
                  cost: 105, // €35 × 3 people
                  price: 135, // Customer price
                  notes: '2 saat boğaz turu, 3 kişi',
                },
              ],
            },
          },

          // Day 3: Shopping + Departure
          {
            dayNumber: 3,
            date: new Date('2025-07-03'),
            hotelId: hotels[0].id, // Grand Istanbul Palace
            roomType: 'DOUBLE',
            guideId: guides[0].id, // Ahmet Özkan
            guideService: 'HALF_DAY',
            breakfast: true,
            lunch: true,
            dinner: false,
            transferType: 'AIRPORT_DROP',
            vehicleType: 'VITO',
            description: 'Kapalı Çarşı alışveriş turu ve havaalanına transfer',
            notes: 'Uçak saati 18:00, saat 15:00\'te otelden çıkış.',
            dayCost: 175,
            dayPrice: 270,
          },
        ],
      },

      // Payment
      payments: {
        create: [
          {
            amount: 300, // Partial payment (deposit)
            currency: 'EUR',
            paymentMethod: 'CREDIT_CARD',
            paymentDate: new Date('2025-06-15'),
            notes: 'Ön ödeme, kredi kartı ile alındı',
            createdBy: admin.id,
          },
        ],
      },
    },
    include: {
      customer: true,
      days: { include: { activities: true } },
      participants: true,
      payments: true,
    },
  });

  // Update reservation paid/remaining amounts
  await prisma.reservation.update({
    where: { id: reservation1.id },
    data: {
      paidAmount: 300,
      remainingAmount: 500, // €800 - €300
    },
  });

  console.log(`✅ Reservation 1 (B2C): ${reservation1.reservationCode} - Ayşe Yılmaz`);

  // RESERVATION 2: B2B - Klaus Schmidt (Euro Travel Agency)
  // 7-day Cappadocia package tour with balloon
  const reservation2 = await prisma.reservation.create({
    data: {
      reservationCode: 'REZ-2025-0002',
      customerId: klausSchmidt!.id,
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-08-21'),
      totalDays: 7,
      totalCost: 1800, // What we pay
      totalPrice: 2570, // What agent pays us
      profit: 770, // Our profit (agent will add their commission on top)
      currency: 'EUR',
      adultCount: 2,
      childCount: 0,
      notes: 'Honeymoon package - extra romantic touches requested',
      internalNotes: 'VIP agent customer. Ensure premium service. Free upgrade to deluxe cave room if available.',
      status: 'CONFIRMED',
      createdBy: admin.id,

      participants: {
        create: [
          {
            participantType: 'ADULT',
            firstName: 'Klaus',
            lastName: 'Schmidt',
            age: 49,
          },
          {
            participantType: 'ADULT',
            firstName: 'Petra',
            lastName: 'Schmidt',
            age: 47,
          },
        ],
      },

      days: {
        create: [
          // Day 1: Arrival
          {
            dayNumber: 1,
            date: new Date('2025-08-15'),
            hotelId: hotels[1].id, // Cappadocia Cave Suites
            roomType: 'DOUBLE',
            transferType: 'AIRPORT_PICKUP',
            vehicleType: 'VITO',
            breakfast: false,
            lunch: false,
            dinner: true,
            description: 'Kayseri Havalimanı karşılama ve otele transfer',
            notes: 'Flight: LH1234, arrival 14:30. Welcome drinks in cave terrace.',
            dayCost: 200,
            dayPrice: 280,
          },

          // Day 2: Hot Air Balloon + North Cappadocia
          {
            dayNumber: 2,
            date: new Date('2025-08-16'),
            hotelId: hotels[1].id,
            roomType: 'DOUBLE',
            guideId: guides[1].id, // Zeynep Aydın
            guideService: 'FULL_DAY',
            breakfast: true,
            lunch: true,
            dinner: true,
            description: 'Sıcak hava balonu turu ve Kuzey Kapadokya - Göreme, Paşabağı, Devrent Vadisi',
            notes: 'Balon turu 05:00-07:00, sonra kahvaltı. Romantik akşam yemeği rezerve edildi.',
            dayCost: 500, // Balloon €180×2 + Guide + Hotel
            dayPrice: 650,
            activities: {
              create: [
                {
                  activityType: 'ACTIVITY',
                  supplierId: activities[0].id, // Cappadocia Balloons
                  name: 'Sıcak Hava Balonu Turu',
                  cost: 360, // €180 × 2 people
                  price: 460, // Customer price
                  notes: 'Standart balon turu, 2 kişi. Champagne breakfast included.',
                },
              ],
            },
          },

          // Day 3: South Cappadocia
          {
            dayNumber: 3,
            date: new Date('2025-08-17'),
            hotelId: hotels[1].id,
            roomType: 'DOUBLE',
            guideId: guides[1].id,
            guideService: 'FULL_DAY',
            breakfast: true,
            lunch: true,
            dinner: true,
            description: 'Güney Kapadokya Turu - Kaymaklı Yeraltı Şehri, Ihlara Vadisi',
            notes: 'Yeraltı şehrinde dar geçitler var, dikkat.',
            dayCost: 300,
            dayPrice: 400,
            activities: {
              create: [
                {
                  activityType: 'ENTRANCE_FEE',
                  supplierId: entranceFees[2].id, // Göreme Açık Hava Müzesi
                  name: 'Göreme Açık Hava Müzesi',
                  cost: 36, // €18 × 2
                  price: 50,
                  notes: '2 yetişkin giriş',
                },
              ],
            },
          },

          // Day 4: Free Day
          {
            dayNumber: 4,
            date: new Date('2025-08-18'),
            hotelId: hotels[1].id,
            roomType: 'DOUBLE',
            breakfast: true,
            lunch: false,
            dinner: true,
            description: 'Serbest Gün - Otel dinlenme, spa, havuz',
            notes: 'Couple massage booked for 14:00 (paid separately by customer)',
            dayCost: 150,
            dayPrice: 230,
          },

          // Day 5: Pottery Workshop + Wine Tasting
          {
            dayNumber: 5,
            date: new Date('2025-08-19'),
            hotelId: hotels[1].id,
            roomType: 'DOUBLE',
            guideId: guides[1].id,
            guideService: 'FULL_DAY',
            breakfast: true,
            lunch: true,
            dinner: true,
            description: 'Çömlekçilik atölyesi ve şarap tadımı - Avanos, yerel şaraphane',
            notes: 'Pottery workshop hands-on experience. Wine tasting at sunset.',
            dayCost: 250,
            dayPrice: 350,
          },

          // Day 6: Hiking + Local Village
          {
            dayNumber: 6,
            date: new Date('2025-08-20'),
            hotelId: hotels[1].id,
            roomType: 'DOUBLE',
            guideId: guides[1].id,
            guideService: 'FULL_DAY',
            breakfast: true,
            lunch: true,
            dinner: true,
            description: 'Rose Valley yürüyüşü ve yerel köy ziyareti - Çavuşin, Uçhisar',
            notes: 'Easy hiking trail. Traditional Turkish home dinner.',
            dayCost: 200,
            dayPrice: 300,
          },

          // Day 7: Departure
          {
            dayNumber: 7,
            date: new Date('2025-08-21'),
            hotelId: hotels[1].id,
            roomType: 'DOUBLE',
            transferType: 'AIRPORT_DROP',
            vehicleType: 'VITO',
            breakfast: true,
            lunch: false,
            dinner: false,
            description: 'Kayseri Havalimanına transfer',
            notes: 'Flight: LH1235, departure 16:00. Check-out 12:00, late lunch at airport.',
            dayCost: 200,
            dayPrice: 280,
          },
        ],
      },

      payments: {
        create: [
          {
            amount: 2570, // Full payment (agents usually pay upfront or net 30)
            currency: 'EUR',
            paymentMethod: 'BANK_TRANSFER',
            paymentDate: new Date('2025-07-20'),
            notes: 'Full payment received via bank transfer - Euro Travel Agency',
            createdBy: admin.id,
          },
        ],
      },
    },
    include: {
      customer: {
        include: {
          agent: true, // Include agent info
        },
      },
      days: { include: { activities: true } },
      participants: true,
      payments: true,
    },
  });

  await prisma.reservation.update({
    where: { id: reservation2.id },
    data: {
      paidAmount: 2570,
      remainingAmount: 0, // Fully paid
    },
  });

  console.log(`✅ Reservation 2 (B2B): ${reservation2.reservationCode} - Klaus Schmidt (Euro Travel Agency)`);
  console.log('');

  console.log('✨ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - 1 Admin User`);
  console.log(`   - ${hotels.length} Hotels (with seasonal pricing)`);
  console.log(`   - ${guides.length} Guides (with service pricing)`);
  console.log(`   - ${vehicleSuppliers.length} Vehicle Suppliers (with transfer & allocation pricing)`);
  console.log(`   - ${entranceFees.length} Entrance Fees (museum suppliers)`);
  console.log(`   - ${restaurants.length} Restaurants (with meal pricing)`);
  console.log(`   - ${activities.length} Activity Suppliers (with activity pricing)`);
  console.log(`   - 3 Agents (with 5 B2B customers total)`);
  console.log(`   - ${directCustomers.length} Direct Customers (B2C)`);
  console.log(`   - 2 Example Reservations (1 B2C + 1 B2B)`);
  console.log(`\n✅ All modules now have test data!\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
