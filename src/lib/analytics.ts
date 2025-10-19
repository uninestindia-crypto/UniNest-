'use client';

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

type PlausibleFn = (eventName: string, options?: { props?: AnalyticsPayload }) => void;
type GtagFn = (command: 'event', eventName: string, params?: AnalyticsPayload) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
    gtag?: GtagFn;
    mixpanel?: { track: (eventName: string, properties?: AnalyticsPayload) => void };
  }
}

export const trackEvent = (eventName: string, payload: AnalyticsPayload = {}) => {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: payload });
      return;
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
      return;
    }

    if (window.mixpanel && typeof window.mixpanel.track === 'function') {
      window.mixpanel.track(eventName, payload);
      return;
    }
  } catch (error) {
    console.warn('[analytics] failed to send event', error);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[analytics]', eventName, payload);
  }
};
