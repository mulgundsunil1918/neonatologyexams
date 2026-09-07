"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useState } from "react";

type SystemOpt = { id: string; name: string };
type SittingOpt = { id: string; label: string };

export function FilterBar({ systems, sittings }: { systems: SystemOpt[]; sittings: SittingOpt[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Controlled local state for the text search box — the Base UI Input primitive warns
  // (correctly) if you drive it with `defaultValue` while the surrounding page re-renders
  // with a new value on every filter change. Sync from the URL only on the initial mount
  // and on external navigation (e.g. browser back), not on every keystroke.
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  useEffect(() => setQ(searchParams.get("q") ?? ""), [searchParams]);

  const set = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="px-8 py-4 border-b border-border bg-muted/30">
      <p className="text-xs text-muted-foreground mb-2.5">
        Narrow the list below, or combine filters — e.g. Red + Ventilation for the must-memorize ventilator questions.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search">
          <Input
            placeholder="Question text…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && set("q", q)}
            className="w-52 h-8 text-sm"
          />
        </Field>
        <Field label="Priority">
          <Select value={searchParams.get("tier") ?? "all"} onValueChange={(v) => set("tier", v ?? "all")}>
            <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="RED">🔴 Red</SelectItem>
              <SelectItem value="ORANGE">🟠 Orange</SelectItem>
              <SelectItem value="YELLOW">🟡 Yellow</SelectItem>
              <SelectItem value="WHITE">⚪ White</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="System">
          <Select value={searchParams.get("system") ?? "all"} onValueChange={(v) => set("system", v ?? "all")}>
            <SelectTrigger className="h-8 w-[160px] text-sm"><SelectValue placeholder="System" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All systems</SelectItem>
              {systems.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sitting">
          <Select value={searchParams.get("sitting") ?? "all"} onValueChange={(v) => set("sitting", v ?? "all")}>
            <SelectTrigger className="h-8 w-[150px] text-sm"><SelectValue placeholder="Sitting" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sittings</SelectItem>
              {sittings.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={searchParams.get("attempted") ?? "all"} onValueChange={(v) => set("attempted", v ?? "all")}>
            <SelectTrigger className="h-8 w-[140px] text-sm"><SelectValue placeholder="Attempted" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="yes">Attempted</SelectItem>
              <SelectItem value="no">Unattempted</SelectItem>
              <SelectItem value="incorrect">Incorrect</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Type">
          <Select value={searchParams.get("image") ?? "all"} onValueChange={(v) => set("image", v ?? "all")}>
            <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue placeholder="Image" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="yes">Image-based</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[10.5px] uppercase tracking-wide text-muted-foreground/80">{label}</Label>
      {children}
    </div>
  );
}
