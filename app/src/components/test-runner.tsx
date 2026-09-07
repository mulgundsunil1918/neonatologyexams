"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitTest } from "@/app/test-actions";
import { TierBadge } from "@/components/tier-badge";
import { CONFIDENCE_META, RESOURCES_ROOT } from "@/lib/constants";
import { toneClasses, SOURCE_RANK } from "@/lib/confidence-ui";

export type TestQuestionT = {
  id: string;
  label: string; // e.g. "Q42" or "3"
  stem: string;
  repetitionTier: string;
  options: { id: string; letter: string; text: string }[];
  correctLetter: string | null;
  answerConfidenceStatus: string;
  explanation: string | null;
  sources: {
    id: string;
    resourceTitle: string;
    fileName: string;
    chapter: string | null;
    pageRef: string | null;
    matchedSnippet: string | null;
    confidenceStatus: string;
  }[];
};

export function TestRunner({
  mode,
  questions,
  submitLabel = "Submit",
}: {
  mode: "paperwise" | "mcq_test";
  questions: TestQuestionT[];
  submitLabel?: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ correct: number; incorrect: number; skipped: number; ungraded: number; total: number; timeSpentSecs: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const startedAt = useRef(Date.now());

  const submitted = result !== null;
  const answeredCount = Object.keys(answers).length;

  function handleSubmit() {
    const elapsed = Math.round((Date.now() - startedAt.current) / 1000);
    startTransition(async () => {
      const payload = questions.map((q) => ({ masterQuestionId: q.id, selectedLetter: answers[q.id] ?? null }));
      const r = await submitTest(mode, payload, elapsed);
      setResult(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <div>
      {submitted && (
        <div className="sticky top-0 z-10 bg-card border border-border rounded-lg p-5 mb-6 shadow-sm">
          <h2 className="font-serif font-semibold text-lg mb-3">Results</h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            <ResultStat label="Correct" value={result.correct} tone="good" />
            <ResultStat label="Incorrect" value={result.incorrect} tone="bad" />
            <ResultStat label="Skipped" value={result.skipped} tone="neutral" />
            <ResultStat label="Time taken" value={`${Math.floor(result.timeSpentSecs / 60)}m ${result.timeSpentSecs % 60}s`} tone="neutral" isTime />
          </div>
          {result.ungraded > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              {result.ungraded} question{result.ungraded === 1 ? "" : "s"} answered but not gradable yet — no answer on file for {result.ungraded === 1 ? "it" : "them"}.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Review your answers, explanations, and sources below.</p>
        </div>
      )}

      {!submitted && (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur border-b border-border py-3 mb-4 -mx-8 px-8">
          <span className="text-sm text-muted-foreground font-mono">{answeredCount} / {questions.length} answered</span>
          <Button onClick={handleSubmit} disabled={pending}>{submitLabel}</Button>
        </div>
      )}

      <div className="space-y-8">
        {questions.map((q) => {
          const selected = answers[q.id];
          const confMeta = CONFIDENCE_META[q.answerConfidenceStatus] ?? CONFIDENCE_META.NOT_FOUND;
          return (
            <div key={q.id} className="pb-8 border-b border-border last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-semibold text-muted-foreground">Q{q.label}</span>
                {submitted && <TierBadge tier={q.repetitionTier} showLabel={false} />}
              </div>
              <p className="text-sm leading-relaxed mb-3">{q.stem}</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isSelected = selected === opt.letter;
                  const isCorrectOpt = submitted && q.correctLetter === opt.letter;
                  const isWrongPick = submitted && isSelected && q.correctLetter && q.correctLetter !== opt.letter;
                  return (
                    <button
                      key={opt.id}
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.letter }))}
                      className={cn(
                        "flex items-start gap-3 text-left px-3.5 py-2.5 rounded-md border text-sm transition-colors",
                        !submitted && isSelected && "border-primary bg-accent",
                        !submitted && !isSelected && "border-border hover:border-primary/40",
                        submitted && isCorrectOpt && "border-good bg-good-bg",
                        submitted && isWrongPick && "border-bad bg-bad-bg",
                        submitted && !isCorrectOpt && !isWrongPick && "border-border opacity-60"
                      )}
                    >
                      <span className="font-mono font-semibold text-muted-foreground shrink-0">{opt.letter}.</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-4 space-y-3">
                  {!q.correctLetter ? (
                    <p className="text-xs text-muted-foreground italic">No answer on file yet for this question.</p>
                  ) : (
                    <span className={"inline-block text-[11px] font-mono px-2 py-0.5 rounded-full border " + toneClasses(confMeta.tone)}>
                      {confMeta.label}
                    </span>
                  )}

                  {q.explanation && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Explanation</div>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">{q.explanation}</p>
                    </div>
                  )}

                  {q.sources.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Sources</div>
                      <div className="space-y-2">
                        {[...q.sources]
                          .sort((a, b) => SOURCE_RANK[a.confidenceStatus] - SOURCE_RANK[b.confidenceStatus])
                          .map((s) => {
                            const meta = CONFIDENCE_META[s.confidenceStatus] ?? CONFIDENCE_META.NOT_FOUND;
                            const fileHref = `file://${RESOURCES_ROOT}/${encodeURIComponent(s.fileName)}#page=${s.pageRef}`;
                            return (
                              <div key={s.id} className="rounded-md border border-border p-2.5">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <a href={fileHref} className="font-medium text-xs hover:underline hover:text-primary">{s.resourceTitle}</a>
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
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={pending} size="lg">{submitLabel}</Button>
        </div>
      )}
    </div>
  );
}

function ResultStat({ label, value, tone, isTime }: { label: string; value: number | string; tone: "good" | "bad" | "neutral"; isTime?: boolean }) {
  return (
    <div>
      <div className={cn("text-xl font-mono font-semibold", tone === "good" && "text-good", tone === "bad" && "text-bad")}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}
