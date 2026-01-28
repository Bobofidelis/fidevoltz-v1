const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const page = await prisma.page.findFirst();
    if (!page) {
      console.log('No page found to test.');
      return;
    }

    console.log(`Testing update on page: ${page.slug} (ID: ${page.id})`);
    
    // Attempt a mock update with a block-based structure
    const updatedPage = await prisma.page.update({
      where: { id: page.id },
      data: {
        title: page.title + ' (Test Update)',
        content: [
          { type: 'text', content: '<p>Test update content</p>' }
        ]
      }
    });

    console.log('Update successful!');
    console.log('Updated Page Content:', JSON.stringify(updatedPage.content));

  } catch (err) {
    console.error('Prisma Update Error Detail:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
