import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('\n=== USERS IN DATABASE ===');
    console.log(`Total Users: ${users.length}\n`);

    users.forEach((user, idx) => {
      console.log(`User ${idx + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Tenant: ${user.tenant?.name || 'N/A'} (ID: ${user.tenant?.id || 'N/A'})`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
