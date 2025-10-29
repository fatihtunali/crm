import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Database seeding başladı...');

  // Super Admin kullanıcısını kontrol et
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'fatihtunali@gmail.com' },
  });

  if (existingAdmin) {
    console.log('✅ Super Admin zaten mevcut');
    return;
  }

  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash('Dlr235672.-Yt', 10);

  // Super Admin oluştur
  const admin = await prisma.user.create({
    data: {
      email: 'fatihtunali@gmail.com',
      password: hashedPassword,
      firstName: 'Fatih',
      lastName: 'TUNALI',
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
