import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

export type McqSearchParams = Record<string, string | string[] | undefined>;

// Shared MCQ Master filter logic — used by the list page, Test Mode, and Full Learn Mode so the
// three stay in sync (the same filters that narrow the list also define what a "test" or "full
// learn" session covers). Also reused by the Theory list page (paperType: "THEORY") for its
// simpler year/system filtering.
export async function buildMcqWhere(sp: McqSearchParams, paperType: "MCQ" | "THEORY" = "MCQ"): Promise<Prisma.MasterQuestionWhereInput> {
  const where: Prisma.MasterQuestionWhereInput = { paperType };
  if (sp.tier && sp.tier !== "all") where.repetitionTier = sp.tier as string;
  if (sp.system && sp.system !== "all") where.primarySystemId = sp.system === "unclassified" ? null : (sp.system as string);
  if (sp.image === "yes") where.hasImage = true;
  if (sp.q) where.stem = { contains: sp.q as string };
  if (sp.sitting && sp.sitting !== "all") {
    where.occurrences = { some: { paper: { sittingId: sp.sitting as string } } };
  }

  if (sp.attempted && sp.attempted !== "all") {
    const attempts = await db.attempt.findMany({
      where: { userId: DEFAULT_USER_ID },
      select: { masterQuestionId: true, isCorrect: true },
      orderBy: { attemptedAt: "desc" },
    });
    const attemptByQ = new Map<string, boolean | null>();
    for (const a of attempts) if (!attemptByQ.has(a.masterQuestionId)) attemptByQ.set(a.masterQuestionId, a.isCorrect);

    if (sp.attempted === "yes") where.id = { in: [...attemptByQ.keys()] };
    if (sp.attempted === "no") where.id = { notIn: [...attemptByQ.keys()] };
    if (sp.attempted === "incorrect") where.id = { in: [...attemptByQ.entries()].filter(([, c]) => c === false).map(([id]) => id) };
  }

  return where;
}

export function currentFilterQueryString(sp: McqSearchParams) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    if (v && typeof v === "string") params.set(k, v);
  }
  return params.toString();
}
