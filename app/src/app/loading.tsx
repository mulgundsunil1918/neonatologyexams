// Instant fallback shown by React Suspense while a route's server data loads. Every page
// here is `force-dynamic` (always-fresh DB reads, no static caching) so without this the
// app looks frozen between clicking a link and the next page's queries finishing.
//
// This file lives in the same segment as layout.tsx, and loading.tsx only wraps page.tsx
// (and nested layouts) in Suspense — not the layout in its own segment — so the sidebar and
// mobile nav bar stay put and interactive; only the <main> content area shows this.
//
// The trace is a small stylised pulse waveform (fitting for a neonatology app) rather than
// a generic spinner: a calm baseline path plus a second copy with a bright segment swept
// along it on a loop — see the `pulse-trace-sweep` keyframes in globals.css.
const PULSE_PATH =
  "M0,24 L60,24 L67,17 L74,24 L82,24 L90,4 L98,42 L106,24 L114,24 Q122,12 130,24 L220,24";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="px-8 py-20 flex flex-col items-center justify-center gap-3 text-center"
    >
      <svg viewBox="0 0 220 48" width="140" height="30" fill="none" aria-hidden="true">
        <path
          d={PULSE_PATH}
          pathLength="1"
          className="stroke-border"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={PULSE_PATH}
          pathLength="1"
          className="stroke-primary pulse-trace-sweep"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Loading</span>
    </div>
  );
}
