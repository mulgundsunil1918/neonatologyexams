// Part 19 of the original spec — Attempt.confidence/nextReviewDate have existed in the
// schema since Phase 4 but nothing ever computed them. This is the first real scheduler:
// deliberately simple (a fixed interval ladder off a single self-rating), not full SM-2 with
// an evolving ease-factor across attempts — the schema stores confidence per-attempt, and
// Revision already only ever looks at the MOST RECENT attempt per question, so scheduling
// off just that one rating is the natural fit rather than reconstructing history.

// A wrong answer always comes back tomorrow, no rating needed — there's nothing to "rate"
// when you already know you missed it. An ungraded question (no source-confirmed answer
// yet) can't be scheduled at all.
const CORRECT_INTERVAL_DAYS: Record<number, number> = {
  1: 1, // Again — didn't really know it
  2: 2, // Hard
  3: 4, // Good
  4: 8, // Easy
  5: 16, // Very easy
};
const DEFAULT_CORRECT_INTERVAL_DAYS = 3; // correct but never rated

export function computeNextReviewDate(isCorrect: boolean | null, confidence: number | null): Date | null {
  if (isCorrect === null) return null;
  const days = isCorrect === false ? 1 : (confidence && CORRECT_INTERVAL_DAYS[confidence]) || DEFAULT_CORRECT_INTERVAL_DAYS;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export const CONFIDENCE_LABELS: Record<number, string> = {
  1: "Again",
  2: "Hard",
  3: "Good",
  4: "Easy",
  5: "Very easy",
};
