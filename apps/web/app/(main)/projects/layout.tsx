import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tutorials & Projects',
  description: 'Step-by-step electronics tutorials, project guides, and technical documentation. Learn from beginner to expert level.',
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
