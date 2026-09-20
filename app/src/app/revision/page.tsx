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
    select: { masterQuestionId: true, isCorrect: true },
  });
  const latestByQ = new Map<string, boolean | null>();
  for (const a of attempts) if (!latestByQ.has(a.masterQuestionId)) latestByQ.set(a.masterQuestionId, a.isCorrect);
  const incorrectIds = [...latestByQ.entries()].filter(([, c]) => c === false).map(([id]) => id);

  const [incorrectQuestions, unattemptedRed, theoryQuestions] = await Promise.all([
    db.masterQuestion.findMany({ where: { id: { in: incorrectIds } }, take: 50 }),
    db.masterQuestion.findMany({
      where: { repetitionTier: "RED", id: { notIn: [...latestByQ.keys()] } },
      take: 50,
    }),
    db.masterQuestion.findMany({
      where: { paperType: "THEORY" },
      include: { subParts: { orderBy: { sortOrder: "asc" }, select: { text: true, topicTag: true } } },
    }),
  ]);

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
        subtitle="A basic due-for-review queue — questions you got wrong, Red-tier (high-yield, repeated) MCQs you haven't attempted, and Theory questions whose clinical topic keeps coming up. Full spaced-repetition scheduling (Part 19) isn't built yet."
      />
      <div className="p-8 space-y-8">
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
