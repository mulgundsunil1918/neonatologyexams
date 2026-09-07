"use server";

import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function submitPaper(
  paperId: string,
  answers: { masterQuestionId: string; selectedLetter: string | null }[],
  timeSpentSecs: number
) {
  const session = await db.studySession.create({
    data: { userId: DEFAULT_USER_ID, mode: "paperwise", endedAt: new Date() },
  });

  const knownAnswers = await db.answer.findMany({
    where: { masterQuestionId: { in: answers.map((a) => a.masterQuestionId) } },
  });
  const correctByQ = new Map(knownAnswers.map((a) => [a.masterQuestionId, a.correctLetter]));

  let correct = 0, incorrect = 0, skipped = 0, ungraded = 0;

  for (const a of answers) {
    if (!a.selectedLetter) {
      skipped++;
      continue;
    }
    const known = correctByQ.get(a.masterQuestionId);
    const isCorrect = known ? known === a.selectedLetter : null;
    if (isCorrect === true) correct++;
    else if (isCorrect === false) incorrect++;
    else ungraded++;

    await db.attempt.create({
      data: {
        userId: DEFAULT_USER_ID,
        masterQuestionId: a.masterQuestionId,
        selectedLetter: a.selectedLetter,
        isCorrect,
        studySessionId: session.id,
        timeSpentSecs: Math.round(timeSpentSecs / answers.length),
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/mcq");

  return { correct, incorrect, skipped, ungraded, total: answers.length, timeSpentSecs };
}
