import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { FileText, Layers, ChevronRight } from "lucide-react";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

const PAPER_TITLES: Record<number, string> = {
  1: "Applied Basic Sciences as Applied to Neonatology and Perinatology; Research Methods",
  2: "Clinical Neonatology",
  3: "Clinical Neonatology and Neonatal Intensive Care including Neonatal Transport",
  4: "Community Neonatology, National MCH Programmes, Allied Disciplines, Recent Advances",
};

export default async function DmDrnbHubPage() {
  const counts = await db.dmPaper.groupBy({ by: ["paperNo"], _count: true });
  const countByPaper = new Map(counts.map((c) => [c.paperNo, c._count]));
  const totalSittings = await db.dmSitting.count();

  return (
    <div>
      <PageHeader
        title="DM/DrNB"
        subtitle={`The Tamil Nadu Dr. M.G.R. Medical University, D.M. — Neonatology exit exam papers, ${totalSittings} sittings from 2011 to 2025 — every question extracted verbatim from the original papers.`}
      />
      <div className="p-8 grid sm:grid-cols-2 gap-3 max-w-3xl">
        {[1, 2, 3, 4].map((paperNo) => (
          <Link
            key={paperNo}
            href={`/dm-drnb/paper/${paperNo}`}
            className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary shrink-0" />
              <span className="font-serif font-semibold text-base flex items-center gap-1">
                Paper {["I", "II", "III", "IV"][paperNo - 1]}
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{PAPER_TITLES[paperNo]}</p>
            <div className="text-xs font-mono text-muted-foreground mt-1">
              {(countByPaper.get(paperNo) ?? 0)} sittings · {(countByPaper.get(paperNo) ?? 0) * 12} questions
            </div>
          </Link>
        ))}
      </div>
      <div className="px-8 pb-8 max-w-3xl">
        <Link
          href="/dm-drnb/browse"
          className="group flex items-center gap-3 rounded-lg border border-dashed border-border p-4 hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Layers className="size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Browse everything, by priority</div>
            <div className="text-xs mt-0.5">All 4 papers together, ranked by how often a topic has come up</div>
          </div>
          <ChevronRight className="size-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
