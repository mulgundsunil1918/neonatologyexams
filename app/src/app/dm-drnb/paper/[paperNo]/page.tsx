import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import Link from "next/link";
import { notFound } from "next/navigation";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

const PAPER_ROMAN = ["I", "II", "III", "IV"];

export default async function DmPaperYearPage({ params }: { params: Promise<{ paperNo: string }> }) {
  const { paperNo: paperNoStr } = await params;
  const paperNo = parseInt(paperNoStr, 10);
  if (!(paperNo >= 1 && paperNo <= 4)) notFound();

  const papers = await db.dmPaper.findMany({
    where: { paperNo },
    include: { sitting: true },
    orderBy: { sitting: { sortOrder: "desc" } },
  });
  if (papers.length === 0) notFound();

  return (
    <div>
      <PageHeader
        title={`DM/DrNB Paper ${PAPER_ROMAN[paperNo - 1]}`}
        subtitle={`${papers[0].title} — pick a sitting to see the original 12-question paper.`}
        right={<BackLink href="/dm-drnb">DM/DrNB</BackLink>}
      />
      <div className="p-8 grid sm:grid-cols-2 gap-3 max-w-3xl">
        {papers.map((p) => (
          <Link
            key={p.id}
            href={`/dm-drnb/paper/${paperNo}/${p.sittingId}`}
            className="flex items-center justify-between px-4 py-3.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <span className="text-sm font-medium">
              {p.sitting.label}
              {p.sitting.sessionNote && <span className="text-xs text-muted-foreground ml-1.5">{p.sitting.sessionNote}</span>}
            </span>
            <span className="text-xs font-mono text-muted-foreground shrink-0 ml-3">12 questions</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
