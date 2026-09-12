import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { TierBadge } from "@/components/tier-badge";
import { BackLink } from "@/components/back-link";
import { FilterBar } from "./filter-bar";
import { buildMcqWhere, currentFilterQueryString } from "@/lib/mcq-filters";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ImageIcon, TableIcon, ArrowLeft, ArrowRight } from "lucide-react";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 30;

export default async function McqListPage({ searchParams }: PageProps<"/mcq">) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) ?? "1", 10) || 1);

  const where = await buildMcqWhere(sp);

  const attempts = await db.attempt.findMany({
    where: { userId: DEFAULT_USER_ID },
    select: { masterQuestionId: true, isCorrect: true },
    orderBy: { attemptedAt: "desc" },
  });
  const attemptByQ = new Map<string, boolean | null>();
  for (const a of attempts) if (!attemptByQ.has(a.masterQuestionId)) attemptByQ.set(a.masterQuestionId, a.isCorrect);

  const qs = currentFilterQueryString(sp);

  const [systems, sittings, total, questions] = await Promise.all([
    db.system.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.sitting.findMany({ orderBy: { id: "desc" }, select: { id: true, label: true } }),
    db.masterQuestion.count({ where }),
    db.masterQuestion.findMany({
      where,
      orderBy: [{ repetitionTier: "asc" }, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        primarySystem: { select: { name: true } },
        occurrences: { include: { paper: { select: { sittingId: true, paperNo: true } } } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="MCQ Master"
        subtitle={`${total} question${total === 1 ? "" : "s"} matching your filters — ${await db.masterQuestion.count({ where: { paperType: "MCQ" } })} total in the bank.`}
        right={<BackLink href="/nnf-iap/mcq">MCQ</BackLink>}
        legend={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">Priority:</span>
            <span className="inline-flex items-center gap-1"><span>🔴</span> Red — this exact question was asked word-for-word in 2 different sittings</span>
            <span className="inline-flex items-center gap-1"><span>🟠</span> Orange — asked once so far, no exact repeat yet</span>
          </div>
        }
      />
      <FilterBar systems={systems} sittings={sittings} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-8 py-3 border-b border-border bg-muted/10">
        <p className="text-xs text-muted-foreground">
          Learn (tap-to-reveal) is the default below — click any question. Or study the current {total} filtered question{total === 1 ? "" : "s"} in:
        </p>
        <div className="flex gap-2 shrink-0">
          <Link href={`/mcq/learn${qs ? `?${qs}` : ""}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Full Learn Mode
          </Link>
          <Link href={`/mcq/test${qs ? `?${qs}` : ""}`} className={buttonVariants({ variant: "default", size: "sm" })}>
            Start Test
          </Link>
        </div>
      </div>

      <div className="divide-y divide-border">
        {questions.map((q) => {
          const status = attemptByQ.get(q.id);
          const firstOcc = q.occurrences[0];
          return (
            <Link
              key={q.id}
              href={`/mcq/${q.id}${qs ? `?${qs}` : ""}`}
              className="flex items-start gap-4 px-8 py-4 hover:bg-muted/40 transition-colors"
            >
              <TierBadge tier={q.repetitionTier} showLabel={false} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground leading-snug line-clamp-2">{q.stem}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground font-mono">
                  {firstOcc && <span className="whitespace-nowrap">{firstOcc.paper.sittingId} · P{firstOcc.paper.paperNo} · Q{firstOcc.originalQnum}</span>}
                  {q.occurrences.length > 1 && <span className="whitespace-nowrap text-tier-orange">repeated {q.occurrences.length}×</span>}
                  {q.primarySystem && <span className="whitespace-nowrap">{q.primarySystem.name}</span>}
                  {q.hasImage && <ImageIcon className="size-3 shrink-0" />}
                  {q.hasTable && <TableIcon className="size-3 shrink-0" />}
                </div>
              </div>
              <div className="shrink-0 mt-0.5">
                {status === true && <span className="text-good text-xs font-medium">✓ correct</span>}
                {status === false && <span className="text-bad text-xs font-medium">✗ incorrect</span>}
                {status === null && <span className="text-muted-foreground text-xs">attempted · ungraded</span>}
                {status === undefined && <span className="text-muted-foreground text-xs">unattempted</span>}
              </div>
            </Link>
          );
        })}
        {questions.length === 0 && (
          <div className="px-8 py-16 text-center text-muted-foreground text-sm">No questions match these filters.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-6 text-sm">
          {page > 1 ? (
            <PageLink sp={sp} page={page - 1}><ArrowLeft className="size-3.5" /> Previous</PageLink>
          ) : (
            <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}><ArrowLeft className="size-3.5" /> Previous</span>
          )}
          <span className="text-muted-foreground font-mono text-xs">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <PageLink sp={sp} page={page + 1}>Next <ArrowRight className="size-3.5" /></PageLink>
          ) : (
            <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}>Next <ArrowRight className="size-3.5" /></span>
          )}
        </div>
      )}
    </div>
  );
}

function PageLink({ sp, page, children }: { sp: Record<string, string | string[] | undefined>; page: number; children: React.ReactNode }) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && typeof v === "string") params.set(k, v);
  params.set("page", String(page));
  return <Link href={`/mcq?${params.toString()}`} className={buttonVariants({ variant: "outline", size: "sm" })}>{children}</Link>;
}
