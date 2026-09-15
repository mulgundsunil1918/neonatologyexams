import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { TopicBadge } from "@/components/topic-badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { toggleDmBookmark } from "@/app/dm-drnb-actions";
import { getDmTopicCounts, dmTopicTier } from "@/lib/dm-topics";
import Link from "next/link";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

const PAPER_ROMAN = ["", "I", "II", "III", "IV"];

export default async function DmBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ sitting?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const sittingFilter = sp.sitting && sp.sitting !== "all" ? sp.sitting : undefined;
  const q = (sp.q ?? "").trim();

  const [sittings, topicCounts, bookmarks, items] = await Promise.all([
    db.dmSitting.findMany({ orderBy: { sortOrder: "desc" } }),
    getDmTopicCounts(),
    db.dmBookmark.findMany({ where: { userId: DEFAULT_USER_ID }, select: { itemId: true } }),
    db.dmQuestionItem.findMany({
      where: {
        ...(sittingFilter ? { paper: { sittingId: sittingFilter } } : {}),
        ...(q ? { text: { contains: q } } : {}),
      },
      include: { paper: { include: { sitting: true } } },
      orderBy: [{ paper: { sitting: { sortOrder: "desc" } } }, { paper: { paperNo: "asc" } }, { itemNo: "asc" }],
    }),
  ]);

  const bookmarkedIds = new Set(bookmarks.map((b) => b.itemId));

  // Highest-yield first: tagged+repeated topics float up, everything else keeps its natural
  // (most-recent-sitting-first) order — a stable sort, so ties don't jump around.
  const ranked = [...items].sort((a, b) => {
    const ca = a.topicTag ? topicCounts.get(a.topicTag) ?? 1 : 0;
    const cb = b.topicTag ? topicCounts.get(b.topicTag) ?? 1 : 0;
    return cb - ca;
  });

  return (
    <div>
      <PageHeader
        title="DM/DrNB — Browse by priority"
        subtitle={`${items.length} question${items.length === 1 ? "" : "s"}${sittingFilter ? " in this sitting" : " across every paper and every sitting"} — topics that keep coming up float to the top.`}
        right={<BackLink href="/dm-drnb">DM/DrNB</BackLink>}
        legend={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">Topic priority:</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-tier-red" /> Red — asked (as some item) in 3 or more different papers</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-tier-orange" /> Orange — asked in 2 papers</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-muted-foreground/40" /> Plain — asked once so far</span>
            <span className="italic">— grouped by clinical topic, not exact wording; tagging is in progress, so not every question has a badge yet</span>
          </div>
        }
      />

      <form className="px-8 pt-6 flex flex-wrap items-center gap-3" action="/dm-drnb/browse">
        <input
          type="text"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search question text…"
          className="h-9 px-3 rounded-md border border-input bg-background text-sm min-w-64 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <select
          name="sitting"
          defaultValue={sp.sitting ?? "all"}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All sittings</option>
          {sittings.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          Filter
        </button>
        {(sp.sitting || sp.q) && (
          <Link href="/dm-drnb/browse" className="text-xs text-muted-foreground hover:text-foreground underline">
            Clear
          </Link>
        )}
      </form>

      <div className="divide-y divide-border mt-4">
        {ranked.map((it) => (
          <div key={it.id} className="flex items-start gap-4 px-8 py-4 hover:bg-muted/40">
            <Link href={`/dm-drnb/paper/${it.paper.paperNo}/${it.paper.sittingId}`} className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5 text-[11px] text-muted-foreground font-mono">
                <span className="whitespace-nowrap">
                  Paper {PAPER_ROMAN[it.paper.paperNo]} · {it.paper.sitting.label} · {it.label}
                </span>
                <span className="whitespace-nowrap">({it.marks} marks)</span>
              </div>
              <p className="text-sm leading-snug">{it.text}</p>
              {it.topicTag && (
                <div className="mt-2">
                  <TopicBadge topic={it.topicTag} count={topicCounts.get(it.topicTag) ?? 1} tier={dmTopicTier(topicCounts.get(it.topicTag) ?? 1)} />
                </div>
              )}
            </Link>
            <BookmarkButton
              questionId={it.id}
              isBookmarked={bookmarkedIds.has(it.id)}
              toggleAction={toggleDmBookmark}
              variant="icon"
            />
          </div>
        ))}
        {ranked.length === 0 && (
          <div className="px-8 py-16 text-center text-muted-foreground text-sm">No questions match this filter.</div>
        )}
      </div>
    </div>
  );
}
