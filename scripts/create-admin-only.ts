import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Creating/Updating Admin User...');
  
  const adminPassword = await hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fidevoltz.com' },
    update: {
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@fidevoltz.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      bio: 'System Administrator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  console.log(`✅ Admin user ready:`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
