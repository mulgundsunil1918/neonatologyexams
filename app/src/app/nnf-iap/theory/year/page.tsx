import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import Link from "next/link";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function TheoryYearPage() {
  const sittings = await db.sitting.findMany({ orderBy: { id: "desc" } });
  const counts = await Promise.all(
    sittings.map((s) =>
      Promise.all([
        db.masterQuestion.count({
          where: { paperType: "THEORY", occurrences: { some: { paper: { sittingId: s.id } } } },
        }),
        db.masterQuestion.count({
          where: { paperType: "THEORY", occurrences: { some: { paper: { sittingId: s.id } } }, answer: { isNot: null } },
        }),
      ])
    )
  );

  return (
    <div>
      <PageHeader
        title="Theory — Year-wise"
        subtitle="Pick an exam sitting to study its theory/essay questions."
        right={<BackLink href="/nnf-iap/theory">Theory</BackLink>}
      />
      <div className="p-8 grid sm:grid-cols-2 gap-3 max-w-3xl">
        {sittings.map((s, i) => {
          const [total, answered] = counts[i];
          return (
            <Link
              key={s.id}
              href={`/theory?sitting=${s.id}`}
              className="flex items-center justify-between px-4 py-3.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
            >
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-xs font-mono text-muted-foreground shrink-0 ml-3">{answered}/{total}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
