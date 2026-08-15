"use client";

import NextTopLoader from 'nextjs-toploader';
import { useTheme } from 'next-themes';

export function TopLoader() {
  const { theme } = useTheme();
  
  return (
    <NextTopLoader
      color={theme === 'dark' ? '#fff' : '#000'}
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #2299DD,0 0 5px #2299DD"
    />
  );
}
