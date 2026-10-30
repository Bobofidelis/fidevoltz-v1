import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL, absoluteUrl } from '@/lib/site';

const TITLE = 'Electronics Store: Microcontrollers & Sensors';
const DESCRIPTION =
  'Shop electronic components, microcontrollers, sensors, development boards and maker tools in Nigeria, tested and delivered nationwide.';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: '/store',
    keywords: ['electronics components Nigeria', 'microcontrollers Nigeria', 'Arduino Nigeria', 'ESP32', 'Raspberry Pi Nigeria', 'sensors', 'robotics parts'],
  });
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: TITLE,
          description: DESCRIPTION,
          url: absoluteUrl('/store'),
          isPartOf: { '@id': `${SITE_URL}/#website` },
        }}
      />
      {children}
    </>
  );
}
