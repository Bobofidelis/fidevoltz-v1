const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSettings.findMany({
    where: { category: 'branding' }
  });
  console.log('--- Branding Settings in DB ---');
  settings.forEach(s => {
    console.log(`${s.key}: ${s.value}`);
  });
  console.log('-------------------------------');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
