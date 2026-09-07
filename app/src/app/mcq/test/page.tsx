import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { TestRunner } from "@/components/test-runner";
import { buildMcqWhere } from "@/lib/mcq-filters";
import { BackLink } from "@/components/back-link";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

const TEST_CAP = 50;

export default async function McqTestPage({ searchParams }: PageProps<"/mcq/test">) {
  const sp = await searchParams;
  const where = await buildMcqWhere(sp);

  const questions = await db.masterQuestion.findMany({
    where,
    orderBy: [{ repetitionTier: "asc" }, { id: "asc" }],
    take: TEST_CAP,
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      answer: true,
      explanation: true,
      sources: { include: { resource: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Test Mode"
        subtitle={`${questions.length} question${questions.length === 1 ? "" : "s"} from your current filters — answer them all, then submit to see your score, the correct answers, explanations, and sources together.`}
        right={<BackLink href="/mcq">Back to MCQ Master</BackLink>}
      />
      <div className="max-w-3xl mx-auto px-8 py-8">
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions match your filters — go back and widen them.</p>
        ) : (
          <TestRunner
            mode="mcq_test"
            submitLabel="Submit Test"
            questions={questions.map((q, i) => ({
              id: q.id,
              label: String(i + 1),
              stem: q.stem,
              repetitionTier: q.repetitionTier,
              options: q.options,
              correctLetter: q.answer?.correctLetter ?? null,
              answerConfidenceStatus: q.answer?.confidenceStatus ?? "NOT_FOUND",
              explanation: q.explanation?.body ?? null,
              sources: q.sources.map((s) => ({
                id: s.id,
                resourceTitle: s.resource.title,
                fileName: s.resource.fileName,
                chapter: s.chapter,
                pageRef: s.pageRef,
                matchedSnippet: s.matchedSnippet,
                confidenceStatus: s.confidenceStatus,
              })),
            }))}
          />
        )}
      </div>
    </div>
  );
}
