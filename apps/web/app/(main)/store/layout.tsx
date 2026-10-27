import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electronics Store | Microcontrollers, Sensors & Maker Tools | FideVoltz',
  description: 'Shop premium electronic components, microcontrollers, sensors, development boards, and maker tools in Nigeria. 100% genuine, quality tested with fast nationwide shipping.',
  keywords: [
    'electronics components Nigeria',
    'microcontrollers Lagos',
    'Arduino Nigeria',
    'ESP32',
    'Raspberry Pi Nigeria',
    'sensors',
    'soldering tools',
    'robotics parts',
    'FideVoltz store'
  ],
  alternates: {
    canonical: 'https://fidevoltz.com/store',
  },
  openGraph: {
    title: 'FideVoltz Electronics Store - Components, Dev Boards & Tools',
    description: 'Shop genuine microcontrollers, sensors, modules, and maker tools in Nigeria with fast delivery and expert engineering support.',
    url: 'https://fidevoltz.com/store',
    siteName: 'FideVoltz',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FideVoltz Electronics Store',
    description: 'Genuine electronic components, sensors, microcontrollers & tools in Nigeria.',
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'FideVoltz Electronics Store',
    description: 'Shop premium electronic components, microcontrollers, sensors, development boards, and maker tools in Nigeria.',
    url: 'https://fidevoltz.com/store',
    isPartOf: {
      '@type': 'WebSite',
      name: 'FideVoltz',
      url: 'https://fidevoltz.com',
    },
    provider: {
      '@type': 'Organization',
      name: 'FideVoltz',
      url: 'https://fidevoltz.com',
      logo: 'https://fidevoltz.com/logo.png',
      sameAs: [
        'https://twitter.com/fidevoltz',
        'https://github.com/fidevoltz',
        'https://linkedin.com/company/fidevoltz'
      ]
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}

