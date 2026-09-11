import { db } from "@/lib/db";

// How many DIFFERENT Theory questions (across all sittings) touch a given clinical topic —
// tagged by reading each sub-part's actual content (see recovered/consolidated/tag-topics.ts,
// applied once), not by text-matching. This is the concept-level counterpart to MCQ's
// exact-text repetitionTier: Theory essay questions are almost never worded identically twice,
// so "high yield" here means the same clinical topic keeps coming up across different sittings,
// not that the same sentence repeats.
export type TopicTier = "RED" | "ORANGE" | null;

export function topicTier(count: number): TopicTier {
  if (count >= 3) return "RED"; // asked (as some sub-part) in 3 or more different sittings
  if (count === 2) return "ORANGE"; // repeated once
  return null; // only asked once so far
}

let cache: Map<string, number> | null = null;

// Distinct-MasterQuestion count per topicTag, across sub-parts and whole-question tags.
// Cached per server lifetime — the tag set only changes when someone re-runs the tagging
// script, not on every request, so recomputing per page load would be wasted work.
export async function getTopicCounts(): Promise<Map<string, number>> {
  if (cache) return cache;

  const [subRows, wholeRows] = await Promise.all([
    db.subPart.findMany({
      where: { masterQuestion: { paperType: "THEORY" }, topicTag: { not: null } },
      select: { masterQuestionId: true, topicTag: true },
    }),
    db.masterQuestion.findMany({
      where: { paperType: "THEORY", topicTag: { not: null } },
      select: { id: true, topicTag: true },
    }),
  ]);

  const byTopic = new Map<string, Set<string>>();
  for (const r of subRows) {
    const set = byTopic.get(r.topicTag!) ?? new Set<string>();
    set.add(r.masterQuestionId);
    byTopic.set(r.topicTag!, set);
  }
  for (const r of wholeRows) {
    const set = byTopic.get(r.topicTag!) ?? new Set<string>();
    set.add(r.id);
    byTopic.set(r.topicTag!, set);
  }

  cache = new Map([...byTopic.entries()].map(([topic, ids]) => [topic, ids.size]));
  return cache;
}

export type TopicSummary = { topic: string; count: number; tier: TopicTier };

// One summary row per distinct topic touched by this question's sub-parts (or its own
// topicTag if it has no sub-parts), sorted highest-yield first — for rendering badges.
export async function getQuestionTopicSummaries(topics: (string | null)[]): Promise<TopicSummary[]> {
  const counts = await getTopicCounts();
  const distinct = [...new Set(topics.filter((t): t is string => !!t))];
  return distinct
    .map((topic) => ({ topic, count: counts.get(topic) ?? 1, tier: topicTier(counts.get(topic) ?? 1) }))
    .sort((a, b) => b.count - a.count);
}
