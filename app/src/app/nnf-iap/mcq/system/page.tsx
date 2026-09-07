import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import Link from "next/link";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function McqSystemPage() {
  const [systems, counts, unclassifiedCount] = await Promise.all([
    db.system.findMany({ orderBy: { sortOrder: "asc" } }),
    db.masterQuestion.groupBy({ by: ["primarySystemId"], where: { paperType: "MCQ" }, _count: true }),
    db.masterQuestion.count({ where: { paperType: "MCQ", primarySystemId: null } }),
  ]);
  const countBySystem = new Map(counts.map((c) => [c.primarySystemId, c._count]));

  return (
    <div>
      <PageHeader
        title="MCQ — System-wise"
        subtitle="The 24 systems from your syllabus. Each question is tagged to the system its clinical content actually belongs to — nothing is forced to fit."
        right={<BackLink href="/nnf-iap/mcq">MCQ</BackLink>}
      />
      <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {systems.map((s) => (
          <Link
            key={s.id}
            href={`/mcq?system=${s.id}`}
            className="flex items-center justify-between px-4 py-3.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <span className="text-sm font-medium">{s.name}</span>
            <span className="text-xs font-mono text-muted-foreground">{countBySystem.get(s.id) ?? 0}</span>
          </Link>
        ))}
        {unclassifiedCount > 0 && (
          <Link
            href="/mcq?system=unclassified"
            className="flex items-center justify-between px-4 py-3.5 rounded-lg border border-dashed border-border hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground"
          >
            <span className="text-sm">Unclassified (pending review)</span>
            <span className="text-xs font-mono">{unclassifiedCount}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
