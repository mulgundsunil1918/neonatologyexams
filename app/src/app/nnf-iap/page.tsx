import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ListChecks, BookOpen, FileText, ChevronRight } from "lucide-react";

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

function HubCard({ href, icon: Icon, title, count }: { href: string; icon: React.ComponentType<{ className?: string }>; title: string; count: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 hover:border-primary/40 transition-colors"
    >
      <Icon className="size-6 text-primary" />
      <div>
        <div className="font-serif font-semibold text-base flex items-center gap-1">
          {title}
          <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </div>
        <div className="text-xs font-mono text-muted-foreground mt-0.5">{count}</div>
      </div>
    </Link>
  );
}
