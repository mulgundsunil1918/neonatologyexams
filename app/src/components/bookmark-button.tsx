"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleBookmark } from "@/app/bookmark-actions";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function BookmarkButton({
  masterQuestionId,
  isBookmarked,
  variant = "full",
  className,
  onToggle,
}: {
  masterQuestionId: string;
  isBookmarked: boolean;
  /** "full" = icon + label (question detail pages). "icon" = icon only, for compact list rows. */
  variant?: "full" | "icon";
  className?: string;
  /** Fires after the toggle is sent, with the new state — e.g. so a list can drop the row. */
  onToggle?: (bookmarked: boolean) => void;
}) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(() => toggleBookmark(masterQuestionId, next ? "important" : null));
    onToggle?.(next);
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={pending}
        className={cn("text-muted-foreground hover:text-foreground shrink-0", className)}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
      >
        {bookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={pending} className={cn("text-muted-foreground", className)}>
      {bookmarked ? <BookmarkCheck className="size-4 mr-1.5" /> : <Bookmark className="size-4 mr-1.5" />}
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
