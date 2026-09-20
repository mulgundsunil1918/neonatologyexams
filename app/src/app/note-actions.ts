"use server";

import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { revalidatePath } from "next/cache";

// One note per (user, question) — no unique constraint in the schema, so this reads the
// existing row (if any) and updates it rather than relying on a DB-level upsert key.
export async function saveNote(masterQuestionId: string, body: string) {
  const trimmed = body.trim();
  const existing = await db.note.findFirst({ where: { userId: DEFAULT_USER_ID, masterQuestionId } });

  if (!trimmed) {
    // Saving an empty note deletes it — there's no value in keeping a blank row around.
    if (existing) await db.note.delete({ where: { id: existing.id } });
  } else if (existing) {
    await db.note.update({ where: { id: existing.id }, data: { body: trimmed } });
  } else {
    await db.note.create({ data: { userId: DEFAULT_USER_ID, masterQuestionId, body: trimmed } });
  }

  revalidatePath(`/mcq/${masterQuestionId}`);
  revalidatePath("/notes");
}
