import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { TierBadge } from "@/components/tier-badge";
import { TopicBadge } from "@/components/topic-badge";
import { getTopicCounts, getQuestionTopicSummaries, type TopicSummary } from "@/lib/theory-topics";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function RevisionPage() {
  const attempts = await db.attempt.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { attemptedAt: "desc" },
    select: { masterQuestionId: true, isCorrect: true, nextReviewDate: true },
  });
  // Latest attempt per question only — Revision has always worked this way (a later correct
  // attempt supersedes an earlier wrong one), and scheduling follows the same rule: the due
  // date that matters is the one set by the most recent attempt, not an older superseded one.
  const latestByQ = new Map<string, { isCorrect: boolean | null; nextReviewDate: Date | null }>();
  for (const a of attempts) if (!latestByQ.has(a.masterQuestionId)) latestByQ.set(a.masterQuestionId, a);
  const incorrectIds = [...latestByQ.entries()].filter(([, a]) => a.isCorrect === false).map(([id]) => id);
  const now = new Date();
  const dueIds = [...latestByQ.entries()]
    .filter(([, a]) => a.nextReviewDate && a.nextReviewDate <= now)
    .sort((a, b) => a[1].nextReviewDate!.getTime() - b[1].nextReviewDate!.getTime())
    .map(([id]) => id);

  const [incorrectQuestions, unattemptedRed, dueQuestionsRaw, theoryQuestions] = await Promise.all([
    db.masterQuestion.findMany({ where: { id: { in: incorrectIds } }, take: 50 }),
    db.masterQuestion.findMany({
      where: { repetitionTier: "RED", id: { notIn: [...latestByQ.keys()] } },
      take: 50,
    }),
    db.masterQuestion.findMany({ where: { id: { in: dueIds.slice(0, 50) } } }),
    db.masterQuestion.findMany({
      where: { paperType: "THEORY" },
      include: { subParts: { orderBy: { sortOrder: "asc" }, select: { text: true, topicTag: true } } },
    }),
  ]);

  // findMany doesn't preserve the `in` list's order — re-sort to the real due-date order
  // (most overdue first) computed above.
  const dueById = new Map(dueQuestionsRaw.map((q) => [q.id, q]));
  const dueQuestions = dueIds.map((id) => dueById.get(id)!).filter(Boolean);

  // Same topic-priority system as /theory and /mcq/[id] — RED means this clinical topic has
  // come up (as some sub-part) in 3 or more different Theory sittings, not exact wording.
  const theoryWithTopics = await Promise.all(
    theoryQuestions.map(async (q) => {
      const tags = q.subParts.length > 0 ? q.subParts.map((sp) => sp.topicTag) : [q.topicTag];
      const summaries = await getQuestionTopicSummaries(tags);
      return { q, summaries };
    })
  );
  const highYieldTheory = theoryWithTopics
    .filter(({ summaries }) => summaries.some((s) => s.tier === "RED"))
    .map(({ q, summaries }) => ({
      id: q.id,
      stem: q.stem || q.subParts[0]?.text || "(untitled question)",
      redTopics: summaries.filter((s) => s.tier === "RED"),
    }))
    .sort((a, b) => Math.max(...b.redTopics.map((t) => t.count)) - Math.max(...a.redTopics.map((t) => t.count)))
    .slice(0, 50);

  return (
    <div>
      <PageHeader
        title="Revision"
        subtitle="Questions you got wrong, questions due today by spaced repetition, Red-tier (high-yield, repeated) MCQs you haven't attempted yet, and Theory topics that keep coming up. Rate 'How well did you know it?' after a correct answer to schedule when it comes back."
      />
      <div className="p-8 space-y-8">
        <Section title={`Due for review today (${dueQuestions.length})`} questions={dueQuestions} empty="Nothing due — answer a few questions and rate your confidence to build up a schedule." />
        <Section title={`Got wrong (${incorrectQuestions.length})`} questions={incorrectQuestions} empty="Nothing here yet — incorrect answers will queue up for review." />
        <Section title={`Unattempted Red-tier MCQs — high yield (${unattemptedRed.length})`} questions={unattemptedRed} empty="All Red-tier MCQs attempted." />
        <TheorySection title={`High-yield Theory topics (${highYieldTheory.length})`} questions={highYieldTheory} empty="No Theory topic has hit Red-tier (3+ sittings) yet." />
      </div>
    </div>
  );
}

function Section({ title, questions, empty }: { title: string; questions: { id: string; stem: string; repetitionTier: string }[]; empty: string }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</h2>
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {questions.map((q) => (
            <Link key={q.id} href={`/mcq/${q.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40">
              <TierBadge tier={q.repetitionTier} showLabel={false} className="mt-0.5" />
              <p className="text-sm line-clamp-1">{q.stem}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function TheorySection({
  title,
  questions,
  empty,
}: {
  title: string;
  questions: { id: string; stem: string; redTopics: TopicSummary[] }[];
  empty: string;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</h2>
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {questions.map((q) => (
            <Link key={q.id} href={`/mcq/${q.id}`} className="flex flex-col gap-1.5 px-4 py-3 hover:bg-muted/40">
              <p className="text-sm line-clamp-2">{q.stem}</p>
              <div className="flex flex-wrap gap-1.5">
                {q.redTopics.map((t) => (
                  <TopicBadge key={t.topic} topic={t.topic} count={t.count} tier={t.tier} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
