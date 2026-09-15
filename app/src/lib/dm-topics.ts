import { db } from "@/lib/db";

// Same concept as src/lib/theory-topics.ts (NNF Theory), applied to the DM/DrNB bank instead
// of MasterQuestion/SubPart — counts distinct PAPER-INSTANCES (not raw items) that touch a
// topic, since one paper can ask the same theme in more than one of its 12 items.
//
// Tags here are deliberately COARSER than the NNF Theory tag set (per Sunil's instruction:
// "it need not be exact word to word match, any nearer topic to similar question also to be
// considered for prioritising") — e.g. "PPHN" covers pathophysiology, management, and drug
// questions about persistent pulmonary hypertension alike, rather than three separate tags.
export type DmTopicTier = "RED" | "ORANGE" | null;

export function dmTopicTier(count: number): DmTopicTier {
  if (count >= 3) return "RED";
  if (count === 2) return "ORANGE";
  return null;
}

let cache: Map<string, number> | null = null;

export async function getDmTopicCounts(): Promise<Map<string, number>> {
  if (cache) return cache;

  const rows = await db.dmQuestionItem.findMany({
    where: { topicTag: { not: null } },
    select: { paperId: true, topicTag: true },
  });

  const byTopic = new Map<string, Set<string>>();
  for (const r of rows) {
    const set = byTopic.get(r.topicTag!) ?? new Set<string>();
    set.add(r.paperId);
    byTopic.set(r.topicTag!, set);
  }

  cache = new Map([...byTopic.entries()].map(([topic, ids]) => [topic, ids.size]));
  return cache;
}

export type DmTopicSummary = { topic: string; count: number; tier: DmTopicTier };

export async function getDmItemTopicSummary(topicTag: string | null): Promise<DmTopicSummary | null> {
  if (!topicTag) return null;
  const counts = await getDmTopicCounts();
  const count = counts.get(topicTag) ?? 1;
  return { topic: topicTag, count, tier: dmTopicTier(count) };
}
