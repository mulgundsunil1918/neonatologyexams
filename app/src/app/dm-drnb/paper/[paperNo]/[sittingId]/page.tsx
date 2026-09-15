import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { TopicBadge } from "@/components/topic-badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { toggleDmBookmark } from "@/app/dm-drnb-actions";
import { getDmTopicCounts, dmTopicTier } from "@/lib/dm-topics";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

const PAPER_ROMAN = ["I", "II", "III", "IV"];

export default async function DmPaperDetailPage({
  params,
}: {
  params: Promise<{ paperNo: string; sittingId: string }>;
}) {
  const { paperNo: paperNoStr, sittingId } = await params;
  const paperNo = parseInt(paperNoStr, 10);

  const [paper, allPapersOfThisNo, topicCounts, bookmarks] = await Promise.all([
    db.dmPaper.findUnique({
      where: { sittingId_paperNo: { sittingId, paperNo } },
      include: {
        sitting: true,
        items: { orderBy: [{ section: "asc" }, { itemNo: "asc" }] },
      },
    }),
    db.dmPaper.findMany({ where: { paperNo }, include: { sitting: true }, orderBy: { sitting: { sortOrder: "asc" } } }),
    getDmTopicCounts(),
    db.dmBookmark.findMany({ where: { userId: DEFAULT_USER_ID }, select: { itemId: true } }),
  ]);
  if (!paper) notFound();

  const bookmarkedIds = new Set(bookmarks.map((b) => b.itemId));
  const idx = allPapersOfThisNo.findIndex((p) => p.sittingId === sittingId);
  const prev = idx > 0 ? allPapersOfThisNo[idx - 1] : null;
  const next = idx >= 0 && idx < allPapersOfThisNo.length - 1 ? allPapersOfThisNo[idx + 1] : null;

  const sectionI = paper.items.filter((it) => it.section === "I");
  const sectionII = paper.items.filter((it) => it.section === "II");

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <BackLink href={`/dm-drnb/paper/${paperNo}`}>Back to Paper {PAPER_ROMAN[paperNo - 1]}</BackLink>
        <div className="flex items-center gap-2">
          {prev ? (
            <Link href={`/dm-drnb/paper/${paperNo}/${prev.sittingId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>← Previous</Link>
          ) : (
            <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}>← Previous</span>
          )}
          {next ? (
            <Link href={`/dm-drnb/paper/${paperNo}/${next.sittingId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Next <ArrowRight className="size-3.5" /></Link>
          ) : (
            <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}>Next <ArrowRight className="size-3.5" /></span>
          )}
        </div>
      </div>

      <h1 className="text-lg font-serif font-semibold text-foreground mt-4 mb-1">
        D.M. — Neonatology, Paper {PAPER_ROMAN[paperNo - 1]}
      </h1>
      <p className="text-sm text-muted-foreground mb-1">{paper.title}</p>
      <div className="text-xs font-mono text-muted-foreground mb-6">
        {paper.sitting.label}
        {paper.sitting.sessionNote && ` ${paper.sitting.sessionNote}`}
        {paper.examCode && ` · ${paper.examCode}`} · Sub Code {paper.subCode} · Q.P. Code {paper.qpCode}
      </div>

      <Section title="I. Elaborate on" hint="2 × 15 = 30 marks" items={sectionI} bookmarkedIds={bookmarkedIds} topicCounts={topicCounts} />
      <Section title="II. Write notes on" hint="10 × 7 = 70 marks" items={sectionII} bookmarkedIds={bookmarkedIds} topicCounts={topicCounts} />

      <div className="mt-8 flex justify-end">
        {next ? (
          <Link href={`/dm-drnb/paper/${paperNo}/${next.sittingId}`} className={buttonVariants({ variant: "default", size: "default" })}>
            Next sitting <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span className={buttonVariants({ variant: "outline", size: "default" }) + " opacity-40 pointer-events-none"}>
            End of list
          </span>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  items,
  bookmarkedIds,
  topicCounts,
}: {
  title: string;
  hint: string;
  items: { id: string; label: string; text: string; marks: number; topicTag: string | null }[];
  bookmarkedIds: Set<string>;
  topicCounts: Map<string, number>;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h2>
        <span className="text-xs font-mono text-muted-foreground">{hint}</span>
      </div>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.id} className="text-sm flex gap-3">
            <span className="font-mono font-semibold text-muted-foreground shrink-0">{it.label}</span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="leading-relaxed">
                {it.text} <span className="text-muted-foreground font-mono text-xs">({it.marks})</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {it.topicTag && (
                  <TopicBadge
                    topic={it.topicTag}
                    count={topicCounts.get(it.topicTag) ?? 1}
                    tier={dmTopicTier(topicCounts.get(it.topicTag) ?? 1)}
                  />
                )}
              </div>
            </div>
            <BookmarkButton
              questionId={it.id}
              isBookmarked={bookmarkedIds.has(it.id)}
              toggleAction={toggleDmBookmark}
              variant="icon"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
