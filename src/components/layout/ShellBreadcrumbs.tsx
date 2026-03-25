import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface ShellBreadcrumbsProps {
  root: { label: string; href: string };
  segments?: BreadcrumbSegment[];
  /** Legacy string like " / Foo / Bar" — parsed into segments automatically */
  legacyString?: string;
}

export default function ShellBreadcrumbs({ root, segments, legacyString }: ShellBreadcrumbsProps) {
  const segs: BreadcrumbSegment[] = segments ?? parseLegacy(legacyString);

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground truncate min-w-0">
      <Link to={root.href} className="hover:text-foreground transition-colors shrink-0">
        {root.label}
      </Link>
      {segs.map((seg, i) => (
        <span key={i} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          {seg.href ? (
            <Link to={seg.href} className="hover:text-foreground transition-colors truncate">
              {seg.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate">{seg.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function parseLegacy(str?: string): BreadcrumbSegment[] {
  if (!str) return [];
  return str
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({ label }));
}
