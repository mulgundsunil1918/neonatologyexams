import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Shared by every qualification's top-level hub (/nnf-iap, /dm-drnb, ...) so they stay
// visually identical — a clean icon + title + one count line, no extra copy on the card
// face itself (the destination page's own header carries the fuller description).
export function HubCard({
  href,
  icon: Icon,
  title,
  count,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: string;
}) {
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
