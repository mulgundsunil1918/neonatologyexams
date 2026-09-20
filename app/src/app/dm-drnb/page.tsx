import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { HubCard } from "@/components/hub-card";
import { FileText, Layers } from "lucide-react";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

const PAPER_LABEL: Record<number, string> = {
  1: "Paper I — Basic Sciences",
  2: "Paper II — Clinical Neonatology",
  3: "Paper III — NICU & Transport",
  4: "Paper IV — Community & MCH",
};

export default async function DmDrnbHubPage() {
  const [counts, totalItems] = await Promise.all([
    db.dmPaper.groupBy({ by: ["paperNo"], _count: true }),
    db.dmQuestionItem.count(),
  ]);
  const countByPaper = new Map(counts.map((c) => [c.paperNo, c._count]));

  return (
    <div>
      <PageHeader
        title="DM/DrNB"
        subtitle="Every question sourced from the actual D.M. — Neonatology exit exam papers (2011-2025) — choose a paper, or browse everything by priority."
      />
      <div className="p-8 grid sm:grid-cols-3 gap-4 max-w-4xl">
        {[1, 2, 3, 4].map((paperNo) => (
          <HubCard
            key={paperNo}
            href={`/dm-drnb/paper/${paperNo}`}
            icon={FileText}
            title={PAPER_LABEL[paperNo]}
            count={`${(countByPaper.get(paperNo) ?? 0) * 12} questions`}
          />
        ))}
        <HubCard href="/dm-drnb/browse" icon={Layers} title="Browse by Priority" count={`${totalItems} questions`} />
      </div>
    </div>
  );
}
