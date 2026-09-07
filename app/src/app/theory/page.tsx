import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function TheoryPage() {
  const questions = await db.masterQuestion.findMany({
    where: { paperType: "THEORY" },
    orderBy: { id: "asc" },
    include: {
      occurrences: { include: { paper: { include: { sitting: true } } }, orderBy: { paper: { sittingId: "asc" } } },
      subParts: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <div>
      <PageHeader
        title="Theory &amp; Short Notes"
        subtitle={`${questions.length} essay questions, organized by paper. High-yield tagging and expected-answer-structure scaffolding is a follow-on pass.`}
      />
      <div className="divide-y divide-border">
        {questions.map((q) => {
          const first = q.occurrences[0];
          return (
            <Link key={q.id} href={`/mcq/${q.id}`} className="flex items-start gap-4 px-8 py-4 hover:bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug line-clamp-2">{q.stem || q.subParts[0]?.text}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground font-mono">
                  {first && <span>{first.paper.sittingId} · P{first.paper.paperNo} · Q{first.originalQnum}</span>}
                  {q.occurrences.length > 1 && <span className="text-tier-orange">repeated {q.occurrences.length}×</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
