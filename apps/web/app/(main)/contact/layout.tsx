import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Contact Us',
    description: 'Get in touch with FideVoltz. Ask questions about tutorials, request custom builds, or explore partnership opportunities.',
    path: '/contact',
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
