import { db } from "@/lib/db";
import { toneClasses } from "@/lib/confidence-ui";
import { BackLink } from "@/components/back-link";
import { MarkdownBody } from "@/components/markdown-body";
import { NrpQuestionAttempt } from "./nrp-question-attempt";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function NrpQuestionPage({ params }: PageProps<"/nrp/mcq/[id]">) {
  const { id } = await params;

  const [question, sequence] = await Promise.all([
    db.nrpQuestion.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } }, answer: true, explanation: true },
    }),
    db.nrpQuestion.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true } }),
  ]);
  if (!question || !question.answer) notFound();

  const idx = sequence.findIndex((q) => q.id === id);
  const prevId = idx > 0 ? sequence[idx - 1].id : null;
  const nextId = idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1].id : null;

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <BackLink href="/nrp/mcq">Back to NRP MCQs</BackLink>
        <div className="flex items-center gap-2">
          {prevId ? (
            <Link href={`/nrp/mcq/${prevId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>← Previous</Link>
          ) : (
            <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}>← Previous</span>
          )}
          {nextId ? (
            <Link href={`/nrp/mcq/${nextId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Next <ArrowRight className="size-3.5" /></Link>
          ) : (
            <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}>Next <ArrowRight className="size-3.5" /></span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 mb-1 flex-wrap">
        <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-border text-muted-foreground">{question.topic}</span>
      </div>

      <h1 className="text-lg leading-relaxed text-foreground font-medium mb-1 mt-3">{question.stem}</h1>

      <NrpQuestionAttempt options={question.options} correctLetter={question.answer.correctLetter} />

      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Explanation</div>
          <span className={"inline-block mb-2 text-[11px] font-mono px-2 py-0.5 rounded-full border " + toneClasses("external")}>
            External/current verification — not from your uploaded resources
          </span>
          {question.explanation?.body && <MarkdownBody>{question.explanation.body}</MarkdownBody>}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        {nextId ? (
          <Link href={`/nrp/mcq/${nextId}`} className={buttonVariants({ variant: "default", size: "default" })}>
            Next question <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span className={buttonVariants({ variant: "outline", size: "default" }) + " opacity-40 pointer-events-none"}>
            End of list
          </span>
        )}
      </div>
    </div>
  );
}
