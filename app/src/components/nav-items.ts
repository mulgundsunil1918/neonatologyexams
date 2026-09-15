import {
  LayoutDashboard,
  GraduationCap,
  Stethoscope,
  ClipboardList,
  Library,
  RefreshCw,
  Bookmark,
  NotebookPen,
  BarChart3,
  HeartPulse,
} from "lucide-react";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/nnf-iap", label: "NNF/IAP Fellowship", icon: GraduationCap },
  { href: "/dm-drnb", label: "DM/DrNB", icon: Stethoscope },
  { href: "/nrp", label: "NRP 9th Edition", icon: HeartPulse },
  { href: "/cases", label: "Clinical Cases", icon: ClipboardList },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/revision", label: "Revision", icon: RefreshCw },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;
