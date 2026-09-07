import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { ChooserCard } from "@/components/chooser-card";
import { GitCompareArrows, ListChecks } from "lucide-react";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function NrpHubPage() {
  const [changeCount, questionCount] = await Promise.all([
    db.nrpChange.count(),
    db.nrpQuestion.count(),
  ]);

  return (
    <div>
      <PageHeader
        title="NRP 9th Edition"
        subtitle="Externally sourced from AAP/NRP 9th edition official materials (released Oct 2025) — not from your uploaded resources, which contain no NRP source document. Separate from the NNF/IAP Fellowship question bank."
      />
      <div className="p-8 grid sm:grid-cols-2 gap-4 max-w-2xl">
        <ChooserCard href="/nrp/changes" icon={GitCompareArrows} title="8th vs 9th: What Changed" desc={`${changeCount} high-yield changes, side by side`} />
        <ChooserCard href="/nrp/mcq" icon={ListChecks} title="Algorithm MCQs" desc={`${questionCount} practice questions`} />
      </div>
    </div>
  );
}
