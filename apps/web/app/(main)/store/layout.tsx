import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Store',
  description: 'Shop premium electronics components, microcontrollers, sensors, and tools. Quality parts for your next project.',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

