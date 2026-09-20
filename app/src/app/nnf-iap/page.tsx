import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { HubCard } from "@/components/hub-card";
import { ListChecks, BookOpen, FileText } from "lucide-react";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function NnfIapHubPage() {
  const [mcqCount, theoryCount, paperCount] = await Promise.all([
    db.masterQuestion.count({ where: { paperType: "MCQ" } }),
    db.masterQuestion.count({ where: { paperType: "THEORY" } }),
    db.paper.count(),
  ]);

  return (
    <div>
      <PageHeader
        title="NNF/IAP Fellowship"
        subtitle="Every question sourced from the actual NNF/IAP Fellowship exam papers — choose how you want to study them."
      />
      <div className="p-8 grid sm:grid-cols-3 gap-4 max-w-4xl">
        <HubCard href="/nnf-iap/mcq" icon={ListChecks} title="MCQ" count={`${mcqCount} questions`} />
        <HubCard href="/nnf-iap/theory" icon={BookOpen} title="Theory" count={`${theoryCount} questions`} />
        <HubCard href="/papers" icon={FileText} title="Question Papers" count={`${paperCount} papers`} />
      </div>
    </div>
  );
}
