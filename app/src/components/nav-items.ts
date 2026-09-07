import {
  LayoutDashboard,
  ListChecks,
  FileText,
  Stethoscope,
  BookOpen,
  ClipboardList,
  Library,
  RefreshCw,
  Bookmark,
  NotebookPen,
  BarChart3,
} from "lucide-react";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mcq", label: "MCQs", icon: ListChecks },
  { href: "/papers", label: "Papers", icon: FileText },
  { href: "/systems", label: "Systems", icon: Stethoscope },
  { href: "/theory", label: "Theory", icon: BookOpen },
  { href: "/cases", label: "Clinical Cases", icon: ClipboardList },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/revision", label: "Revision", icon: RefreshCw },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;
