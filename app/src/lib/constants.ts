export const TIER_META = {
  RED: { emoji: "🔴", label: "Red", meaning: "High yield", desc: "Repeated exactly twice" },
  ORANGE: { emoji: "🟠", label: "Orange", meaning: "Complete coverage", desc: "Asked once, no repeat found yet" },
} as const;

export type Tier = keyof typeof TIER_META;

// "external" gets its own tone (amber, never green) so it can never visually read as the same
// thing as an uploaded-source confirmation — see EXTERNAL_VERIFICATION below and Part 1 of the
// spec: "Never present external information as if it came from the uploaded books."
export const CONFIDENCE_META: Record<string, { label: string; tone: "good" | "neutral" | "bad" | "external" }> = {
  SOURCE_CONFIRMED: { label: "Source confirmed", tone: "good" },
  SOURCE_SUPPORTED: { label: "Source supported", tone: "good" },
  SOURCE_DEPENDENT: { label: "Candidate match — not yet verified", tone: "neutral" },
  QUESTION_OPTION_FLAWED: { label: "Question/option flawed", tone: "bad" },
  OUTDATED_SOURCE: { label: "Outdated source", tone: "bad" },
  NOT_FOUND: { label: "Not found in uploaded resources", tone: "neutral" },
  EXTERNAL_VERIFICATION: { label: "External/current verification — not from uploaded resources", tone: "external" },
};

export const DEFAULT_USER_ID = "local-user";

// Absolute path to the folder holding the source PDFs (project root, one level up from app/) —
// used to build file:// links so "Sources" can open the original book at the cited page. Only
// meaningful on the machine that has those PDFs; overridable via .env for a different layout.
export const RESOURCES_ROOT = process.env.RESOURCES_ROOT ?? "/Users/sunil/neonatologyexam";
