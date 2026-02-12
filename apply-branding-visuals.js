const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.update({
    where: { key: 'branding.logo' },
    data: { value: 'https://placehold.co/200x50/8B5CF6/white?text=TEST+LOGO' }
  });
  
  await prisma.siteSettings.update({
    where: { key: 'branding.favicon' },
    data: { value: 'https://placehold.co/64x64/8B5CF6/white?text=V' }
  });

  console.log('Test branding visuals applied: Placeholder Logo and Favicon.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
