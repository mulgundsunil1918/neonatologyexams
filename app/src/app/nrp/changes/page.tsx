import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { toneClasses } from "@/lib/confidence-ui";
import { Star } from "lucide-react";

// Always reflect live DB state — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function NrpChangesPage() {
  const changes = await db.nrpChange.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <BackLink href="/nrp">NRP 9th Edition</BackLink>
      </div>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-1">8th vs 9th Edition — What Changed</h1>
      <span className={"inline-block mt-1 mb-6 text-[11px] font-mono px-2 py-0.5 rounded-full border " + toneClasses("external")}>
        External/current verification — AAP/NRP 9th edition (released Oct 2025), not from your uploaded resources
      </span>

      <div className="space-y-5">
        {changes.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-serif font-semibold text-base">{c.topic}</h2>
              {c.highYield && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-tier-red/30 bg-tier-red-bg text-tier-red">
                  <Star className="size-3" /> high yield
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">8th edition</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.eighthEd}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-good mb-1">9th edition</div>
                <p className="text-sm leading-relaxed">{c.ninthEd}</p>
              </div>
            </div>
            {c.whyItMatters && (
              <p className="text-xs text-muted-foreground italic mt-3 pt-3 border-t border-border">{c.whyItMatters}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
