"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { toggleNrpBookmark } from "@/app/bookmark-actions";

type Row = { nrpQuestionId: string; stem: string };

export function NrpBookmarkList({ groups }: { groups: { topic: string; rows: Row[] }[] }) {
  // Same optimistic-removal pattern as the main BookmarkList — drop the row from view the
  // moment it's un-bookmarked rather than waiting on a reload.
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  return (
    <div className="divide-y divide-border">
      {groups.map((g) => {
        const visible = g.rows.filter((r) => !removed.has(r.nrpQuestionId));
        if (visible.length === 0) return null;
        return (
          <div key={g.topic}>
            <div className="px-8 pt-5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">
              {g.topic} <span className="font-mono normal-case text-muted-foreground/70">· {visible.length}</span>
            </div>
            {visible.map((r) => (
              <div key={r.nrpQuestionId} className="flex items-center gap-3 px-8 py-4 hover:bg-muted/40">
                <Link href={`/nrp/mcq/${r.nrpQuestionId}`} className="min-w-0 flex-1">
                  <p className="text-sm leading-snug line-clamp-2">{r.stem}</p>
                </Link>
                <BookmarkButton
                  questionId={r.nrpQuestionId}
                  isBookmarked
                  variant="icon"
                  toggleAction={toggleNrpBookmark}
                  onToggle={(next) => {
                    if (!next) setRemoved((s) => new Set(s).add(r.nrpQuestionId));
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
