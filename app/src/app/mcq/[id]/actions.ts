"use server";

import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { computeNextReviewDate } from "@/lib/spaced-repetition";
import { revalidatePath } from "next/cache";

export async function submitAnswer(masterQuestionId: string, selectedLetter: string) {
  const answer = await db.answer.findUnique({ where: { masterQuestionId } });
  const isCorrect = answer?.correctLetter ? answer.correctLetter === selectedLetter : null;

  // No confidence rating yet at creation time — a correct answer gets the unrated default
  // interval immediately (rateConfidence below narrows it once the user actually rates it),
  // a wrong one always comes back tomorrow, an ungraded one isn't scheduled at all.
  const attempt = await db.attempt.create({
    data: {
      userId: DEFAULT_USER_ID,
      masterQuestionId,
      selectedLetter,
      isCorrect,
      nextReviewDate: computeNextReviewDate(isCorrect, null),
    },
  });

  revalidatePath(`/mcq/${masterQuestionId}`);
  revalidatePath("/mcq");
  revalidatePath("/dashboard");
  revalidatePath("/revision");

  return { attemptId: attempt.id, isCorrect, correctLetter: answer?.correctLetter ?? null };
}

// Self-rated confidence, prompted only after a CORRECT answer (a wrong one already has a
// fixed one-day interval — there's nothing meaningful to rate about knowing you missed it).
export async function rateConfidence(attemptId: string, confidence: number) {
  const attempt = await db.attempt.update({
    where: { id: attemptId },
    data: { confidence, nextReviewDate: computeNextReviewDate(true, confidence) },
  });
  revalidatePath("/revision");
  return { nextReviewDate: attempt.nextReviewDate };
}

// toggleBookmark moved to src/app/bookmark-actions.ts — it's shared with the Theory branch
// of this same page and with the Bookmarks list, not MCQ-specific.
