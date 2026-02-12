const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Primary Color to Purple and Site Name to include 'Verified'
  await prisma.siteSettings.update({
    where: { key: 'branding.primaryColor' },
    data: { value: '#8B5CF6' }
  });
  
  await prisma.siteSettings.update({
    where: { key: 'branding.siteName' },
    data: { value: 'FideVoltz Verified' }
  });

  console.log('Test settings applied: Purple color and "FideVoltz Verified" name.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
