"use server";

import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function submitAnswer(masterQuestionId: string, selectedLetter: string) {
  const answer = await db.answer.findUnique({ where: { masterQuestionId } });
  const isCorrect = answer?.correctLetter ? answer.correctLetter === selectedLetter : null;

  await db.attempt.create({
    data: {
      userId: DEFAULT_USER_ID,
      masterQuestionId,
      selectedLetter,
      isCorrect,
    },
  });

  revalidatePath(`/mcq/${masterQuestionId}`);
  revalidatePath("/mcq");
  revalidatePath("/dashboard");

  return { isCorrect, correctLetter: answer?.correctLetter ?? null };
}

// toggleBookmark moved to src/app/bookmark-actions.ts — it's shared with the Theory branch
// of this same page and with the Bookmarks list, not MCQ-specific.
