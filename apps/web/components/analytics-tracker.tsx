"use client";

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function getSessionId() {
  if (typeof localStorage === 'undefined') return 'server';
  let sessionId = localStorage.getItem('fidevoltz_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('fidevoltz_session_id', sessionId);
  }
  return sessionId;
}

// Inner component that uses useSearchParams — must be inside Suspense
function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    if (!pathname) return;

    // Don't track dashboard admin traffic — keeps public analytics clean
    if (pathname.startsWith('/dashboard')) return;

    let startTime = Date.now();
    let isTracked = false;

    const trackPageview = () => {
      if (isTracked) return;

      const duration = Math.round((Date.now() - startTime) / 1000);

      fetch('/api/track/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: document.title || pathname,
          path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
          referrer: document.referrer || null,
          sessionId: getSessionId(),
          duration,
          userId: (session?.user as any)?.id || null,
        }),
        keepalive: true,
      }).catch(() => {/* silent fail — tracking should never break the app */});

      isTracked = true;
    };

    return () => {
      trackPageview();
    };
  }, [pathname, searchParams, session]);

  return null;
}

// Exported wrapper that provides the required Suspense boundary
export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
