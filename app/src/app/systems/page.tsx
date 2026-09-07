import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function SystemsPage() {
  const systems = await db.system.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { primaryQuestions: true } } },
  });
  const unclassifiedCount = await db.masterQuestion.count({ where: { primarySystemId: null } });

  return (
    <div>
      <PageHeader
        title="System-wise Study"
        subtitle="The 24 systems from your syllabus. Each question is tagged to the system its clinical content actually belongs to — nothing is forced to fit."
      />
      <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {systems.map((s) => (
          <Link
            key={s.id}
            href={`/mcq?system=${s.id}`}
            className="flex items-center justify-between px-4 py-3.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <span className="text-sm font-medium">{s.name}</span>
            <span className="text-xs font-mono text-muted-foreground">{s._count.primaryQuestions}</span>
          </Link>
        ))}
        {unclassifiedCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3.5 rounded-lg border border-dashed border-border text-muted-foreground">
            <span className="text-sm">Unclassified (pending review)</span>
            <span className="text-xs font-mono">{unclassifiedCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
