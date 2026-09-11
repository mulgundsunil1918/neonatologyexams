import { cn } from "@/lib/utils";
import type { TopicTier } from "@/lib/theory-topics";

const TIER_CLASSES: Record<"RED" | "ORANGE" | "NONE", string> = {
  RED: "bg-tier-red-bg text-tier-red border-tier-red/30",
  ORANGE: "bg-tier-orange-bg text-tier-orange border-tier-orange/30",
  NONE: "bg-muted text-muted-foreground border-border",
};

const TIER_DESC: Record<"RED" | "ORANGE" | "NONE", string> = {
  RED: "High yield — this topic has come up in 3 or more different Theory papers",
  ORANGE: "Repeated — this topic has come up in 2 different Theory papers",
  NONE: "Asked once so far, no repeat found yet",
};

// Concept-level counterpart to <TierBadge> (which is for MCQ's exact-text repeat count).
// Shows a clinical topic plus how many different Theory sittings have asked about it.
export function TopicBadge({
  topic,
  count,
  tier,
  className,
}: {
  topic: string;
  count: number;
  tier: TopicTier;
  className?: string;
}) {
  const key = tier ?? "NONE";
  return (
    <span
      title={`${topic} — ${TIER_DESC[key]}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        TIER_CLASSES[key],
        className
      )}
    >
      <span className="truncate max-w-[14rem]">{topic}</span>
      {count > 1 && <span className="font-mono opacity-70">×{count}</span>}
    </span>
  );
}
