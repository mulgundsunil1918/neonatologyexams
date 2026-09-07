"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAV } from "./nav-items";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 border-b border-border bg-background/95 backdrop-blur">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Open menu">
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground border-sidebar-border p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="px-5 py-5 border-b border-sidebar-border">
            <div className="font-serif text-lg font-semibold leading-tight">NNF Fellowship</div>
            <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60 mt-0.5">Study Platform</div>
          </div>
          <nav className="py-3 px-2 space-y-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <span className="font-serif font-semibold text-sm">NNF Fellowship</span>
    </div>
  );
}
