"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function getSessionId() {
  let sessionId = localStorage.getItem('fidevoltz_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('fidevoltz_session_id', sessionId);
  }
  return sessionId;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    if (!pathname) return;

    // Ignore dashboard routes for public analytics to avoid skewing data with admin actions,
    // unless you want to track everything. We'll track everything but you can filter in the dashboard.
    
    let startTime = Date.now();
    let isTracked = false;

    const trackPageview = () => {
      if (isTracked) return;
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      fetch('/api/track/pageview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: document.title || pathname,
          path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
          referrer: document.referrer || null,
          sessionId: getSessionId(),
          duration: duration,
          userId: session?.user?.id || null,
        }),
        // Use keepalive to ensure request goes through on page unload
        keepalive: true,
      }).catch(console.error);

      isTracked = true;
    };

    // Track on unmount (when leaving the page)
    return () => {
      trackPageview();
    };
  }, [pathname, searchParams, session]);

  return null;
}
