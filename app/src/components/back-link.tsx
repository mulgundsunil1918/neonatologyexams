import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// A visibly-styled "back" navigation link (bordered button, not faint text) — used consistently
// across the nested NNF/IAP Fellowship hierarchy and question detail pages so a reader always has
// an obvious way back up a level.
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={buttonVariants({ variant: "outline", size: "sm" }) + " shrink-0"}>
      <ArrowLeft className="size-3.5" />
      {children}
    </Link>
  );
}
