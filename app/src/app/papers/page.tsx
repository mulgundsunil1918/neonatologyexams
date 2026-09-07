import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function PapersPage() {
  const sittings = await db.sitting.findMany({
    orderBy: { id: "desc" },
    include: {
      papers: {
        orderBy: { paperNo: "asc" },
        include: { _count: { select: { occurrences: true } } },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Paper-wise Solving"
        subtitle="Solve a paper exactly as it was originally set — original numbering, original sequence, no reordering by topic."
      />
      <div className="p-8 grid md:grid-cols-2 gap-4">
        {sittings.map((s) => (
          <Card key={s.id} className="p-5">
            <h3 className="font-serif font-semibold text-base mb-3">{s.label}</h3>
            <div className="flex flex-col gap-2">
              {s.papers.map((p) => (
                <Link
                  key={p.id}
                  href={`/papers/${s.id}/${p.paperNo}`}
                  className="flex items-center justify-between px-3 py-2 rounded-md border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors text-sm"
                >
                  <span>Paper {p.paperNo} <span className="text-muted-foreground">({p.paperType === "MCQ" ? "MCQ" : "Theory"})</span></span>
                  <span className="text-xs font-mono text-muted-foreground">{p._count.occurrences} Qs</span>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
