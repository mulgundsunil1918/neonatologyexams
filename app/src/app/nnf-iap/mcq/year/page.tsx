import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import Link from "next/link";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function McqYearPage() {
  const sittings = await db.sitting.findMany({ orderBy: { id: "desc" } });
  const counts = await Promise.all(
    sittings.map((s) =>
      db.masterQuestion.count({
        where: { paperType: "MCQ", occurrences: { some: { paper: { sittingId: s.id } } } },
      })
    )
  );

  return (
    <div>
      <PageHeader
        title="MCQ — Year-wise"
        subtitle="Pick an exam sitting to study its MCQs."
        right={<BackLink href="/nnf-iap/mcq">MCQ</BackLink>}
      />
      <div className="p-8 grid sm:grid-cols-2 gap-3 max-w-3xl">
        {sittings.map((s, i) => (
          <Link
            key={s.id}
            href={`/mcq?sitting=${s.id}`}
            className="flex items-center justify-between px-4 py-3.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <span className="text-sm font-medium">{s.label}</span>
            <span className="text-xs font-mono text-muted-foreground shrink-0 ml-3">{counts[i]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
