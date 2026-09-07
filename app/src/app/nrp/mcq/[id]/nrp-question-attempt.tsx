"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OptionT = { id: string; letter: string; text: string };

// Client-side only — no Attempt persistence for this first pass of the NRP module (a small,
// fixed practice set; not tied into the exam-fidelity Attempt/analytics model that tracks
// MasterQuestion history). Add a server action + NrpAttempt model later if progress tracking
// across sessions is wanted here too.
export function NrpQuestionAttempt({ options, correctLetter }: { options: OptionT[]; correctLetter: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-2.5 my-5">
        {options.map((opt) => {
          const isSelected = selected === opt.letter;
          const isCorrectOpt = submitted && correctLetter === opt.letter;
          const isWrongPick = submitted && isSelected && correctLetter !== opt.letter;
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

      {!submitted ? (
        <Button onClick={() => setSubmitted(true)} disabled={!selected}>Submit Answer</Button>
      ) : (
        <div className="flex items-center gap-2 text-sm font-medium">
          {selected === correctLetter ? <span className="text-good">✓ Correct</span> : <span className="text-bad">✗ Incorrect — correct answer is {correctLetter}</span>}
        </div>
      )}
    </div>
  );
}
