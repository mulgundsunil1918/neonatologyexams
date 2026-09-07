import { db } from "@/lib/db";
import { DEFAULT_USER_ID, TIER_META, type Tier } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { TierBadge } from "@/components/tier-badge";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [totalQuestions, systems, attempts] = await Promise.all([
    db.masterQuestion.count(),
    db.system.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { primaryQuestions: true } } },
    }),
    db.attempt.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: { masterQuestion: { select: { repetitionTier: true, primarySystemId: true } } },
    }),
  ]);

  const attemptedIds = new Set(attempts.map((a) => a.masterQuestionId));
  const correct = attempts.filter((a) => a.isCorrect).length;
  const incorrect = attempts.filter((a) => a.isCorrect === false).length;
  const gradable = correct + incorrect; // excludes attempts with no source-confirmed answer to grade against
  const attemptedCount = attemptedIds.size;
  const accuracy = gradable ? Math.round((correct / gradable) * 100) : 0;

  const tierTotals = await db.masterQuestion.groupBy({ by: ["repetitionTier"], _count: true });
  const tierTotalMap = Object.fromEntries(tierTotals.map((t) => [t.repetitionTier, t._count])) as Record<string, number>;
  const tierAttemptedMap: Record<string, Set<string>> = { RED: new Set(), ORANGE: new Set(), YELLOW: new Set(), WHITE: new Set() };
  for (const a of attempts) {
    tierAttemptedMap[a.masterQuestion.repetitionTier]?.add(a.masterQuestionId);
  }

  const systemPerf = systems.map((s) => {
    const sAttempts = attempts.filter((a) => a.masterQuestion.primarySystemId === s.id);
    const sCorrect = sAttempts.filter((a) => a.isCorrect).length;
    const sGradable = sAttempts.filter((a) => a.isCorrect !== null).length;
    return {
      id: s.id,
      name: s.name,
      total: s._count.primaryQuestions,
      attempted: new Set(sAttempts.map((a) => a.masterQuestionId)).size,
      accuracy: sGradable ? Math.round((sCorrect / sGradable) * 100) : null,
    };
  }).filter((s) => s.total > 0);

  const weakAreas = systemPerf
    .filter((s) => s.accuracy !== null && s.attempted >= 3)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your progress across the NNF Fellowship question bank."
      />
      <div className="p-8 space-y-10">
        {/* Top stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
          <Stat label="Total questions" value={`${attemptedCount} / ${totalQuestions}`} sub="attempted / total" />
          <Stat label="Correct" value={String(correct)} sub={`of ${attempts.length} attempts`} />
          <Stat label="Incorrect" value={String(incorrect)} sub={`of ${attempts.length} attempts`} />
          <Stat label="Accuracy" value={gradable ? `${accuracy}%` : "—"} sub={gradable ? "overall" : "no gradable attempts yet"} />
        </div>

        {/* Tier completion */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Repetition-tier completion
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(TIER_META) as Tier[]).map((tier) => {
              const total = tierTotalMap[tier] ?? 0;
              const done = tierAttemptedMap[tier]?.size ?? 0;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <Card key={tier} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TierBadge tier={tier} />
                    <span className="font-mono text-xs text-muted-foreground">{done}/{total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">{pct}% complete</div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* System performance */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            System performance
          </h2>
          <div className="grid md:grid-cols-2 gap-2">
            {systemPerf.map((s) => (
              <Link
                key={s.id}
                href={`/mcq?system=${s.id}`}
                className="flex items-center justify-between px-4 py-2.5 rounded-md border border-border bg-card hover:border-primary/40 transition-colors text-sm"
              >
                <span className="font-medium">{s.name}</span>
                <span className="flex items-center gap-3 text-muted-foreground font-mono text-xs">
                  <span>{s.attempted}/{s.total}</span>
                  <span className={s.accuracy === null ? "" : s.accuracy >= 70 ? "text-good" : s.accuracy >= 40 ? "text-tier-orange" : "text-bad"}>
                    {s.accuracy === null ? "—" : `${s.accuracy}%`}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {weakAreas.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Weak areas</h2>
            <ol className="space-y-1.5 list-decimal list-inside text-sm">
              {weakAreas.map((s) => (
                <li key={s.id}>
                  <Link href={`/mcq?system=${s.id}`} className="hover:underline">{s.name}</Link>
                  <span className="text-muted-foreground font-mono text-xs ml-2">{s.accuracy}% accuracy</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {attempts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No attempts yet — start with <Link href="/mcq" className="text-primary underline">MCQ Master</Link> or a{" "}
            <Link href="/papers" className="text-primary underline">full paper</Link>.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-card p-5">
      <div className="text-2xl font-mono font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      <div className="text-[11px] text-muted-foreground/70">{sub}</div>
    </div>
  );
}
