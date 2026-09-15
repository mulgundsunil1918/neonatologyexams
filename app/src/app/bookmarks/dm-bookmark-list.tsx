"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { toggleDmBookmark } from "@/app/dm-drnb-actions";

type Row = { itemId: string; label: string; text: string; paperNo: number; sittingId: string; sittingLabel: string };

const PAPER_ROMAN = ["", "I", "II", "III", "IV"];

export function DmBookmarkList({ rows }: { rows: Row[] }) {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const visible = rows.filter((r) => !removed.has(r.itemId));

  if (visible.length === 0) return null;

  return (
    <div className="divide-y divide-border">
      {visible.map((r) => (
        <div key={r.itemId} className="flex items-center gap-3 px-8 py-4 hover:bg-muted/40">
          <Link href={`/dm-drnb/paper/${r.paperNo}/${r.sittingId}`} className="min-w-0 flex-1">
            <div className="text-[11px] font-mono text-muted-foreground mb-1">
              Paper {PAPER_ROMAN[r.paperNo]} · {r.sittingLabel} · {r.label}
            </div>
            <p className="text-sm leading-snug line-clamp-2">{r.text}</p>
          </Link>
          <BookmarkButton
            questionId={r.itemId}
            isBookmarked
            variant="icon"
            toggleAction={toggleDmBookmark}
            onToggle={(next) => {
              if (!next) setRemoved((s) => new Set(s).add(r.itemId));
            }}
          />
        </div>
      ))}
    </div>
  );
}
