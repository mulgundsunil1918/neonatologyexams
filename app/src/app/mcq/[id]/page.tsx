import { db } from "@/lib/db";
import { DEFAULT_USER_ID, CONFIDENCE_META } from "@/lib/constants";
import { TierBadge } from "@/components/tier-badge";
import { QuestionAttempt } from "./question-attempt";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageIcon, TableIcon, AlertTriangle } from "lucide-react";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function McqDetailPage({ params }: PageProps<"/mcq/[id]">) {
  const { id } = await params;

  const question = await db.masterQuestion.findUnique({
    where: { id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      subParts: { orderBy: { sortOrder: "asc" } },
      answer: true,
      explanation: true,
      primarySystem: true,
      topic: true,
      sources: { include: { resource: true } },
      occurrences: {
        include: { paper: { include: { sitting: true } } },
        orderBy: [{ paper: { sittingId: "asc" } }],
      },
    },
  });
  if (!question) notFound();

  const [priorAttempt, bookmark] = await Promise.all([
    db.attempt.findFirst({
      where: { userId: DEFAULT_USER_ID, masterQuestionId: id },
      orderBy: { attemptedAt: "desc" },
      select: { selectedLetter: true, isCorrect: true },
    }),
    db.bookmark.findUnique({ where: { userId_masterQuestionId: { userId: DEFAULT_USER_ID, masterQuestionId: id } } }),
  ]);

  // The answer's OWN confidence status, not the question's general flaw/confidence flag —
  // a question can be a perfectly sound question (SOURCE_CONFIRMED at the question level)
  // while its answer is simply not yet sourced (NOT_FOUND), and the two must never be conflated.
  const answerConfStatus = question.answer?.confidenceStatus ?? "NOT_FOUND";
  const confMeta = CONFIDENCE_META[answerConfStatus] ?? CONFIDENCE_META.NOT_FOUND;

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <Link href="/mcq" className="text-xs text-muted-foreground hover:text-foreground">← Back to MCQ Master</Link>

      <div className="flex items-center gap-2 mt-4 mb-1 flex-wrap">
        <TierBadge tier={question.repetitionTier} />
        {question.primarySystem && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-border text-muted-foreground">
            {question.primarySystem.name}
          </span>
        )}
        {question.hasImage && (
          <span className="text-xs flex items-center gap-1 text-muted-foreground"><ImageIcon className="size-3.5" /> image-based</span>
        )}
        {question.hasTable && (
          <span className="text-xs flex items-center gap-1 text-muted-foreground"><TableIcon className="size-3.5" /> has table</span>
        )}
      </div>

      {question.occurrences[0] && (
        <div className="text-xs font-mono text-muted-foreground mb-4">
          {question.occurrences[0].paper.sitting.label} — Paper {question.occurrences[0].paper.paperNo}, Q{question.occurrences[0].originalQnum}
        </div>
      )}

      <h1 className="text-lg leading-relaxed text-foreground font-medium mb-1">{question.stem}</h1>

      {question.flawNote && (
        <div className="flex items-start gap-2 mt-3 mb-4 text-xs text-tier-orange bg-tier-orange-bg border border-tier-orange/30 rounded-md px-3 py-2">
          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
          <span>{question.flawNote}</span>
        </div>
      )}

      {question.paperType === "MCQ" ? (
        <QuestionAttempt
          masterQuestionId={question.id}
          options={question.options}
          priorAttempt={priorAttempt ?? null}
          knownAnswer={question.answer?.correctLetter ?? null}
          isBookmarked={!!bookmark}
        />
      ) : (
        <div className="my-5 space-y-3">
          {question.subParts.map((sp) => (
            <div key={sp.id} className="text-sm flex gap-2">
              <span className="font-mono font-semibold text-muted-foreground shrink-0">{sp.label})</span>
              <span>{sp.text} {sp.marks && <span className="text-muted-foreground font-mono text-xs">({sp.marks})</span>}</span>
            </div>
          ))}
        </div>
      )}

      {/* Answer / confidence status — shown once attempted for MCQ, always for Theory */}
      {(priorAttempt || question.paperType === "THEORY") && (
        <div className="mt-6 pt-6 border-t border-border space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Correct answer</div>
            {question.answer?.correctLetter ? (
              <p className="text-sm font-mono">{question.answer.correctLetter}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not found in uploaded resources yet.</p>
            )}
            <span
              className={
                "inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded-full border " +
                (confMeta.tone === "good" ? "text-good border-good/30 bg-good-bg" :
                 confMeta.tone === "bad" ? "text-bad border-bad/30 bg-bad-bg" :
                 "text-muted-foreground border-border")
              }
            >
              {confMeta.label}
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Explanation</div>
            <p className="text-sm text-muted-foreground italic">
              {question.explanation?.body ?? "Not yet ingested from the reference library — explanations are sourced from the textbook/protocol cross-reference pass, which hasn't run for this question yet."}
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Sources</div>
            {question.sources.length > 0 ? (
              <ul className="text-sm space-y-1">
                {question.sources.map((s) => (
                  <li key={s.id}>
                    <span className="font-medium">{s.resource.title}</span>
                    {s.chapter && <span className="text-muted-foreground"> — {s.chapter}</span>}
                    {s.pageRef && <span className="text-muted-foreground font-mono text-xs"> (p.{s.pageRef})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not found in uploaded resources yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Repetition / occurrences */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Repeated {question.occurrences.length} time{question.occurrences.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap gap-2">
          {question.occurrences.map((o) => (
            <Link
              key={o.id}
              href={`/papers/${o.paper.sittingId}/${o.paper.paperNo}`}
              className="text-xs font-mono px-2 py-1 rounded-md border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
            >
              {o.paper.sittingId} · P{o.paper.paperNo} · Q{o.originalQnum}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
