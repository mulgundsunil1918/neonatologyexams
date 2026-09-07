"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitAnswer, toggleBookmark } from "./actions";
import { Bookmark, BookmarkCheck } from "lucide-react";

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
  priorAttempt: { selectedLetter: string | null; isCorrect: boolean | null } | null;
  knownAnswer: string | null;
  isBookmarked: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(priorAttempt?.selectedLetter ?? null);
  const [result, setResult] = useState<{ isCorrect: boolean | null; correctLetter: string | null } | null>(
    priorAttempt ? { isCorrect: priorAttempt.isCorrect, correctLetter: knownAnswer } : null
  );
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [pending, startTransition] = useTransition();

  const submitted = result !== null;

  function handleSubmit() {
    if (!selected) return;
    startTransition(async () => {
      const r = await submitAnswer(masterQuestionId, selected);
      setResult(r);
    });
  }

  function handleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(() => toggleBookmark(masterQuestionId, next ? "important" : null));
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
        <Button variant="ghost" size="sm" onClick={handleBookmark} className="ml-auto text-muted-foreground">
          {bookmarked ? <BookmarkCheck className="size-4 mr-1.5" /> : <Bookmark className="size-4 mr-1.5" />}
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </div>
    </div>
  );
}
