import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sun, CheckCircle2, AlertTriangle, AlertCircle, ChevronLeft, ChevronRight,
  Play, RotateCcw, X, Zap, Megaphone, FileText, Search, FlaskConical, Users, Settings,
  Clock, ArrowRight, SkipForward
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useImplementationQueue } from "@/contexts/ImplementationQueueContext";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────
type StepStatus = "good" | "attention" | "action_required";
type StepResult = "good" | "action" | "skipped" | null;

interface ReviewStep {
  id: string;
  title: string;
  categoryLabel: string;
  categoryIcon: React.ElementType;
  categoryColor: string;
  badgeBg: string;
  description: string;
  getPreview: () => string;
  getStatus: () => StepStatus;
  actionRoute: string;
}

// ─── Persistence ────────────────────────────────────────────────────────────
const STORAGE_KEY = "truemove_daily_review";

interface ReviewState {
  date: string;
  completedAt: string | null;
  startedAt: string | null;
  results: Record<string, StepResult>;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState(): ReviewState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ReviewState;
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), completedAt: null, startedAt: null, results: {} };
}

function saveState(state: ReviewState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function DailyMarketingReview({ activityLog }: { activityLog: { section: string; last_updated: string; label: string }[] }) {
  const navigate = useNavigate();
  const { changes } = useImplementationQueue();
  const [state, setState] = useState<ReviewState>(loadState);
  const [activeStep, setActiveStep] = useState(0);
  const [flowActive, setFlowActive] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  useEffect(() => { saveState(state); }, [state]);

  // ─── Step definitions ───────────────────────────────────────────────────
  const pendingChanges = changes.filter(c => ["pending", "approved", "rolled_back"].includes(c.status));
  const criticalCount = pendingChanges.filter(c => c.status === "rolled_back").length;

  const steps = useMemo<ReviewStep[]>(() => [
    {
      id: "action-items",
      title: "Action Items",
      categoryLabel: "Priority",
      categoryIcon: Zap,
      categoryColor: "text-red-500",
      badgeBg: "bg-red-500/10 border-red-500/20",
      description: "Review new recommendations and approve high-impact actions.",
      getPreview: () => {
        const total = pendingChanges.length;
        if (total === 0) return "No pending recommendations — all clear.";
        const top = pendingChanges[0]?.title || "N/A";
        return `${total} new recommendation${total > 1 ? "s" : ""} · ${criticalCount} critical · Top: "${top}"`;
      },
      getStatus: () => criticalCount > 0 ? "action_required" : pendingChanges.length > 5 ? "attention" : "good",
      actionRoute: "/marketing/action-items",
    },
    {
      id: "ad-performance",
      title: "Ad Performance",
      categoryLabel: "Spend",
      categoryIcon: Megaphone,
      categoryColor: "text-amber-500",
      badgeBg: "bg-amber-500/10 border-amber-500/20",
      description: "Check ad spend, CPA, and budget pacing.",
      getPreview: () => "Connect Google Ads or Meta to see live metrics",
      getStatus: () => "good",
      actionRoute: "/marketing/advertising",
    },
    {
      id: "content-pipeline",
      title: "Content Pipeline",
      categoryLabel: "Content",
      categoryIcon: FileText,
      categoryColor: "text-blue-500",
      badgeBg: "bg-blue-500/10 border-blue-500/20",
      description: "Check upcoming publishes and review drafts.",
      getPreview: () => "Connect content calendar to see live pipeline",
      getStatus: () => "good",
      actionRoute: "/marketing/content-seo",
    },
    {
      id: "seo-rankings",
      title: "SEO Rankings",
      categoryLabel: "SEO",
      categoryIcon: Search,
      categoryColor: "text-blue-500",
      badgeBg: "bg-blue-500/10 border-blue-500/20",
      description: "Check keyword positions and crawl health.",
      getPreview: () => "Connect Search Console to see live rankings",
      getStatus: () => "good",
      actionRoute: "/marketing/content-seo",
    },
    {
      id: "conversion-lab",
      title: "Conversion Lab",
      categoryLabel: "Tests",
      categoryIcon: FlaskConical,
      categoryColor: "text-emerald-500",
      badgeBg: "bg-emerald-500/10 border-emerald-500/20",
      description: "Review running experiments and conversion rates.",
      getPreview: () => "No active experiments — start one to see live data",
      getStatus: () => "good",
      actionRoute: "/marketing/conversion-lab",
    },
    {
      id: "lead-sources",
      title: "Lead Sources",
      categoryLabel: "Quality",
      categoryIcon: Users,
      categoryColor: "text-purple-500",
      badgeBg: "bg-purple-500/10 border-purple-500/20",
      description: "Check vendor performance and lead quality.",
      getPreview: () => "Connect lead source data to see vendor scorecards",
      getStatus: () => "good",
      actionRoute: "/marketing/lead-sources",
    },
    {
      id: "integrations-health",
      title: "Integrations Health",
      categoryLabel: "System",
      categoryIcon: Settings,
      categoryColor: "text-gray-500",
      badgeBg: "bg-gray-500/10 border-gray-500/20",
      description: "Verify all data sources are syncing.",
      getPreview: () => {
        const staleItems = activityLog.filter(i => {
          const days = Math.floor((Date.now() - new Date(i.last_updated).getTime()) / 86400000);
          return days > 7;
        });
        if (activityLog.length === 0) return "No integrations configured yet";
        if (staleItems.length > 0) return `${staleItems.length} data source${staleItems.length > 1 ? "s" : ""} stale — sync recommended`;
        return `${activityLog.length} sources healthy · All synced recently`;
      },
      getStatus: () => {
        const staleItems = activityLog.filter(i => {
          const days = Math.floor((Date.now() - new Date(i.last_updated).getTime()) / 86400000);
          return days > 7;
        });
        const errorItems = activityLog.filter(i => {
          const days = Math.floor((Date.now() - new Date(i.last_updated).getTime()) / 86400000);
          return days > 30;
        });
        if (errorItems.length > 0) return "action_required";
        if (staleItems.length > 0) return "attention";
        return "good";
      },
      actionRoute: "/marketing/settings",
    },
  ], [pendingChanges, criticalCount, activityLog]);

  // ─── Derived state ──────────────────────────────────────────────────────
  const completedCount = Object.values(state.results).filter(r => r === "good" || r === "action").length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isCompletedToday = !!state.completedAt;

  const goodCount = Object.values(state.results).filter(r => r === "good").length;
  const actionCount = Object.values(state.results).filter(r => r === "action").length;
  const skippedCount = Object.values(state.results).filter(r => r === "skipped").length;

  // ─── Actions ────────────────────────────────────────────────────────────
  const startFlow = useCallback(() => {
    setFlowActive(true);
    setActiveStep(0);
    setDirection(1);
    setState(prev => ({ ...prev, startedAt: new Date().toISOString() }));
  }, []);

  const resetFlow = useCallback(() => {
    const fresh: ReviewState = { date: getTodayKey(), completedAt: null, startedAt: null, results: {} };
    setState(fresh);
    setFlowActive(false);
    setActiveStep(0);
  }, []);

  const markStep = useCallback((result: StepResult) => {
    const step = steps[activeStep];
    setState(prev => ({
      ...prev,
      results: { ...prev.results, [step.id]: result },
    }));

    if (activeStep < totalSteps - 1) {
      setDirection(1);
      setActiveStep(prev => prev + 1);
    } else {
      // Complete
      setState(prev => ({ ...prev, completedAt: new Date().toISOString() }));
      setFlowActive(false);
    }
  }, [activeStep, steps, totalSteps]);

  const goBack = useCallback(() => {
    if (activeStep > 0) {
      setDirection(-1);
      setActiveStep(prev => prev - 1);
    }
  }, [activeStep]);

  const closeFlow = useCallback(() => {
    setFlowActive(false);
  }, []);

  // ─── Last completed display ─────────────────────────────────────────────
  const lastCompletedLabel = useMemo(() => {
    if (state.completedAt) {
      const d = new Date(state.completedAt);
      return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    // Check previous day from storage
    return "Not yet today";
  }, [state.completedAt]);

  const lastCompletedIsToday = !!state.completedAt;

  // ─── Status helpers ─────────────────────────────────────────────────────
  const StatusIcon = ({ status }: { status: StepStatus }) => {
    if (status === "good") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === "attention") return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const StatusLabel = ({ status }: { status: StepStatus }) => {
    if (status === "good") return <span className="text-xs font-medium text-emerald-600">✅ Good</span>;
    if (status === "attention") return <span className="text-xs font-medium text-amber-600">⚠️ Needs Attention</span>;
    return <span className="text-xs font-medium text-red-600">🔴 Action Required</span>;
  };

  // ─── Completion summary ─────────────────────────────────────────────────
  if (isCompletedToday && !flowActive) {
    const durationMs = state.completedAt && state.startedAt
      ? new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()
      : 0;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));
    const actionSteps = steps.filter(s => state.results[s.id] === "action");

    return (
      <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-card overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-emerald-700">Daily Marketing Review Complete</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Completed in {durationMin} minute{durationMin !== 1 ? "s" : ""} · {goodCount} good · {actionCount > 0 ? `${actionCount} action taken` : ""} {skippedCount > 0 ? `· ${skippedCount} skipped` : ""}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={resetFlow}>
              <RotateCcw className="w-3 h-3" /> Run Again
            </Button>
          </div>

          {actionSteps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-emerald-200/50">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Follow-up reminders:</p>
              <div className="space-y-1">
                {actionSteps.map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigate(s.actionRoute)}
                    className="flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {s.title} — review needed
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ─── Active wizard flow ─────────────────────────────────────────────────
  if (flowActive) {
    const step = steps[activeStep];
    const status = step.getStatus();
    const preview = step.getPreview();
    const CatIcon = step.categoryIcon;

    return (
      <Card className="border border-primary/20 overflow-hidden">
        {/* Top progress bar */}
        <div className="h-[3px] bg-muted">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${((activeStep + (state.results[step.id] ? 1 : 0)) / totalSteps) * 100}%` }}
          />
        </div>

        <CardContent className="p-5">
          {/* Step header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground">Step {activeStep + 1} of {totalSteps}</span>
              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${step.categoryColor} ${step.badgeBg}`}>
                <CatIcon className="w-3 h-3 mr-1" />
                {step.categoryLabel}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeFlow}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Step content with slide animation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <h3 className="text-lg font-bold tracking-tight mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

              {/* Live preview box */}
              <div className="rounded-lg border bg-muted/30 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <StatusIcon status={status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{preview}</p>
                    <div className="mt-1.5">
                      <StatusLabel status={status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeStep > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs h-8 gap-1" onClick={goBack}>
                      <ChevronLeft className="w-3 h-3" /> Back
                    </Button>
                  )}
                  <button
                    onClick={() => markStep("skipped")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                  >
                    Skip
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {(status === "attention" || status === "action_required") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => {
                        markStep("action");
                        navigate(step.actionRoute);
                      }}
                    >
                      Take Action <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => markStep("good")}
                  >
                    Looks Good <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  // ─── Entry state (not started) ──────────────────────────────────────────
  return (
    <Card className="border border-primary/20 bg-gradient-to-r from-card to-card/80 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Daily Marketing Review</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalSteps} steps · ~10 minutes · Last completed:{" "}
                <span className={lastCompletedIsToday ? "text-emerald-600" : "text-amber-600"}>
                  {lastCompletedLabel}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2 w-24" />
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                {completedCount} of {totalSteps}
              </span>
            </div>
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={startFlow}
            >
              <Play className="w-3.5 h-3.5" /> Start Daily Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
