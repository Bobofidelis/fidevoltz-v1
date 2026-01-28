import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAGES = [
  {
    title: 'Help Center',
    slug: 'support', // User mentioned /support returning 404
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Help Center' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Welcome to our help center. How can we assist you today?' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Contact Us' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Get in touch with us via email or phone.' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'Careers',
    slug: 'careers',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Careers' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Join our team! Open positions listed below.' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'Shipping Info',
    slug: 'shipping',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Shipping Information' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'We ship worldwide using trusted carriers.' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'Returns',
    slug: 'returns',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Returns Policy' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'You can return items within 30 days of receipt.' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'FAQ',
    slug: 'faq',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Frequently Asked Questions' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Q: How do I track my order? A: Use the tracking link in your email.' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'Legal',
    slug: 'legal',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Legal Info' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Legal disclaimers and information.' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Privacy Policy' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'We value your privacy and protect your data.' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Terms of Service' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'By using our site, you agree to these terms.' }] }
      ]
    },
    isPublished: true,
  },
  {
    title: 'Cookie Policy',
    slug: 'cookie-policy',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Cookie Policy' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'We use cookies to improve your experience.' }] }
      ]
    },
    isPublished: true,
  },
];

async function main() {
  console.log('📄 Seeding Pages...');

  for (const page of PAGES) {
    const existing = await prisma.page.findUnique({
      where: { slug: page.slug },
    });

    if (!existing) {
      await prisma.page.create({
        data: page,
      });
      console.log(`✅ Created page: ${page.title} (${page.slug})`);
    } else {
      console.log(`ℹ️  Page already exists: ${page.title} (${page.slug})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
