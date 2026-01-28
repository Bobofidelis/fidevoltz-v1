const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  
  console.log('--- USERS IN DATABASE ---');
  users.forEach(u => {
    console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
