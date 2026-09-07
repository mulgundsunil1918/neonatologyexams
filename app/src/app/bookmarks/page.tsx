import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { TierBadge } from "@/components/tier-badge";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
  const bookmarks = await db.bookmark.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { createdAt: "desc" },
    include: { masterQuestion: true },
  });

  return (
    <div>
      <PageHeader title="Bookmarks" subtitle="Questions you've flagged to revisit." />
      <div className="divide-y divide-border">
        {bookmarks.map((b) => (
          <Link key={b.id} href={`/mcq/${b.masterQuestionId}`} className="flex items-start gap-4 px-8 py-4 hover:bg-muted/40">
            <TierBadge tier={b.masterQuestion.repetitionTier} showLabel={false} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug line-clamp-2">{b.masterQuestion.stem}</p>
              {b.flag && <span className="text-[11px] text-muted-foreground font-mono">{b.flag}</span>}
            </div>
          </Link>
        ))}
        {bookmarks.length === 0 && (
          <div className="px-8 py-16 text-center text-muted-foreground text-sm">
            No bookmarks yet — open any question and click Bookmark.
          </div>
        )}
      </div>
    </div>
  );
}
