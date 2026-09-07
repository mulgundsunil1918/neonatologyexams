import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { PaperRunner } from "./paper-runner";
import { notFound } from "next/navigation";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function PaperPage({ params }: PageProps<"/papers/[sittingId]/[paperNo]">) {
  const { sittingId, paperNo } = await params;

  const paper = await db.paper.findUnique({
    where: { sittingId_paperNo: { sittingId, paperNo: parseInt(paperNo, 10) } },
    include: {
      sitting: true,
      occurrences: {
        orderBy: { originalQnum: "asc" },
        include: {
          masterQuestion: {
            include: {
              options: { orderBy: { sortOrder: "asc" } },
              subParts: { orderBy: { sortOrder: "asc" } },
              answer: true,
            },
          },
        },
      },
    },
  });
  if (!paper) notFound();

  return (
    <div>
      <PageHeader
        title={`${paper.sitting.label} — Paper ${paper.paperNo}`}
        subtitle={`${paper.paperType === "MCQ" ? "Multiple choice" : "Theory / essay"} · original sequence, original numbering · pages ${paper.pageStart}–${paper.pageEnd} of the source QBank`}
        right={<Link href="/papers" className="text-xs text-muted-foreground hover:text-foreground shrink-0">← All papers</Link>}
      />
      <div className="max-w-3xl mx-auto px-8 py-8">
        {paper.paperType === "MCQ" ? (
          <PaperRunner
            paperId={paper.id}
            questions={paper.occurrences.map((o) => ({
              id: o.masterQuestion.id,
              originalQnum: o.originalQnum,
              stem: o.masterQuestion.stem,
              repetitionTier: o.masterQuestion.repetitionTier,
              options: o.masterQuestion.options,
              correctLetter: o.masterQuestion.answer?.correctLetter ?? null,
            }))}
          />
        ) : (
          <div className="space-y-8">
            {paper.occurrences.map((o) => (
              <div key={o.id} className="pb-8 border-b border-border last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-semibold text-muted-foreground">Q{o.originalQnum}</span>
                </div>
                <p className="text-sm leading-relaxed mb-3">{o.masterQuestion.stem}</p>
                <div className="space-y-2">
                  {o.masterQuestion.subParts.map((sp) => (
                    <div key={sp.id} className="text-sm flex gap-2">
                      <span className="font-mono font-semibold text-muted-foreground shrink-0">{sp.label})</span>
                      <span>{sp.text} {sp.marks && <span className="text-muted-foreground font-mono text-xs">({sp.marks})</span>}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
