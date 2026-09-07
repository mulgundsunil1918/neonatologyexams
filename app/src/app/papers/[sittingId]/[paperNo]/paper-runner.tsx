"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitPaper } from "./actions";
import { TierBadge } from "@/components/tier-badge";

type QuestionT = {
  id: string;
  originalQnum: number;
  stem: string;
  repetitionTier: string;
  options: { id: string; letter: string; text: string }[];
  correctLetter: string | null;
};

export function PaperRunner({ paperId, questions }: { paperId: string; questions: QuestionT[] }) {
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
      const r = await submitPaper(paperId, payload, elapsed);
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
              {result.ungraded} question{result.ungraded === 1 ? "" : "s"} answered but not gradable yet — no source-confirmed answer key for {result.ungraded === 1 ? "it" : "them"}.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Review your answers below.</p>
        </div>
      )}

      {!submitted && (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur border-b border-border py-3 mb-4 -mx-8 px-8">
          <span className="text-sm text-muted-foreground font-mono">{answeredCount} / {questions.length} answered</span>
          <Button onClick={handleSubmit} disabled={pending}>Submit Paper</Button>
        </div>
      )}

      <div className="space-y-8">
        {questions.map((q) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} id={`q-${q.originalQnum}`} className="pb-8 border-b border-border last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-semibold text-muted-foreground">Q{q.originalQnum}</span>
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
              {submitted && !q.correctLetter && (
                <p className="text-xs text-muted-foreground italic mt-2">No source-confirmed answer available yet.</p>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={pending} size="lg">Submit Paper</Button>
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
