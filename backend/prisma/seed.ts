require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Database seeding başladı...');

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-123';
  const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Admin';
  const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'User';

  // Super Admin kullanıcısını kontrol et
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log('✅ Super Admin zaten mevcut');
    return;
  }

  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Super Admin oluştur
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Super Admin oluşturuldu:', admin.email);
  console.log('📧 Email:', admin.email);
  console.log('👤 İsim:', admin.firstName, admin.lastName);
  console.log('🔐 Rol:', admin.role);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
