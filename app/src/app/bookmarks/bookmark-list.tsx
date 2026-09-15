"use client";

import { useState } from "react";
import Link from "next/link";
import { TierBadge } from "@/components/tier-badge";
import { BookmarkButton } from "@/components/bookmark-button";

type Row = {
  masterQuestionId: string;
  stem: string;
  paperType: string;
  repetitionTier: string;
};

export function BookmarkList({ groups }: { groups: { system: string; rows: Row[] }[] }) {
  // Removing a bookmark here should drop it from view immediately rather than waiting for a
  // full reload — the server action still fires, this is purely the optimistic client-side view.
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  return (
    <div className="divide-y divide-border">
      {groups.map((g) => {
        const visible = g.rows.filter((r) => !removed.has(r.masterQuestionId));
        if (visible.length === 0) return null;
        return (
          <div key={g.system}>
            <div className="px-8 pt-5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">
              {g.system} <span className="font-mono normal-case text-muted-foreground/70">· {visible.length}</span>
            </div>
            {visible.map((r) => (
              <div key={r.masterQuestionId} className="flex items-center gap-3 px-8 py-4 hover:bg-muted/40">
                <Link href={`/mcq/${r.masterQuestionId}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TierBadge tier={r.repetitionTier} showLabel={false} />
                    <span className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground">{r.paperType}</span>
                  </div>
                  <p className="text-sm leading-snug line-clamp-2">{r.stem}</p>
                </Link>
                <BookmarkButton
                  questionId={r.masterQuestionId}
                  isBookmarked
                  variant="icon"
                  onToggle={(next) => {
                    if (!next) setRemoved((s) => new Set(s).add(r.masterQuestionId));
                  }}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
