const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING PAGE CONTENT MIGRATION ---');
  
  try {
    const pages = await prisma.page.findMany();
    console.log(`Found ${pages.length} pages to check.`);

    let updatedCount = 0;

    for (const page of pages) {
      const content = page.content;

      // Check if content is a Tiptap object (has "type" and is not an array)
      if (content && typeof content === 'object' && !Array.isArray(content) && content.type === 'doc') {
        console.log(`Migrating page: ${page.slug}`);
        
        // Wrap the Tiptap object in a "text" block
        const migratedContent = [
          {
            type: 'text',
            content: content
          }
        ];

        await prisma.page.update({
          where: { id: page.id },
          data: { content: migratedContent }
        });

        updatedCount++;
        console.log(`Successfully migrated ${page.slug}`);
      } else {
        console.log(`Skipping page: ${page.slug} (Already an array or invalid format)`);
      }
    }

    console.log(`\nMigration complete! Updated ${updatedCount} pages.`);
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
