import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const staticPages = [
  {
    title: 'About Us',
    slug: 'about',
    content: [
      {
        type: 'hero',
        title: 'Empowering the Next Generation of Makers & Innovators',
        subtitle: 'FideVoltz is more than just a tutorial site. We are a community-driven platform dedicated to making electronics education accessible, practical, and fun for everyone.',
        badge: 'Our Mission',
        backgroundImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1600&q=80'
      },
      {
        type: 'text',
        content: `<h2>Our Story</h2><p>Founded in 2024, FideVoltz started with a simple idea: electronics shouldn't be intimidating. What began as a small blog sharing Arduino projects has grown into a comprehensive platform offering tutorials, a component store, and professional build services.</p><p>We believe that the best way to learn is by doing. That's why every tutorial on our site is tested, verified, and designed to be practical. Whether you're a student, hobbyist, or professional, FideVoltz is your partner in innovation.</p>`
      },
      {
        type: 'grid',
        columns: 3,
        items: [
          {
            title: 'Education',
            content: 'High-quality, step-by-step tutorials on Arduino, ESP32, IoT, Robotics, and more. Free for everyone.',
            icon: 'Lightbulb'
          },
          {
            title: 'Build Services',
            content: 'Custom project development for individuals and businesses. We bring your ideas to life with professional engineering.',
            icon: 'Cpu'
          },
          {
            title: 'Community',
            content: 'A vibrant community of makers sharing knowledge, collaborating on projects, and pushing the boundaries of what\'s possible.',
            icon: 'Globe'
          }
        ]
      }
    ],
    isPublished: true,
    seoTitle: 'About Us - FideVoltz',
    seoDesc: 'Learn about our mission to empower makers and innovators through electronics education.'
  },
  {
    title: 'Careers',
    slug: 'careers',
    content: [
      {
        type: 'hero',
        title: 'Join Our Team',
        subtitle: 'We\'re currently fully staffed and don\'t have any open positions at the moment. However, we\'re always growing, so please check back later!',
      }
    ],
    isPublished: true
  },
  {
    title: 'Cookie Policy',
    slug: 'cookies',
    content: [
      {
        type: 'hero',
        title: 'Cookie Policy',
        subtitle: 'Information about how we use cookies on our website'
      },
      {
        type: 'text',
        content: `<h3>What Are Cookies</h3><p>As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.</p><h3>How We Use Cookies</h3><p>We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.</p>`
      }
    ],
    isPublished: true
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    content: [
      {
        type: 'hero',
        title: 'Privacy Policy',
        subtitle: 'How we collect, use, and protect your personal data'
      },
      {
        type: 'text',
        content: `<h3>1. Introduction</h3><p>Welcome to FideVoltz. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p><h3>2. The Data We Collect About You</h3><p>Personal data, or personal information, means any information about an individual from which that person can be identified. It does not include data where the identity has been removed (anonymous data).</p>`
      }
    ],
    isPublished: true
  },
  {
    title: 'Returns & Refunds',
    slug: 'returns',
    content: [
      {
        type: 'hero',
        title: 'Returns & Refunds',
        subtitle: 'Our policy on returns, refunds, and exchanges'
      },
      {
        type: 'text',
        content: `<h3>Return Policy</h3><p>We want you to be completely satisfied with your purchase. If you are not satisfied with your purchase, you may return it to us for a full refund or an exchange. All returns must be postmarked within thirty (30) days of the purchase date. All returned items must be in new and unused condition, with all original tags and labels attached.</p>`
      }
    ],
    isPublished: true
  },
  {
    title: 'Shipping Information',
    slug: 'shipping',
    content: [
      {
        type: 'hero',
        title: 'Shipping Information',
        subtitle: 'Everything you need to know about delivery and tracking'
      },
      {
        type: 'text',
        content: `<h3>Shipping Policy</h3><p>At FideVoltz, we aim to deliver your electronics components and kits as quickly and safely as possible. We ship domestically and internationally to over 50 countries.</p><h3>Processing Time</h3><p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>`
      }
    ],
    isPublished: true
  },
  {
    title: 'Terms of Service',
    slug: 'terms',
    content: [
      {
        type: 'hero',
        title: 'Terms of Service',
        subtitle: 'The rules and regulations for the use of FideVoltz\'s Website'
      },
      {
        type: 'text',
        content: `<h3>1. Agreement to Terms</h3><p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and FideVoltz ("we," "us" or "our"), concerning your access to and use of the FideVoltz website.</p>`
      }
    ],
    isPublished: true
  },
  {
    title: 'Frequently Asked Questions',
    slug: 'faq',
    content: [
      {
        type: 'hero',
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to common questions about our platform, products, and services'
      },
      {
        type: 'faq',
        categories: [
          {
            name: 'General',
            questions: [
              { q: 'What is FideVoltz?', a: 'FideVoltz is a comprehensive platform for electronics enthusiasts, offering tutorials, project guides, and a curated store of quality components.' },
              { q: 'Do I need prior electronics experience?', a: 'Not at all! We offer tutorials for all skill levels, from complete beginners to advanced makers.' }
            ]
          }
        ]
      }
    ],
    isPublished: true
  },
  {
    title: 'Support',
    slug: 'support',
    content: [
      {
        type: 'hero',
        title: 'Help Center & Support',
        subtitle: 'Need help with an order, a project, or have a technical question? We\'re here to assist you.'
      },
      {
        type: 'grid',
        columns: 3,
        items: [
          { title: 'FAQs', content: 'Find answers to common questions', icon: 'FileQuestion' },
          { title: 'Community', content: 'Get help from other makers', icon: 'MessageCircle' },
          { title: 'Support', content: 'Track or return your orders', icon: 'LifeBuoy' }
        ]
      },
      {
        type: 'form',
        formType: 'support'
      }
    ],
    isPublished: true
  }
];

async function main() {
  console.log('Seeding static pages...');
  
  for (const page of staticPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        isPublished: page.isPublished,
        seoTitle: page.seoTitle,
        seoDesc: page.seoDesc,
      },
      create: {
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: page.isPublished,
        seoTitle: page.seoTitle,
        seoDesc: page.seoDesc,
      },
    });
    console.log(`- Seeded page: ${page.title} (/${page.slug})`);
  }
  
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
