"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitAnswer, rateConfidence } from "./actions";
import { BookmarkButton } from "@/components/bookmark-button";
import { CONFIDENCE_LABELS } from "@/lib/spaced-repetition";

type OptionT = { id: string; letter: string; text: string };

export function QuestionAttempt({
  masterQuestionId,
  options,
  priorAttempt,
  knownAnswer,
  isBookmarked,
}: {
  masterQuestionId: string;
  options: OptionT[];
  priorAttempt: { id: string; selectedLetter: string | null; isCorrect: boolean | null; confidence: number | null } | null;
  knownAnswer: string | null;
  isBookmarked: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(priorAttempt?.selectedLetter ?? null);
  const [result, setResult] = useState<{ attemptId: string; isCorrect: boolean | null; correctLetter: string | null } | null>(
    priorAttempt ? { attemptId: priorAttempt.id, isCorrect: priorAttempt.isCorrect, correctLetter: knownAnswer } : null
  );
  const [confidence, setConfidence] = useState<number | null>(priorAttempt?.confidence ?? null);
  const [pending, startTransition] = useTransition();

  const submitted = result !== null;

  function handleSubmit() {
    if (!selected) return;
    startTransition(async () => {
      const r = await submitAnswer(masterQuestionId, selected);
      setResult(r);
    });
  }

  function handleRate(value: number) {
    setConfidence(value); // optimistic — this is a "how did that feel" rating, not graded data
    if (result) startTransition(async () => { await rateConfidence(result.attemptId, value); });
  }

  return (
    <div>
      <div className="flex flex-col gap-2.5 my-5">
        {options.map((opt) => {
          const isSelected = selected === opt.letter;
          const isCorrectOpt = submitted && result.correctLetter === opt.letter;
          const isWrongPick = submitted && isSelected && result.correctLetter && result.correctLetter !== opt.letter;
          return (
            <button
              key={opt.id}
              disabled={submitted}
              onClick={() => setSelected(opt.letter)}
              className={cn(
                "flex items-start gap-3 text-left px-4 py-3 rounded-lg border text-sm transition-colors",
                !submitted && isSelected && "border-primary bg-accent",
                !submitted && !isSelected && "border-border hover:border-primary/40 hover:bg-muted/40",
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

      <div className="flex items-center gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!selected || pending}>Submit Answer</Button>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium">
            {result.isCorrect === true && <span className="text-good">✓ Correct</span>}
            {result.isCorrect === false && <span className="text-bad">✗ Incorrect</span>}
            {result.isCorrect === null && <span className="text-muted-foreground">Recorded — no source-confirmed answer to grade against yet</span>}
          </div>
        )}
        <BookmarkButton questionId={masterQuestionId} isBookmarked={isBookmarked} className="ml-auto" />
      </div>

      {/* Only meaningful after a correct answer — a wrong one is already scheduled back for
          tomorrow regardless, there's nothing to rate about knowing you missed it. */}
      {submitted && result.isCorrect === true && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground shrink-0">How well did you know it?</span>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => handleRate(v)}
                disabled={pending}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md border transition-colors",
                  confidence === v ? "border-primary bg-accent text-accent-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {CONFIDENCE_LABELS[v]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
