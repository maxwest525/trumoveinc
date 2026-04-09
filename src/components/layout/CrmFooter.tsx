import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function CrmFooter() {
  return (
    <footer className="border-t border-border/40 py-2.5 px-4 flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">TruMove CRM</span>
      <Link
        to="/site/blog"
        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        Blog
      </Link>
    </footer>
  );
}
