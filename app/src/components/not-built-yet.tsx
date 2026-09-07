import { PageHeader } from "@/components/page-header";
import { Construction } from "lucide-react";

export function NotBuiltYet({ title, subtitle, reason }: { title: string; subtitle: string; reason: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="max-w-lg mx-auto text-center py-20 px-8">
        <Construction className="size-8 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">{reason}</p>
      </div>
    </div>
  );
}
