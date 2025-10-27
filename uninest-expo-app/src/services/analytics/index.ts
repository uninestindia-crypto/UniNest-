export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

type PlausibleFn = (eventName: string, options?: { props?: AnalyticsPayload }) => void;
type GtagFn = (command: 'event', eventName: string, params?: AnalyticsPayload) => void;
type MixpanelFn = (eventName: string, properties?: AnalyticsPayload) => void;

type TrackerScope = {
  plausible?: PlausibleFn;
  gtag?: GtagFn;
  mixpanel?: { track: MixpanelFn };
};

const defaultPayload: AnalyticsPayload = {};

function getTrackerScope(): TrackerScope {
  if (typeof globalThis === 'undefined') {
    return {};
  }
  return globalThis as unknown as TrackerScope;
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = defaultPayload) {
  const scope = getTrackerScope();
  let handled = false;

  try {
    if (typeof scope.plausible === 'function') {
      scope.plausible(eventName, { props: payload });
      handled = true;
      return;
    }

    if (typeof scope.gtag === 'function') {
      scope.gtag('event', eventName, payload);
      handled = true;
      return;
    }

    if (scope.mixpanel && typeof scope.mixpanel.track === 'function') {
      scope.mixpanel.track(eventName, payload);
      handled = true;
      return;
    }
  } catch (error) {
    console.warn('[analytics] failed to send event', error);
    handled = false;
  }

  if (!handled && __DEV__) {
    console.debug('[analytics]', eventName, payload);
  }
}
