import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Electronics Tutorials & Projects',
    description:
      'Step-by-step electronics tutorials with circuit diagrams, code and bills of materials, for Arduino, ESP32, Raspberry Pi and IoT builds, beginner to advanced.',
    path: '/projects',
  });
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
