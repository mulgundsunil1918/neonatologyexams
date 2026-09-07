export const TIER_META = {
  RED: { emoji: "🔴", label: "Red", meaning: "Must memorize", desc: "Repeated 3+ times" },
  ORANGE: { emoji: "🟠", label: "Orange", meaning: "High yield", desc: "Repeated exactly twice" },
  YELLOW: { emoji: "🟡", label: "Yellow", meaning: "High-yield concept", desc: "Same concept, reworded across sittings" },
  WHITE: { emoji: "⚪", label: "White", meaning: "Complete coverage", desc: "Asked once, no repeat found yet" },
} as const;

export type Tier = keyof typeof TIER_META;

export const CONFIDENCE_META: Record<string, { label: string; tone: "good" | "neutral" | "bad" }> = {
  SOURCE_CONFIRMED: { label: "Source confirmed", tone: "good" },
  SOURCE_SUPPORTED: { label: "Source supported", tone: "good" },
  SOURCE_DEPENDENT: { label: "Source dependent", tone: "neutral" },
  QUESTION_OPTION_FLAWED: { label: "Question/option flawed", tone: "bad" },
  OUTDATED_SOURCE: { label: "Outdated source", tone: "bad" },
  NOT_FOUND: { label: "Not found in uploaded resources", tone: "neutral" },
};

export const DEFAULT_USER_ID = "local-user";
