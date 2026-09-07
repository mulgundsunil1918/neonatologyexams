import { db } from "@/lib/db";
import { CONFIDENCE_META, RESOURCES_ROOT } from "@/lib/constants";
import { toneClasses, SOURCE_RANK } from "@/lib/confidence-ui";
import { PageHeader } from "@/components/page-header";
import { TierBadge } from "@/components/tier-badge";
import { buildMcqWhere, currentFilterQueryString } from "@/lib/mcq-filters";
import { BackLink } from "@/components/back-link";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

export default async function McqFullLearnPage({ searchParams }: PageProps<"/mcq/learn">) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) ?? "1", 10) || 1);
  const where = await buildMcqWhere(sp);
  const qs = currentFilterQueryString(sp);

  const [total, questions] = await Promise.all([
    db.masterQuestion.count({ where }),
    db.masterQuestion.findMany({
      where,
      orderBy: [{ repetitionTier: "asc" }, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        options: { orderBy: { sortOrder: "asc" } },
        answer: true,
        explanation: true,
        sources: { include: { resource: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Full Learn Mode"
        subtitle={`${total} question${total === 1 ? "" : "s"} — everything shown at once, no clicking. Just scroll.`}
        right={<BackLink href="/mcq">Back to MCQ Master</BackLink>}
      />
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-10">
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">No questions match your filters — go back and widen them.</p>
        )}
        {questions.map((q, i) => {
          const confMeta = CONFIDENCE_META[q.answer?.confidenceStatus ?? "NOT_FOUND"] ?? CONFIDENCE_META.NOT_FOUND;
          return (
            <div key={q.id} className="pb-10 border-b border-border last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-semibold text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</span>
                <TierBadge tier={q.repetitionTier} showLabel={false} />
              </div>
              <p className="text-sm leading-relaxed mb-3">{q.stem}</p>
              <div className="flex flex-col gap-1.5 mb-4">
                {q.options.map((opt) => {
                  const isCorrect = q.answer?.correctLetter === opt.letter;
                  return (
                    <div
                      key={opt.id}
                      className={
                        "flex items-start gap-3 px-3.5 py-2 rounded-md border text-sm " +
                        (isCorrect ? "border-good bg-good-bg" : "border-border opacity-70")
                      }
                    >
                      <span className="font-mono font-semibold text-muted-foreground shrink-0">{opt.letter}.</span>
                      <span>{opt.text}</span>
                      {isCorrect && <span className="ml-auto text-good text-xs font-medium shrink-0">✓ correct</span>}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {!q.answer?.correctLetter ? (
                  <p className="text-xs text-muted-foreground italic">No answer on file yet for this question.</p>
                ) : (
                  <span className={"inline-block text-[11px] font-mono px-2 py-0.5 rounded-full border " + toneClasses(confMeta.tone)}>
                    {confMeta.label}
                  </span>
                )}

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Explanation</div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {q.explanation?.body ?? "Not yet ingested from the reference library."}
                  </p>
                </div>

                {q.sources.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Sources</div>
                    <div className="space-y-2">
                      {[...q.sources]
                        .sort((a, b) => SOURCE_RANK[a.confidenceStatus] - SOURCE_RANK[b.confidenceStatus])
                        .map((s) => {
                          const meta = CONFIDENCE_META[s.confidenceStatus] ?? CONFIDENCE_META.NOT_FOUND;
                          const fileHref = `file://${RESOURCES_ROOT}/${encodeURIComponent(s.resource.fileName)}#page=${s.pageRef}`;
                          return (
                            <div key={s.id} className="rounded-md border border-border p-2.5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <a href={fileHref} className="font-medium text-xs hover:underline hover:text-primary">{s.resource.title}</a>
                                  {s.chapter && <div className="text-[11px] text-muted-foreground mt-0.5">{s.chapter}</div>}
                                </div>
                                <span className="text-[11px] font-mono text-muted-foreground shrink-0">p.{s.pageRef}</span>
                              </div>
                              <span className={"inline-block mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full border " + toneClasses(meta.tone)}>
                                {meta.label}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-4 text-sm">
            {page > 1 ? (
              <Link href={`/mcq/learn?${qs ? qs + "&" : ""}page=${page - 1}`} className={buttonVariants({ variant: "outline", size: "sm" })}><ArrowLeft className="size-3.5" /> Previous</Link>
            ) : (
              <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}><ArrowLeft className="size-3.5" /> Previous</span>
            )}
            <span className="text-muted-foreground font-mono text-xs">Page {page} of {totalPages}</span>
            {page < totalPages ? (
              <Link href={`/mcq/learn?${qs ? qs + "&" : ""}page=${page + 1}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Next <ArrowRight className="size-3.5" /></Link>
            ) : (
              <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}>Next <ArrowRight className="size-3.5" /></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
