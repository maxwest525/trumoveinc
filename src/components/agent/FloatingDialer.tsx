import { useState, useCallback } from "react";
import { Phone, X, Minus, Delete, PhoneCall, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingDialerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KEYS = [
  { label: "1", sub: "" },
  { label: "2", sub: "ABC" },
  { label: "3", sub: "DEF" },
  { label: "4", sub: "GHI" },
  { label: "5", sub: "JKL" },
  { label: "6", sub: "MNO" },
  { label: "7", sub: "PQRS" },
  { label: "8", sub: "TUV" },
  { label: "9", sub: "WXYZ" },
  { label: "*", sub: "" },
  { label: "0", sub: "+" },
  { label: "#", sub: "" },
];

export function FloatingDialer({ open, onOpenChange }: FloatingDialerProps) {
  const [number, setNumber] = useState("");
  const [calling, setCalling] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const handleKey = useCallback((key: string) => {
    setNumber((prev) => prev + key);
  }, []);

  const handleDelete = useCallback(() => {
    setNumber((prev) => prev.slice(0, -1));
  }, []);

  const handleCall = () => {
    if (number.length > 0) setCalling(true);
  };

  const handleHangup = () => {
    setCalling(false);
  };

  if (!open) return null;

  // Minimized: small floating pill showing active call or number
  if (minimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setMinimized(false)}
      >
        {calling ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-foreground">{number || "On Call"}</span>
          </>
        ) : (
          <>
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">Dialer</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Dialer</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(true)}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => { onOpenChange(false); setCalling(false); }}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Number display */}
      <div className="px-4 pt-4 pb-2 text-center min-h-[3.5rem] flex items-center justify-center">
        {calling ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-semibold text-foreground tracking-wider">{number}</span>
            <span className="text-[11px] text-green-600 font-medium animate-pulse">Calling…</span>
          </div>
        ) : (
          <span className={cn(
            "text-xl font-semibold tracking-wider transition-colors",
            number ? "text-foreground" : "text-muted-foreground/40"
          )}>
            {number || "Enter number"}
          </span>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-1.5 px-4 pb-2">
        {KEYS.map((key) => (
          <button
            key={key.label}
            onClick={() => handleKey(key.label)}
            disabled={calling}
            className="flex flex-col items-center justify-center h-12 rounded-xl hover:bg-muted active:bg-muted/70 transition-colors disabled:opacity-40"
          >
            <span className="text-lg font-semibold text-foreground leading-none">{key.label}</span>
            {key.sub && <span className="text-[9px] text-muted-foreground tracking-widest leading-none mt-0.5">{key.sub}</span>}
          </button>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-center gap-3 px-4 pb-4 pt-1">
        {!calling ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleDelete}
              disabled={!number}
            >
              <Delete className="w-4 h-4" />
            </Button>
            <Button
              className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md"
              size="icon"
              onClick={handleCall}
              disabled={!number}
            >
              <PhoneCall className="w-5 h-5" />
            </Button>
            <div className="w-10" />
          </>
        ) : (
          <Button
            className="h-12 w-12 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-md"
            size="icon"
            onClick={handleHangup}
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
