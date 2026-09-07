import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";

// Always reflect live DB state (attempts, bookmarks) — never statically cache this page.
export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const notes = await db.note.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { updatedAt: "desc" },
    include: { masterQuestion: { select: { stem: true } } },
  });

  return (
    <div>
      <PageHeader title="Notes" subtitle="Personal notes attached to questions." />
      <div className="p-8">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No notes yet. Adding a note from a question page isn't wired up in this first pass — the data model is ready (see Note in the schema), the editor UI is next.
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <Link key={n.id} href={`/mcq/${n.masterQuestionId}`} className="block p-4 rounded-lg border border-border hover:border-primary/40">
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{n.masterQuestion.stem}</p>
                <p className="text-sm">{n.body}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
