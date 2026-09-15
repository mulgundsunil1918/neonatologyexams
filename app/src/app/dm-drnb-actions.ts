"use server";

import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { revalidatePath } from "next/cache";

// Exact mirror of toggleBookmark/toggleNrpBookmark in bookmark-actions.ts — DmQuestionItem
// lives in its own table (see schema comment on DmBookmark) so it gets its own action.
export async function toggleDmBookmark(itemId: string, flag: "important" | "revise" | null) {
  const existing = await db.dmBookmark.findUnique({
    where: { userId_itemId: { userId: DEFAULT_USER_ID, itemId } },
  });
  if (existing) {
    if (flag === null) {
      await db.dmBookmark.delete({ where: { id: existing.id } });
    } else {
      await db.dmBookmark.update({ where: { id: existing.id }, data: { flag } });
    }
  } else if (flag !== null) {
    await db.dmBookmark.create({ data: { userId: DEFAULT_USER_ID, itemId, flag } });
  }
  revalidatePath("/dm-drnb", "layout");
  revalidatePath("/bookmarks");
}
