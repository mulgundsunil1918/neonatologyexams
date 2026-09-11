import { db } from "@/lib/db";
import { DEFAULT_USER_ID, CONFIDENCE_META, RESOURCES_ROOT } from "@/lib/constants";
import { toneClasses, SOURCE_RANK } from "@/lib/confidence-ui";
import { buildMcqWhere, currentFilterQueryString } from "@/lib/mcq-filters";
import { TierBadge } from "@/components/tier-badge";
import { TopicBadge } from "@/components/topic-badge";
import { BackLink } from "@/components/back-link";
import { QuestionAttempt } from "./question-attempt";
import { MarkdownBody } from "@/components/markdown-body";
import { getTopicCounts, topicTier } from "@/lib/theory-topics";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageIcon, TableIcon, AlertTriangle, ArrowRight } from "lucide-react";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function McqDetailPage({ params, searchParams }: PageProps<"/mcq/[id]">) {
  const { id } = await params;
  const sp = await searchParams;

  const question = await db.masterQuestion.findUnique({
    where: { id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      subParts: { orderBy: { sortOrder: "asc" } },
      answer: true,
      explanation: true,
      primarySystem: true,
      topic: true,
      sources: { include: { resource: true } },
      occurrences: {
        include: { paper: { include: { sitting: true } } },
        orderBy: [{ paper: { sittingId: "asc" } }],
      },
    },
  });
  if (!question) notFound();

  const [priorAttempt, bookmark, sequence] = await Promise.all([
    db.attempt.findFirst({
      where: { userId: DEFAULT_USER_ID, masterQuestionId: id },
      orderBy: { attemptedAt: "desc" },
      select: { selectedLetter: true, isCorrect: true },
    }),
    db.bookmark.findUnique({ where: { userId_masterQuestionId: { userId: DEFAULT_USER_ID, masterQuestionId: id } } }),
    db.masterQuestion.findMany({
      where: await buildMcqWhere(sp, question.paperType as "MCQ" | "THEORY"),
      orderBy: [{ repetitionTier: "asc" }, { id: "asc" }],
      select: { id: true },
    }),
  ]);

  // Previous/Next within the SAME filtered sequence the reader arrived from (year/system/etc.),
  // so paging through questions never forces a detour back to the list.
  const qs = currentFilterQueryString(sp);
  const idx = sequence.findIndex((q) => q.id === id);
  const prevId = idx > 0 ? sequence[idx - 1].id : null;
  const nextId = idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1].id : null;
  const withQs = (qid: string) => `/mcq/${qid}${qs ? `?${qs}` : ""}`;
  const listHref = question.paperType === "THEORY" ? `/theory${qs ? `?${qs}` : ""}` : `/mcq${qs ? `?${qs}` : ""}`;
  const listLabel = question.paperType === "THEORY" ? "Back to Theory" : "Back to MCQ Master";

  // The answer's OWN confidence status, not the question's general flaw/confidence flag —
  // a question can be a perfectly sound question (SOURCE_CONFIRMED at the question level)
  // while its answer is simply not yet sourced (NOT_FOUND), and the two must never be conflated.
  const answerConfStatus = question.answer?.confidenceStatus ?? "NOT_FOUND";
  const confMeta = CONFIDENCE_META[answerConfStatus] ?? CONFIDENCE_META.NOT_FOUND;

  // Once an answer is known to be externally researched (not in the uploaded books), an
  // unverified keyword-matched "candidate" citation from those same books is actively
  // misleading to show alongside it — it reads as if the books back the answer when they
  // were never confirmed to. Only show sources here that were actually hand-verified.
  const isExternalAnswer = answerConfStatus === "EXTERNAL_VERIFICATION";
  const visibleSources = isExternalAnswer
    ? question.sources.filter((s) => s.confidenceStatus === "SOURCE_CONFIRMED" || s.confidenceStatus === "SOURCE_SUPPORTED")
    : question.sources;

  // Theory-only: how many different Theory papers have touched each sub-part's clinical
  // topic — the concept-level priority signal, since essay questions are almost never worded
  // identically twice the way MCQs sometimes are.
  const topicCounts = question.paperType === "THEORY" ? await getTopicCounts() : null;

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <BackLink href={listHref}>{listLabel}</BackLink>
        <div className="flex items-center gap-2">
          {prevId ? (
            <Link href={withQs(prevId)} className={buttonVariants({ variant: "outline", size: "sm" })}>← Previous</Link>
          ) : (
            <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}>← Previous</span>
          )}
          {nextId ? (
            <Link href={withQs(nextId)} className={buttonVariants({ variant: "outline", size: "sm" })}>Next <ArrowRight className="size-3.5" /></Link>
          ) : (
            <span className={buttonVariants({ variant: "outline", size: "sm" }) + " opacity-40 pointer-events-none"}>Next <ArrowRight className="size-3.5" /></span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 mb-1 flex-wrap">
        <TierBadge tier={question.repetitionTier} />
        {question.primarySystem && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-border text-muted-foreground">
            {question.primarySystem.name}
          </span>
        )}
        {question.hasImage && (
          <span className="text-xs flex items-center gap-1 text-muted-foreground"><ImageIcon className="size-3.5" /> image-based</span>
        )}
        {question.hasTable && (
          <span className="text-xs flex items-center gap-1 text-muted-foreground"><TableIcon className="size-3.5" /> has table</span>
        )}
      </div>

      {question.occurrences[0] && (
        <div className="text-xs font-mono text-muted-foreground mb-4">
          {question.occurrences[0].paper.sitting.label} — Paper {question.occurrences[0].paper.paperNo}, Q{question.occurrences[0].originalQnum}
        </div>
      )}

      <h1 className="text-lg leading-relaxed text-foreground font-medium mb-1">{question.stem}</h1>

      {/* Whole-question Theory essays (no lettered sub-parts) carry their own topic tag */}
      {topicCounts && question.subParts.length === 0 && question.topicTag && (
        <div className="mb-2">
          <TopicBadge
            topic={question.topicTag}
            count={topicCounts.get(question.topicTag) ?? 1}
            tier={topicTier(topicCounts.get(question.topicTag) ?? 1)}
          />
        </div>
      )}

      {question.flawNote && (
        <div className="flex items-start gap-2 mt-3 mb-4 text-xs text-tier-orange bg-tier-orange-bg border border-tier-orange/30 rounded-md px-3 py-2">
          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
          <span>{question.flawNote}</span>
        </div>
      )}

      {question.paperType === "MCQ" ? (
        <QuestionAttempt
          masterQuestionId={question.id}
          options={question.options}
          priorAttempt={priorAttempt ?? null}
          knownAnswer={question.answer?.correctLetter ?? null}
          isBookmarked={!!bookmark}
        />
      ) : (
        <div className="my-5 space-y-3">
          {question.subParts.map((sp) => (
            <div key={sp.id} className="text-sm flex gap-2">
              <span className="font-mono font-semibold text-muted-foreground shrink-0">{sp.label})</span>
              <div className="space-y-1.5">
                <span>{sp.text} {sp.marks && <span className="text-muted-foreground font-mono text-xs">({sp.marks})</span>}</span>
                {topicCounts && sp.topicTag && (
                  <div>
                    <TopicBadge topic={sp.topicTag} count={topicCounts.get(sp.topicTag) ?? 1} tier={topicTier(topicCounts.get(sp.topicTag) ?? 1)} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Answer / confidence status — shown once attempted for MCQ, always for Theory */}
      {(priorAttempt || question.paperType === "THEORY") && (
        <div className="mt-6 pt-6 border-t border-border space-y-4">
          {question.paperType === "MCQ" && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Correct answer</div>
              {question.answer?.correctLetter ? (
                <p className="text-sm font-mono">{question.answer.correctLetter}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not found in uploaded resources yet.</p>
              )}
              <span className={"inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded-full border " + toneClasses(confMeta.tone)}>
                {confMeta.label}
              </span>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              {question.paperType === "THEORY" ? "Model answer" : "Explanation"}
            </div>
            {question.paperType === "THEORY" && question.explanation?.body && (
              <span className={"inline-block mb-2 text-[11px] font-mono px-2 py-0.5 rounded-full border " + toneClasses(confMeta.tone)}>
                {confMeta.label}
              </span>
            )}
            {question.explanation?.body ? (
              <MarkdownBody>{question.explanation.body}</MarkdownBody>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                Not yet ingested from the reference library — explanations are sourced from the textbook/protocol cross-reference pass, which hasn't run for this question yet.
              </p>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Sources</div>
            {visibleSources.length > 0 ? (
              <div className="space-y-2.5">
                {[...visibleSources]
                  .sort((a, b) => SOURCE_RANK[a.confidenceStatus] - SOURCE_RANK[b.confidenceStatus] || (a.role === "primary" ? -1 : 1))
                  .map((s) => {
                    const meta = CONFIDENCE_META[s.confidenceStatus] ?? CONFIDENCE_META.NOT_FOUND;
                    const fileHref = `file://${RESOURCES_ROOT}/${encodeURIComponent(s.resource.fileName)}#page=${s.pageRef}`;
                    return (
                      <div key={s.id} className="rounded-md border border-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <a href={fileHref} className="font-medium text-sm hover:underline hover:text-primary" title="Open the original PDF at this page (works when opened on the machine holding the source library)">
                              {s.resource.title}
                            </a>
                            {s.chapter && <div className="text-xs text-muted-foreground mt-0.5">{s.chapter}</div>}
                          </div>
                          <span className="text-xs font-mono text-muted-foreground shrink-0">p.{s.pageRef}</span>
                        </div>
                        {s.matchedSnippet && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">&ldquo;{s.matchedSnippet}&hellip;&rdquo;</p>
                        )}
                        <span className={"inline-block mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full border " + toneClasses(meta.tone)}>
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : isExternalAnswer ? (
              <p className="text-sm text-muted-foreground italic">Not sourced from the uploaded books — this answer came from external/current verification (see the badge above).</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not found in uploaded resources yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Repetition / occurrences */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Repeated {question.occurrences.length} time{question.occurrences.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap gap-2">
          {question.occurrences.map((o) => (
            <Link
              key={o.id}
              href={`/papers/${o.paper.sittingId}/${o.paper.paperNo}`}
              className="text-xs font-mono px-2 py-1 rounded-md border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
            >
              {o.paper.sittingId} · P{o.paper.paperNo} · Q{o.originalQnum}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        {nextId ? (
          <Link href={withQs(nextId)} className={buttonVariants({ variant: "default", size: "default" })}>
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
