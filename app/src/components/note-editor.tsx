"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveNote } from "@/app/note-actions";
import { NotebookPen } from "lucide-react";

export function NoteEditor({ masterQuestionId, initialBody }: { masterQuestionId: string; initialBody: string }) {
  const [body, setBody] = useState(initialBody);
  const [saved, setSaved] = useState(true);
  const [pending, startTransition] = useTransition();

  function handleChange(value: string) {
    setBody(value);
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await saveNote(masterQuestionId, body);
      setSaved(true);
    });
  }

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        <NotebookPen className="size-3.5" />
        My note
      </div>
      <textarea
        value={body}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Anything worth remembering about this one — a mnemonic, a source you trust more, a mistake you keep making…"
        rows={3}
        className="w-full rounded-md border border-input bg-background text-sm p-3 leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/70"
      />
      <div className="flex items-center gap-2 mt-2">
        <Button size="sm" variant="outline" onClick={handleSave} disabled={pending || saved}>
          {pending ? "Saving…" : saved ? "Saved" : "Save note"}
        </Button>
        {!saved && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
      </div>
    </div>
  );
}
