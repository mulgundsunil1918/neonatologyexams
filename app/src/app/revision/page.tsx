import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { TierBadge } from "@/components/tier-badge";
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

  const [incorrectQuestions, unattemptedRed] = await Promise.all([
    db.masterQuestion.findMany({ where: { id: { in: incorrectIds } }, take: 50 }),
    db.masterQuestion.findMany({
      where: { repetitionTier: "RED", id: { notIn: [...latestByQ.keys()] } },
      take: 50,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Revision"
        subtitle="A basic due-for-review queue — questions you got wrong, plus Red-tier (high-yield, repeated) questions you haven't attempted. Full spaced-repetition scheduling (Part 19) isn't built yet."
      />
      <div className="p-8 space-y-8">
        <Section title={`Got wrong (${incorrectQuestions.length})`} questions={incorrectQuestions} empty="Nothing here yet — incorrect answers will queue up for review." />
        <Section title={`Unattempted Red-tier — high yield (${unattemptedRed.length})`} questions={unattemptedRed} empty="All Red-tier questions attempted." />
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
