import { Link, useLocation } from "react-router-dom";
import { Scan, Package } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const options = [
  { href: "/scan-room", label: "AI Scan", icon: Scan },
  { href: "/online-estimate", label: "Manual Builder", icon: Package },
] as const;

export default function EstimatorNavToggle() {
  const { pathname } = useLocation();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
        {options.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  to={href}
                  className={`
                    flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200
                    ${active
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
