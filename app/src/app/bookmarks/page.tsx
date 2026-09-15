import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { BookmarkList } from "./bookmark-list";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
  const [systems, bookmarks] = await Promise.all([
    db.system.findMany({ orderBy: { sortOrder: "asc" } }),
    db.bookmark.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      include: {
        masterQuestion: {
          include: {
            primarySystem: { select: { id: true, name: true } },
            subParts: { take: 1, orderBy: { sortOrder: "asc" }, select: { text: true } },
          },
        },
      },
    }),
  ]);

  // Grouped in the same canonical syllabus order used everywhere else in the app (System's
  // own sortOrder, not alphabetical) — Unclassified goes last since it isn't a real system.
  const bySystem = new Map<string, typeof bookmarks>();
  for (const b of bookmarks) {
    const key = b.masterQuestion.primarySystem?.id ?? "unclassified";
    if (!bySystem.has(key)) bySystem.set(key, []);
    bySystem.get(key)!.push(b);
  }

  const groups = [
    ...systems
      .filter((s) => bySystem.has(s.id))
      .map((s) => ({ system: s.name, rows: bySystem.get(s.id)! })),
    ...(bySystem.has("unclassified") ? [{ system: "Unclassified", rows: bySystem.get("unclassified")! }] : []),
  ].map((g) => ({
    system: g.system,
    rows: g.rows.map((b) => ({
      masterQuestionId: b.masterQuestionId,
      stem: b.masterQuestion.stem || b.masterQuestion.subParts[0]?.text || "(untitled question)",
      paperType: b.masterQuestion.paperType,
      repetitionTier: b.masterQuestion.repetitionTier,
    })),
  }));

  return (
    <div>
      <PageHeader
        title="Bookmarks"
        subtitle={`${bookmarks.length} question${bookmarks.length === 1 ? "" : "s"} flagged to revisit — grouped by system.`}
      />
      {groups.length > 0 ? (
        <BookmarkList groups={groups} />
      ) : (
        <div className="px-8 py-16 text-center text-muted-foreground text-sm">
          No bookmarks yet — open any question and click Bookmark.
        </div>
      )}
    </div>
  );
}
