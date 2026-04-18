export type AnalyticsEventName =
  | 'phase_completed'
  | 'tier_changed'
  | 'simulator_step'
  | 'scenario_run'
  | 'observer_changed';

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  payload: Record<string, string | number | boolean>;
  timestamp: number;
};

const KEY = 'em-site-analytics-events';

export function trackEvent(name: AnalyticsEventName, payload: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') {
    return;
  }

  const event: AnalyticsEvent = {
    name,
    payload,
    timestamp: Date.now()
  };

  const existing = readEvents();
  localStorage.setItem(KEY, JSON.stringify([...existing.slice(-199), event]));
}

export function readEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}
