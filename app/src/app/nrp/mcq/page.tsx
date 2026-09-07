import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { toneClasses } from "@/lib/confidence-ui";
import Link from "next/link";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function NrpMcqListPage() {
  const questions = await db.nrpQuestion.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <PageHeader
        title="NRP Algorithm MCQs"
        subtitle={`${questions.length} practice questions on the 9th edition resuscitation algorithm.`}
        right={<BackLink href="/nrp">NRP 9th Edition</BackLink>}
      />
      <div className="px-8 pt-4">
        <span className={"inline-block text-[11px] font-mono px-2 py-0.5 rounded-full border " + toneClasses("external")}>
          External/current verification — not from your uploaded resources
        </span>
      </div>
      <div className="divide-y divide-border mt-4">
        {questions.map((q) => (
          <Link key={q.id} href={`/nrp/mcq/${q.id}`} className="flex items-start gap-4 px-8 py-4 hover:bg-muted/40">
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug line-clamp-2">{q.stem}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground font-mono">
                <span>{q.topic}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
