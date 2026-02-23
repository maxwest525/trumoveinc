import { useState } from "react";
import { Zap, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type AutomationMode = 'autopilot' | 'review';

interface AutomationModeSelectorProps {
  onChange?: (mode: AutomationMode) => void;
  defaultMode?: AutomationMode;
}

export function AutomationModeSelector({ onChange, defaultMode = 'review' }: AutomationModeSelectorProps) {
  const [mode, setMode] = useState<AutomationMode>(defaultMode);

  const select = (m: AutomationMode) => {
    setMode(m);
    onChange?.(m);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-muted/30">
      <button
        onClick={() => select('autopilot')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
          mode === 'autopilot'
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Zap className="w-3.5 h-3.5" />
        Autopilot
      </button>
      <button
        onClick={() => select('review')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
          mode === 'review'
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Eye className="w-3.5 h-3.5" />
        Review First
      </button>
    </div>
  );
}
