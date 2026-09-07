import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = { qbank: "Question Bank", textbook: "Textbook", protocol: "Protocol" };

export default async function ResourcesPage() {
  const resources = await db.resource.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
    include: { _count: { select: { sources: true } } },
  });
  const grouped = resources.reduce<Record<string, typeof resources>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Resource Library"
        subtitle="Every uploaded reference. Chapter/page cross-linking from questions to these books is a follow-on pass — not run yet, so citation counts read 0 for now."
      />
      <div className="p-8 space-y-8">
        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {CATEGORY_LABEL[cat] ?? cat}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="font-medium text-sm">{r.title}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1 flex gap-3">
                    {r.edition && <span>{r.edition} ed.</span>}
                    {r.year && <span>{r.year}</span>}
                    {r.pageCount && <span>{r.pageCount}pp</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-2">
                    {r._count.sources} question{r._count.sources === 1 ? "" : "s"} cite this source
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
