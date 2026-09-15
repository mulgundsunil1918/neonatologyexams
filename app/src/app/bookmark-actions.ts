"use server";

// Shared across both MCQ and Theory question pages (and the Bookmarks list itself) — a
// bookmark is just a MasterQuestion + the single local user, regardless of paperType.

import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { revalidatePath } from "next/cache";

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

// NrpQuestion has no exam-paper/system provenance and deliberately lives in its own table
// (NrpBookmark, not a nullable-FK addition to Bookmark) — same separation as the rest of the
// NRP module. Otherwise an exact mirror of toggleBookmark above.
export async function toggleNrpBookmark(nrpQuestionId: string, flag: "important" | "revise" | null) {
  const existing = await db.nrpBookmark.findUnique({
    where: { userId_nrpQuestionId: { userId: DEFAULT_USER_ID, nrpQuestionId } },
  });
  if (existing) {
    if (flag === null) {
      await db.nrpBookmark.delete({ where: { id: existing.id } });
    } else {
      await db.nrpBookmark.update({ where: { id: existing.id }, data: { flag } });
    }
  } else if (flag !== null) {
    await db.nrpBookmark.create({ data: { userId: DEFAULT_USER_ID, nrpQuestionId, flag } });
  }
  revalidatePath(`/nrp/mcq/${nrpQuestionId}`);
  revalidatePath("/bookmarks");
}
