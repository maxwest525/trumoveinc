import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Monitor, Phone, Globe, Rocket, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface AgentToolLauncherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOOLS = [
  { key: "granot", label: "Granot CRM", icon: Monitor, url: "https://granot.co/login" },
  { key: "convoso", label: "Convoso Dialer", icon: Phone, url: "https://login.convoso.com" },
  { key: "website", label: "TruMove Website", icon: Globe, url: "/site", internal: true },
];

const TRUDY_ASK = "Hey! Want me to grab you a coffee before you start?";

const TRUDY_YES_RESPONSES = [
  "Oh sweetie, I'm literally a bunch of code. I can't even hold a mug!",
  "Hahahaha you really asked an AI for coffee? I don't even have hands!",
  "Sure! Let me just… oh wait. I'm software. Nice try though.",
  "I would LOVE to, but I exist inside a server rack. Rain check?",
];

const TRUDY_NO_RESPONSE = "Fine. More for nobody, I guess.";

async function playTrudySpeech(text: string): Promise<void> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) throw new Error("TTS failed");

    const data = await response.json();
    const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (err) {
    console.warn("Trudy TTS unavailable:", err);
  }
}

export default function AgentToolLauncherModal({ open, onOpenChange }: AgentToolLauncherModalProps) {
  const navigate = useNavigate();
  const [trudyState, setTrudyState] = useState<"ask" | "response">("ask");
  const [trudyMsg, setTrudyMsg] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasSpokenRef = useRef(false);

  // Trudy asks the coffee question out loud when modal opens
  useEffect(() => {
    if (open && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      setIsSpeaking(true);
      playTrudySpeech(TRUDY_ASK).finally(() => setIsSpeaking(false));
    }
  }, [open]);

  const handleCoffeeYes = useCallback(async () => {
    const msg = TRUDY_YES_RESPONSES[Math.floor(Math.random() * TRUDY_YES_RESPONSES.length)];
    setTrudyMsg(msg);
    setTrudyState("response");
    setIsSpeaking(true);
    await playTrudySpeech(msg);
    setIsSpeaking(false);
  }, []);

  const handleCoffeeNo = useCallback(async () => {
    setTrudyMsg(TRUDY_NO_RESPONSE);
    setTrudyState("response");
    setIsSpeaking(true);
    await playTrudySpeech(TRUDY_NO_RESPONSE);
    setIsSpeaking(false);
  }, []);

  const handleLaunchAll = () => {
    const sw = window.screen.availWidth;
    const sh = window.screen.availHeight;
    const sl = (window.screen as any).availLeft ?? 0;
    const st = (window.screen as any).availTop ?? 0;
    const count = TOOLS.length;
    const w = Math.floor(sw / count);

    TOOLS.forEach((tool, i) => {
      const url = tool.internal ? window.location.origin + tool.url : tool.url;
      window.open(
        url,
        `tool_${tool.key}`,
        `left=${sl + i * w},top=${st},width=${w},height=${sh},menubar=no,toolbar=no,location=yes,status=no`
      );
    });

    onOpenChange(false);
  };

  const handleGoToDashboard = () => {
    onOpenChange(false);
    navigate("/agent/dashboard");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setTrudyState("ask");
        setTrudyMsg("");
        hasSpokenRef.current = false;
      }, 300);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden border-border rounded-2xl">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-base font-bold text-foreground">Ready to work?</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Opens Granot, Convoso & Website side-by-side across your screen.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-3">
          <div className="flex flex-col gap-1.5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.key} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{tool.label}</span>
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleLaunchAll}
            className="w-full h-11 rounded-xl gap-2 font-semibold"
            size="lg"
          >
            <Rocket className="h-4 w-4" />
            Launch All
          </Button>
        </div>

        {/* Trudy coffee bit — with voice */}
        <div className="border-t border-border px-6 py-3">
          <AnimatePresence mode="wait">
            {trudyState === "ask" ? (
              <motion.div
                key="ask"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center justify-between gap-2"
              >
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  {isSpeaking && <Volume2 className="h-3 w-3 text-primary animate-pulse shrink-0" />}
                  <span>
                    <span className="font-semibold text-foreground">Trudy:</span> Want me to grab you a coffee? ☕
                  </span>
                </p>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={handleCoffeeYes}
                    className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors px-2 py-0.5 rounded-md hover:bg-primary/5"
                  >
                    Yes please!
                  </button>
                  <button
                    onClick={handleCoffeeNo}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-md hover:bg-muted/50"
                  >
                    Nah
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="response"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-[11px] text-muted-foreground leading-relaxed flex items-center justify-center gap-1.5">
                  {isSpeaking && <Volume2 className="h-3 w-3 text-primary animate-pulse shrink-0" />}
                  <span>
                    <span className="font-semibold text-foreground">Trudy:</span> {trudyMsg}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-border px-6 py-2.5 text-center">
          <button
            onClick={handleGoToDashboard}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Go to Dashboard →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
