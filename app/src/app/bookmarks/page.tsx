import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { BookmarkList } from "./bookmark-list";
import { NrpBookmarkList } from "./nrp-bookmark-list";
import { DmBookmarkList } from "./dm-bookmark-list";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
  const [systems, bookmarks, nrpBookmarks, dmBookmarks] = await Promise.all([
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
    // NrpQuestion has no exam-paper/System link (see schema comment) — a separate table,
    // separate query, same as everywhere else this module touches the main question bank.
    db.nrpBookmark.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      include: { nrpQuestion: { select: { id: true, stem: true, topic: true, sortOrder: true } } },
    }),
    // DmQuestionItem likewise lives in its own table family (see schema comment on DmBookmark).
    db.dmBookmark.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      include: { item: { include: { paper: { include: { sitting: true } } } } },
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

  // NRP topics have no System row to sort by — order groups by the lowest sortOrder among
  // their own bookmarked questions instead, which tracks the curriculum order closely enough.
  const byTopic = new Map<string, typeof nrpBookmarks>();
  for (const b of nrpBookmarks) {
    const key = b.nrpQuestion.topic;
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key)!.push(b);
  }
  const nrpGroups = [...byTopic.entries()]
    .map(([topic, rows]) => ({
      topic,
      rows: rows.map((b) => ({ nrpQuestionId: b.nrpQuestionId, stem: b.nrpQuestion.stem })),
      minSortOrder: Math.min(...rows.map((b) => b.nrpQuestion.sortOrder)),
    }))
    .sort((a, b) => a.minSortOrder - b.minSortOrder);

  const dmRows = dmBookmarks.map((b) => ({
    itemId: b.itemId,
    label: b.item.label,
    text: b.item.text,
    paperNo: b.item.paper.paperNo,
    sittingId: b.item.paper.sittingId,
    sittingLabel: b.item.paper.sitting.label,
  }));

  const total = bookmarks.length + nrpBookmarks.length + dmBookmarks.length;
  const sectionsPresent = [groups.length > 0, nrpGroups.length > 0, dmRows.length > 0].filter(Boolean).length;
  const showSectionLabels = sectionsPresent > 1;

  return (
    <div>
      <PageHeader
        title="Bookmarks"
        subtitle={`${total} question${total === 1 ? "" : "s"} flagged to revisit — grouped by system.`}
      />
      {total === 0 ? (
        <div className="px-8 py-16 text-center text-muted-foreground text-sm">
          No bookmarks yet — open any question and click Bookmark.
        </div>
      ) : (
        <div>
          {groups.length > 0 && (
            <div>
              {showSectionLabels && (
                <div className="px-8 pt-6 pb-1 text-sm font-semibold text-foreground">Fellowship Question Bank</div>
              )}
              <BookmarkList groups={groups} />
            </div>
          )}
          {nrpGroups.length > 0 && (
            <div>
              {showSectionLabels && <div className="px-8 pt-6 pb-1 text-sm font-semibold text-foreground">NRP 9th Edition</div>}
              <NrpBookmarkList groups={nrpGroups} />
            </div>
          )}
          {dmRows.length > 0 && (
            <div>
              {showSectionLabels && <div className="px-8 pt-6 pb-1 text-sm font-semibold text-foreground">DM/DrNB</div>}
              <DmBookmarkList rows={dmRows} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
