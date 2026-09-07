// Shared badge color classes for a confidence tone — kept framework-agnostic (no "use client")
// so both server components (Full Learn Mode) and client components (TestRunner, MCQ detail
// page) can import it without pulling in a client boundary.
export function toneClasses(tone: string) {
  if (tone === "good") return "text-good border-good/30 bg-good-bg";
  if (tone === "bad") return "text-bad border-bad/30 bg-bad-bg";
  if (tone === "external") return "text-external border-external/30 bg-external-bg";
  return "text-muted-foreground border-border";
}

export const SOURCE_RANK: Record<string, number> = {
  SOURCE_CONFIRMED: 0,
  SOURCE_SUPPORTED: 1,
  EXTERNAL_VERIFICATION: 2,
  SOURCE_DEPENDENT: 3,
  NOT_FOUND: 4,
};
