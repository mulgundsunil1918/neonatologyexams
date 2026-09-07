import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function ChooserCard({ href, icon: Icon, title, desc }: { href: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
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
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </div>
    </Link>
  );
}
