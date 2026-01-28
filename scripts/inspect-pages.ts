const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany({
    take: 10,
    select: { id: true, slug: true, content: true }
  });
  
  console.log('--- DATABASE PAGES CONTENT ---');
  pages.forEach(p => {
    console.log(`Slug: ${p.slug}`);
    console.log(`Type: ${typeof p.content}`);
    console.log(`IsArray: ${Array.isArray(p.content)}`);
    console.log(`Content Sample: ${JSON.stringify(p.content).substring(0, 100)}...`);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
