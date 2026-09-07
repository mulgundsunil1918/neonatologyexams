import { PageHeader } from "@/components/page-header";
import { ChooserCard } from "@/components/chooser-card";
import { BackLink } from "@/components/back-link";
import Link from "next/link";
import { CalendarDays, Stethoscope } from "lucide-react";

export default function McqChooserPage() {
  return (
    <div>
      <PageHeader
        title="MCQ"
        subtitle="Pick how you want to browse the MCQ bank."
        right={<BackLink href="/nnf-iap">NNF/IAP Fellowship</BackLink>}
      />
      <div className="p-8 grid sm:grid-cols-2 gap-4 max-w-2xl">
        <ChooserCard href="/nnf-iap/mcq/year" icon={CalendarDays} title="Year-wise" desc="Browse by exam sitting (e.g. October 2019, April 2022)." />
        <ChooserCard href="/nnf-iap/mcq/system" icon={Stethoscope} title="System-wise" desc="Browse by one of the 24 syllabus systems." />
      </div>
      <p className="px-8 pb-8 text-xs text-muted-foreground">
        Or <Link href="/mcq" className="text-primary hover:underline">browse the full bank with all filters</Link>.
      </p>
    </div>
  );
}
