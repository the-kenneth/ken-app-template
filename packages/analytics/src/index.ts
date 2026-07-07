/**
 * Analytics facade shared by web and mobile.
 *
 * Event names and payloads are defined ONCE here, so both platforms stay
 * consistent and typos fail typecheck. No vendor is bundled: until a
 * provider is plugged in, track() logs in dev and no-ops in production.
 *
 * To adopt a vendor per project (PostHog, Mixpanel, Amplitude, …), call
 * setAnalyticsProvider() once at app startup:
 *
 *   // apps/expo/src/app/_layout.tsx (or apps/nextjs providers.tsx)
 *   setAnalyticsProvider({
 *     track: (name, properties) => posthog.capture(name, properties),
 *   });
 *
 * Call sites never change: track("todo_added", { platform: "mobile" }).
 */

type Platform = "web" | "mobile";

/** The single source of truth for event names and their payloads. */
export interface AnalyticsEvents {
  user_signed_in: { platform: Platform };
  todo_added: { platform: Platform };
  test_notification_sent: { platform: Platform };
}

export interface AnalyticsProvider {
  track: <Name extends keyof AnalyticsEvents>(
    name: Name,
    properties: AnalyticsEvents[Name],
  ) => void;
}

let provider: AnalyticsProvider | null = null;

export function setAnalyticsProvider(next: AnalyticsProvider | null): void {
  provider = next;
}

export function track<Name extends keyof AnalyticsEvents>(
  name: Name,
  properties: AnalyticsEvents[Name],
): void {
  if (provider) {
    provider.track(name, properties);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${name}`, properties);
  }
}
