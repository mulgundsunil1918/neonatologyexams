import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { TopicBadge } from "@/components/topic-badge";
import { buildMcqWhere, currentFilterQueryString } from "@/lib/mcq-filters";
import { getQuestionTopicSummaries } from "@/lib/theory-topics";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function TheoryPage({ searchParams }: PageProps<"/theory">) {
  const sp = await searchParams;
  const where = await buildMcqWhere(sp, "THEORY");
  const qs = currentFilterQueryString(sp);

  const [sitting, system, questions] = await Promise.all([
    sp.sitting && sp.sitting !== "all" ? db.sitting.findUnique({ where: { id: sp.sitting as string } }) : null,
    sp.system && sp.system !== "all" && sp.system !== "unclassified" ? db.system.findUnique({ where: { id: sp.system as string } }) : null,
    db.masterQuestion.findMany({
      where,
      orderBy: { id: "asc" },
      include: {
        occurrences: { include: { paper: { include: { sitting: true } } }, orderBy: { paper: { sittingId: "asc" } } },
        subParts: { orderBy: { sortOrder: "asc" } },
        primarySystem: { select: { name: true } },
        answer: { select: { id: true } },
      },
    }),
  ]);

  const filterLabel = sitting?.label ?? system?.name ?? null;
  const answeredCount = questions.filter((q) => q.answer).length;

  // Topic-priority badges per question — computed once for the whole list rather than
  // per-row, since getQuestionTopicSummaries shares the same cached topic-count map.
  const topicsByQuestion = new Map(
    await Promise.all(
      questions.map(async (q) => {
        const tags = q.subParts.length > 0 ? q.subParts.map((sp) => sp.topicTag) : [q.topicTag];
        return [q.id, await getQuestionTopicSummaries(tags)] as const;
      })
    )
  );

  return (
    <div>
      <PageHeader
        title="Theory &amp; Short Notes"
        subtitle={`${questions.length} essay question${questions.length === 1 ? "" : "s"}${filterLabel ? ` — ${filterLabel}` : ""} — ${answeredCount} with a model answer so far.`}
        right={<BackLink href="/nnf-iap/theory">Theory</BackLink>}
        legend={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">Topic priority:</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-tier-red" /> Red — this clinical topic has been asked in 3 or more different sittings</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-tier-orange" /> Orange — asked in 2 sittings</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-muted-foreground/40" /> Plain — asked once so far</span>
            <span className="italic">— badges are per sub-part, by topic, not exact wording (essay questions are almost never worded identically twice)</span>
          </div>
        }
      />
      <div className="divide-y divide-border">
        {questions.map((q) => {
          const first = q.occurrences[0];
          const topics = topicsByQuestion.get(q.id) ?? [];
          return (
            <Link key={q.id} href={`/mcq/${q.id}${qs ? `?${qs}` : ""}`} className="flex items-start gap-4 px-8 py-4 hover:bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug line-clamp-2">{q.stem || q.subParts[0]?.text}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground font-mono">
                  {first && <span className="whitespace-nowrap">{first.paper.sittingId} · P{first.paper.paperNo} · Q{first.originalQnum}</span>}
                  {q.occurrences.length > 1 && <span className="whitespace-nowrap text-tier-orange">repeated {q.occurrences.length}×</span>}
                  {q.primarySystem && <span className="whitespace-nowrap">{q.primarySystem.name}</span>}
                </div>
                {topics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {topics.map((t) => (
                      <TopicBadge key={t.topic} topic={t.topic} count={t.count} tier={t.tier} />
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 mt-0.5">
                {q.answer ? (
                  <span className="text-good text-xs font-medium">✓ model answer</span>
                ) : (
                  <span className="text-muted-foreground text-xs">not yet answered</span>
                )}
              </div>
            </Link>
          );
        })}
        {questions.length === 0 && (
          <div className="px-8 py-16 text-center text-muted-foreground text-sm">No theory questions match this filter.</div>
        )}
      </div>
    </div>
  );
}
