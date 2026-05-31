'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnalyticsProvider, WebVitals } from '@summoniq/signalsplash-client-sdk/react';
import type { AnalyticsConfig } from '@summoniq/signalsplash-client-sdk';
import { useAnalytics } from '@summoniq/signalsplash-client-sdk/react';
import { useSession } from '@/lib/auth/client';

const envEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT?.trim();
const defaultEndpoint =
  process.env.NODE_ENV === 'production' ? 'https://api.signalsplash.com/api/events' : '';
const resolvedEndpoint = envEndpoint || defaultEndpoint;
const isEnabled =
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' && Boolean(resolvedEndpoint);

const config: AnalyticsConfig = {
  appId: 'winzen',
  endpoint: resolvedEndpoint || undefined,
  enabled: isEnabled,
  debug: process.env.NODE_ENV === 'development',
  trackPageViews: false,
  trackWebVitals: true,
  sessionTimeout: 30,
  respectDoNotTrack: true,
};

function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const { pageView, track } = useAnalytics();

  useEffect(() => {
    const search = window.location.search.replace(/^\?/, '');
    const path = `${pathname}${search ? `?${search}` : ''}`;
    pageView({
      path,
      route: pathname,
      source: 'winzen-marketing',
    });
    track('marketing_route_viewed', {
      path,
      route: pathname,
      source: 'winzen-marketing',
    });
  }, [pageView, pathname, track]);

  return null;
}

function AnalyticsIdentify() {
  const { data: session } = useSession();
  const { identify, reset } = useAnalytics();
  const identifiedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      if (identifiedUserRef.current) {
        reset();
        identifiedUserRef.current = null;
      }
      return;
    }
    const { id, email, name } = session.user;
    if (identifiedUserRef.current === id) return;
    identify(id, {
      email: email ?? undefined,
      name: name ?? undefined,
      source: 'winzen-marketing',
    });
    identifiedUserRef.current = id;
  }, [identify, reset, session?.user]);

  return null;
}

export function AnalyticsSetup({ children }: { children: unknown }) {
  return (
    <AnalyticsProvider config={config}>
      <WebVitals />
      <AnalyticsRouteTracker />
      <AnalyticsIdentify />
      {children as never}
    </AnalyticsProvider>
  );
}
