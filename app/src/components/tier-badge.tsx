import { TIER_META, type Tier } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TIER_CLASSES: Record<Tier, string> = {
  RED: "bg-tier-red-bg text-tier-red border-tier-red/30",
  ORANGE: "bg-tier-orange-bg text-tier-orange border-tier-orange/30",
};

export function TierBadge({ tier, showLabel = true, className }: { tier: string; showLabel?: boolean; className?: string }) {
  const t = (tier in TIER_META ? tier : "ORANGE") as Tier;
  const meta = TIER_META[t];
  return (
    <span
      title={meta.desc}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-mono font-medium",
        TIER_CLASSES[t],
        className
      )}
    >
      <span>{meta.emoji}</span>
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
}
