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

export async function toggleBookmark(masterQuestionId: string, flag: "important" | "revise" | null) {
  const existing = await db.bookmark.findUnique({
    where: { userId_masterQuestionId: { userId: DEFAULT_USER_ID, masterQuestionId } },
  });
  if (existing) {
    if (flag === null) {
      await db.bookmark.delete({ where: { id: existing.id } });
    } else {
      await db.bookmark.update({ where: { id: existing.id }, data: { flag } });
    }
  } else if (flag !== null) {
    await db.bookmark.create({ data: { userId: DEFAULT_USER_ID, masterQuestionId, flag } });
  }
  revalidatePath(`/mcq/${masterQuestionId}`);
  revalidatePath("/bookmarks");
}
